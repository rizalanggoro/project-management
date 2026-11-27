package projectsection

import (
	"errors"
	"strconv"
	"strings"
	"testing"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type mockRepo struct {
	items      map[uint]*domain.ProjectSectionRecord
	references int64
	nextID     uint
}

func newMockRepo() *mockRepo {
	return &mockRepo{
		items:  map[uint]*domain.ProjectSectionRecord{},
		nextID: 1,
	}
}

func (m *mockRepo) List(_ *gorm.DB, opts ListOptions) ([]domain.ProjectSectionRecord, error) {
	q := opts.Keyword
	items := make([]domain.ProjectSectionRecord, 0, len(m.items))
	for _, item := range m.items {
		if q == "" || strings.Contains(strings.ToLower(item.Code), strings.ToLower(q)) ||
			strings.Contains(strings.ToLower(item.Name), strings.ToLower(q)) {
			items = append(items, *item)
		}
	}
	return items, nil
}

func (m *mockRepo) Find(_ *gorm.DB, opts FindOptions) (*domain.ProjectSectionRecord, error) {
	if opts.ID != nil {
		if item, ok := m.items[*opts.ID]; ok {
			return item, nil
		}
		return nil, gorm.ErrRecordNotFound
	}
	for id, item := range m.items {
		if opts.ExcludeID != nil && id == *opts.ExcludeID {
			continue
		}
		if strings.EqualFold(item.Code, *opts.Code) {
			return item, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockRepo) Create(_ *gorm.DB, item *domain.ProjectSectionRecord) error {
	item.ID = m.nextID
	m.nextID++
	m.items[item.ID] = item
	return nil
}

func (m *mockRepo) Update(_ *gorm.DB, item *domain.ProjectSectionRecord) error {
	m.items[item.ID] = item
	return nil
}

func (m *mockRepo) RenameCode(_ *gorm.DB, oldCode, newCode string) error {
	return nil
}

func (m *mockRepo) CountReferences(_ *gorm.DB, code string) (int64, error) {
	return m.references, nil
}

func (m *mockRepo) Delete(_ *gorm.DB, id uint) (bool, error) {
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

func TestProjectSectionService(t *testing.T) {
	t.Run("create trims input and rejects duplicates", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(nil, repo)

		created, err := svc.Create(CreateProjectSectionInput{Code: "  GA Building  ", Name: " GA Building "})
		if err != nil || created.Code != "GA Building" || created.Name != "GA Building" {
			t.Fatalf("unexpected create result: %+v, err: %v", created, err)
		}

		_, err = svc.Create(CreateProjectSectionInput{Code: "ga building", Name: "Duplicate"})
		if !errors.Is(err, ErrCodeAlreadyExists) {
			t.Fatalf("expected ErrCodeAlreadyExists, got %v", err)
		}

		_, err = svc.Create(CreateProjectSectionInput{Code: " ", Name: "Empty"})
		if !errors.Is(err, ErrRequiredFields) {
			t.Fatalf("expected ErrRequiredFields, got %v", err)
		}
	})

	t.Run("list and filter", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(nil, repo)
		if _, err := svc.Create(CreateProjectSectionInput{Code: "EHS", Name: "Environment"}); err != nil {
			t.Fatal(err)
		}
		all, err := svc.List("")
		if err != nil || len(all) != 1 {
			t.Fatalf("unexpected list: %+v, err: %v", all, err)
		}
		filtered, err := svc.List("environment")
		if err != nil || len(filtered) != 1 || filtered[0].Code != "EHS" {
			t.Fatalf("unexpected filter: %+v, err: %v", filtered, err)
		}
	})

	t.Run("update and not found", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(nil, repo)
		created, err := svc.Create(CreateProjectSectionInput{Code: "EHS", Name: "Environment"})
		if err != nil {
			t.Fatal(err)
		}

		name := "Health & Safety"
		updated, err := svc.Update(parseTestID(t, created.ID), UpdateProjectSectionInput{Name: &name})
		if err != nil || updated.Name != name {
			t.Fatalf("unexpected update: %+v, err: %v", updated, err)
		}

		_, err = svc.Update(999, UpdateProjectSectionInput{Name: &name})
		if !errors.Is(err, ErrSectionNotFound) {
			t.Fatalf("expected ErrSectionNotFound, got %v", err)
		}
	})

	t.Run("delete guards references", func(t *testing.T) {
		repo := newMockRepo()
		svc := NewService(nil, repo)
		created, err := svc.Create(CreateProjectSectionInput{Code: "EHS", Name: "Environment"})
		if err != nil {
			t.Fatal(err)
		}

		repo.references = 1
		if err := svc.Delete(parseTestID(t, created.ID)); !errors.Is(err, ErrSectionInUse) {
			t.Fatalf("expected ErrSectionInUse, got %v", err)
		}

		repo.references = 0
		if err := svc.Delete(parseTestID(t, created.ID)); err != nil {
			t.Fatalf("unexpected delete error: %v", err)
		}
		if err := svc.Delete(parseTestID(t, created.ID)); !errors.Is(err, ErrSectionNotFound) {
			t.Fatalf("expected ErrSectionNotFound, got %v", err)
		}
	})
}
