package unitpricecategory

import (
	"errors"
	"testing"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type mockRepo struct {
	items      map[uint]*domain.UnitPriceCategoryRecord
	references int64
	nextID     uint
}

func newMockRepo() *mockRepo {
	return &mockRepo{items: map[uint]*domain.UnitPriceCategoryRecord{}, nextID: 1}
}

func (m *mockRepo) List() ([]domain.UnitPriceCategoryRecord, error) {
	items := make([]domain.UnitPriceCategoryRecord, 0, len(m.items))
	for _, c := range m.items {
		items = append(items, *c)
	}
	return items, nil
}

func (m *mockRepo) FindByID(id uint) (*domain.UnitPriceCategoryRecord, error) {
	if c, ok := m.items[id]; ok {
		return c, nil
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockRepo) FindByCode(code string, excludeID *uint) (*domain.UnitPriceCategoryRecord, error) {
	for id, c := range m.items {
		if excludeID != nil && id == *excludeID {
			continue
		}
		if c.Code == code {
			return c, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockRepo) CountReferences(code string) (int64, error) {
	return m.references, nil
}

func (m *mockRepo) Create(c *domain.UnitPriceCategoryRecord) error {
	c.ID = m.nextID
	m.nextID++
	m.items[c.ID] = c
	return nil
}

func (m *mockRepo) Update(c *domain.UnitPriceCategoryRecord) error {
	m.items[c.ID] = c
	return nil
}

func (m *mockRepo) Delete(id uint) (bool, error) {
	if _, ok := m.items[id]; !ok {
		return false, nil
	}
	delete(m.items, id)
	return true, nil
}

func TestUnitPriceCategoryService(t *testing.T) {
	repo := newMockRepo()
	svc := NewService(repo)

	created, err := svc.Create(CreateUnitPriceCategoryInput{Code: " labor ", Name: "Tenaga Kerja", CodePrefix: "lbr"})
	if err != nil || created.Code != "LABOR" || created.CodePrefix != "LBR" || !created.IsActive {
		t.Fatalf("unexpected create: %+v, err: %v", created, err)
	}

	if _, err := svc.Create(CreateUnitPriceCategoryInput{Code: "LABOR", Name: "Duplicate"}); !errors.Is(err, ErrCodeAlreadyExists) {
		t.Fatalf("expected ErrCodeAlreadyExists, got %v", err)
	}

	defaultPrefix, err := svc.Create(CreateUnitPriceCategoryInput{Code: "SUBCON", Name: "Subkon"})
	if err != nil || defaultPrefix.CodePrefix != "UP" {
		t.Fatalf("expected default prefix UP, got %+v, err: %v", defaultPrefix, err)
	}

	repo.references = 2
	if err := svc.Delete(1); !errors.Is(err, ErrCategoryInUse) {
		t.Fatalf("expected ErrCategoryInUse, got %v", err)
	}

	repo.references = 0
	if err := svc.Delete(1); err != nil {
		t.Fatalf("expected success, got %v", err)
	}
}
