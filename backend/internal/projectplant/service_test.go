package projectplant

import (
	"errors"
	"strconv"
	"strings"
	"testing"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type mockRepo struct {
	items      map[uint]*domain.ProjectPlantRecord
	references int64
	nextID     uint
}

func newMockRepo() *mockRepo {
	return &mockRepo{
		items:  map[uint]*domain.ProjectPlantRecord{},
		nextID: 1,
	}
}

func (m *mockRepo) List(q string) ([]domain.ProjectPlantRecord, error) {
	items := make([]domain.ProjectPlantRecord, 0, len(m.items))
	for _, item := range m.items {
		if q == "" || strings.Contains(strings.ToLower(item.Code), strings.ToLower(q)) ||
			strings.Contains(strings.ToLower(item.Name), strings.ToLower(q)) {
			items = append(items, *item)
		}
	}
	return items, nil
}

func (m *mockRepo) FindByID(id uint) (*domain.ProjectPlantRecord, error) {
	if item, ok := m.items[id]; ok {
		return item, nil
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockRepo) FindByCode(code string, excludeID *uint) (*domain.ProjectPlantRecord, error) {
	for id, item := range m.items {
		if excludeID != nil && id == *excludeID {
			continue
		}
		if strings.EqualFold(item.Code, code) {
			return item, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockRepo) Create(item *domain.ProjectPlantRecord) error {
	item.ID = m.nextID
	m.nextID++
	m.items[item.ID] = item
	return nil
}

func (m *mockRepo) Update(item *domain.ProjectPlantRecord) error {
	m.items[item.ID] = item
	return nil
}

func (m *mockRepo) RenameCode(oldCode, newCode string) error {
	return nil
}

func (m *mockRepo) CountReferences(code string) (int64, error) {
	return m.references, nil
}

func (m *mockRepo) Delete(id uint) (bool, error) {
	if _, ok := m.items[id]; !ok {
		return false, nil
	}
	delete(m.items, id)
	return true, nil
}

func parseTestID(t *testing.T, id string) uint {
	t.Helper()
	n, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		t.Fatalf("invalid ID %q: %v", id, err)
	}
	return uint(n)
}

func TestProjectPlantService(t *testing.T) {
	t.Run("create trims input and rejects duplicates", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(repo)

		created, err := svc.Create(CreateProjectPlantInput{Code: "  Cikarang  ", Name: " Cikarang "})
		if err != nil || created.Code != "Cikarang" || created.Name != "Cikarang" {
			t.Fatalf("unexpected create result: %+v, err: %v", created, err)
		}

		_, err = svc.Create(CreateProjectPlantInput{Code: "cikarang", Name: "Duplicate"})
		if !errors.Is(err, ErrCodeAlreadyExists) {
			t.Fatalf("expected ErrCodeAlreadyExists, got %v", err)
		}

		_, err = svc.Create(CreateProjectPlantInput{Code: " ", Name: "Empty"})
		if !errors.Is(err, ErrRequiredFields) {
			t.Fatalf("expected ErrRequiredFields, got %v", err)
		}
	})

	t.Run("list and filter", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(repo)
		if _, err := svc.Create(CreateProjectPlantInput{Code: "Karawang", Name: "Karawang Plant"}); err != nil {
			t.Fatal(err)
		}
		all, err := svc.List("")
		if err != nil || len(all) != 1 {
			t.Fatalf("unexpected list: %+v, err: %v", all, err)
		}
		filtered, err := svc.List("plant")
		if err != nil || len(filtered) != 1 || filtered[0].Code != "Karawang" {
			t.Fatalf("unexpected filter: %+v, err: %v", filtered, err)
		}
	})

	t.Run("update and not found", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(repo)
		created, err := svc.Create(CreateProjectPlantInput{Code: "Karawang", Name: "Karawang"})
		if err != nil {
			t.Fatal(err)
		}

		name := "Karawang Plant"
		updated, err := svc.Update(parseTestID(t, created.ID), UpdateProjectPlantInput{Name: &name})
		if err != nil || updated.Name != name {
			t.Fatalf("unexpected update: %+v, err: %v", updated, err)
		}

		_, err = svc.Update(999, UpdateProjectPlantInput{Name: &name})
		if !errors.Is(err, ErrPlantNotFound) {
			t.Fatalf("expected ErrPlantNotFound, got %v", err)
		}
	})

	t.Run("delete guards references", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(repo)
		created, err := svc.Create(CreateProjectPlantInput{Code: "Karawang", Name: "Karawang"})
		if err != nil {
			t.Fatal(err)
		}

		repo.references = 1
		if err := svc.Delete(parseTestID(t, created.ID)); !errors.Is(err, ErrPlantInUse) {
			t.Fatalf("expected ErrPlantInUse, got %v", err)
		}

		repo.references = 0
		if err := svc.Delete(parseTestID(t, created.ID)); err != nil {
			t.Fatalf("unexpected delete error: %v", err)
		}
		if err := svc.Delete(parseTestID(t, created.ID)); !errors.Is(err, ErrPlantNotFound) {
			t.Fatalf("expected ErrPlantNotFound, got %v", err)
		}
	})
}
