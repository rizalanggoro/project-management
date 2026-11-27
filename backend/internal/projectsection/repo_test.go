package projectsection

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"musashi/backend/internal/domain"
	"musashi/backend/internal/model"
)

const testDatabaseName = "musashi_test"

func readEnvFile(path string) map[string]string {
	values := map[string]string{}
	data, err := os.ReadFile(path)
	if err != nil {
		return values
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			values[strings.TrimSpace(parts[0])] = strings.Trim(strings.TrimSpace(parts[1]), `"'`)
		}
	}
	return values
}

func buildTestDSN(values map[string]string, dbName string) string {
	get := func(key, fallback string) string {
		if v := os.Getenv(key); v != "" {
			return v
		}
		if v := values[key]; v != "" {
			return v
		}
		return fallback
	}

	host := get("DB_HOST", "localhost")
	port := get("DB_PORT", "5432")
	user := get("DB_USER", "postgres")
	password := get("DB_PASSWORD", "postgres")
	sslMode := get("DB_SSLMODE", "disable")

	auth := user
	if password != "" {
		auth = user + ":" + url.QueryEscape(password)
	}
	return fmt.Sprintf("postgres://%s@%s:%s/%s?sslmode=%s", auth, host, port, dbName, sslMode)
}

var (
	sharedTestDBOnce sync.Once
	sharedTestDB     *gorm.DB
	sharedTestDBErr  error
)

func connectTestDB() (*gorm.DB, error) {
	config := &gorm.Config{
		Logger:      logger.Default.LogMode(logger.Silent),
		PrepareStmt: true,
	}

	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		values := readEnvFile("../../.env")
		dsn = buildTestDSN(values, testDatabaseName)

		admin, err := gorm.Open(postgres.Open(buildTestDSN(values, "postgres")), config)
		if err == nil {
			var exists bool
			err = admin.Raw("SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ?)", testDatabaseName).Scan(&exists).Error
			if err == nil && !exists {
				_ = admin.Exec("CREATE DATABASE " + testDatabaseName).Error
			}
		}
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, err
	}
	if err := db.Exec("SELECT 1").Error; err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(&model.ProjectSection{}); err != nil {
		return nil, err
	}
	return db, nil
}

// openTestDB returns a transaction that is rolled back after the test. Tests
// skip themselves when no test database is reachable, so `go test ./...` stays
// green on machines without Postgres.
func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	sharedTestDBOnce.Do(func() {
		sharedTestDB, sharedTestDBErr = connectTestDB()
	})
	if sharedTestDBErr != nil {
		t.Skipf("skip repo test: test database unavailable: %v", sharedTestDBErr)
	}

	tx := sharedTestDB.Begin()
	if tx.Error != nil {
		t.Fatalf("begin transaction: %v", tx.Error)
	}
	t.Cleanup(func() { _ = tx.Rollback() })
	return tx
}

func createTestSection(t *testing.T, db *gorm.DB, code, name string) domain.ProjectSectionRecord {
	t.Helper()
	section := domain.ProjectSectionRecord{Code: code, Name: name}
	if err := NewRepository().Create(db, &section); err != nil {
		t.Fatal(err)
	}
	return section
}

func TestFind_EmptyOptions_ReturnsRequiresIDOrCodeError(t *testing.T) {
	// Arrange
	repo := NewRepository()

	// Act
	_, err := repo.Find(nil, FindOptions{})

	// Assert
	if !errors.Is(err, ErrFindRequiresIDOrCode) {
		t.Fatalf("expected ErrFindRequiresIDOrCode, got %v", err)
	}
}

func TestFind_IDAndCodeProvided_ReturnsAmbiguousError(t *testing.T) {
	// Arrange
	repo := NewRepository()
	id, code := uint(1), "EHS"

	// Act
	_, err := repo.Find(nil, FindOptions{ID: &id, Code: &code})

	// Assert
	if !errors.Is(err, ErrFindAmbiguous) {
		t.Fatalf("expected ErrFindAmbiguous, got %v", err)
	}
}

func TestCreate_NewSection_PersistsWithID(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	section := domain.ProjectSectionRecord{Code: "EHS", Name: "Environment"}

	// Act
	err := NewRepository().Create(db, &section)

	// Assert
	if err != nil {
		t.Fatal(err)
	}
	if section.ID == 0 {
		t.Fatal("expected Create to populate ID")
	}
}

func TestFind_ByID_ReturnsExpectedSection(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	created := createTestSection(t, db, "EHS", "Environment")

	// Act
	found, err := NewRepository().Find(db, FindOptions{ID: &created.ID})

	// Assert
	if err != nil || found.Code != "EHS" || found.Name != "Environment" {
		t.Fatalf("unexpected Find result: %+v, err: %v", found, err)
	}
}

func TestFind_ByCode_ReturnsExpectedSection(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	created := createTestSection(t, db, "EHS", "Environment")

	// Act
	found, err := NewRepository().Find(db, FindOptions{Code: stringPtr("EHS")})

	// Assert
	if err != nil || found.ID != created.ID {
		t.Fatalf("unexpected Find result: %+v, err: %v", found, err)
	}
}

func TestFind_ByCodeWithExcludeID_ReturnsNotFound(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	created := createTestSection(t, db, "EHS", "Environment")

	// Act
	_, err := NewRepository().Find(db, FindOptions{
		Code:      stringPtr("EHS"),
		ExcludeID: &created.ID,
	})

	// Assert
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Fatalf("expected ErrRecordNotFound, got %v", err)
	}
}

func TestUpdate_ExistingSection_PersistsChanges(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	repo := NewRepository()
	created := createTestSection(t, db, "EHS", "Environment")
	created.Name = "Health & Safety"

	// Act
	err := repo.Update(db, &created)
	found, findErr := repo.Find(db, FindOptions{ID: &created.ID})

	// Assert
	if err != nil || findErr != nil || found.Name != "Health & Safety" {
		t.Fatalf("unexpected Update result: %+v, err: %v, findErr: %v", found, err, findErr)
	}
}

func TestDelete_ExistingSection_RemovesRecord(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	repo := NewRepository()
	created := createTestSection(t, db, "EHS", "Environment")

	// Act
	deleted, err := repo.Delete(db, created.ID)
	_, findErr := repo.Find(db, FindOptions{ID: &created.ID})

	// Assert
	if err != nil || !deleted {
		t.Fatalf("unexpected Delete result: %v, err: %v", deleted, err)
	}
	if !errors.Is(findErr, gorm.ErrRecordNotFound) {
		t.Fatalf("expected ErrRecordNotFound after Delete, got %v", findErr)
	}
}

func TestList_KeywordProvided_ReturnsMatchingSection(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	repo := NewRepository()
	createTestSection(t, db, "B", "Beta")
	createTestSection(t, db, "A", "Alpha")

	// Act
	result, err := repo.List(db, ListOptions{Keyword: "alpha"})

	// Assert
	if err != nil || len(result) != 1 || result[0].Code != "A" {
		t.Fatalf("unexpected List result: %+v, err: %v", result, err)
	}
}

func TestList_SortByCodeDescending_ReturnsDescendingOrder(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	repo := NewRepository()
	createTestSection(t, db, "A", "Alpha")
	createTestSection(t, db, "B", "Beta")

	// Act
	result, err := repo.List(db, ListOptions{SortBy: "code", SortDir: "desc"})

	// Assert
	if err != nil || len(result) < 2 || result[0].Code != "B" {
		t.Fatalf("unexpected List result: %+v, err: %v", result, err)
	}
}

func TestList_InvalidSortBy_FallsBackToCodeAscending(t *testing.T) {
	// Arrange
	db := openTestDB(t)
	repo := NewRepository()
	createTestSection(t, db, "B", "Beta")
	createTestSection(t, db, "A", "Alpha")

	// Act
	result, err := repo.List(db, ListOptions{SortBy: "unknown"})

	// Assert
	if err != nil || len(result) < 2 || result[0].Code != "A" {
		t.Fatalf("unexpected List result: %+v, err: %v", result, err)
	}
}

func stringPtr(value string) *string {
	return &value
}
