package unitpricecategory

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

var (
	ErrRequiredFields    = errors.New("code and name are required")
	ErrCodeAlreadyExists = errors.New("unit price category with that code already exists")
	ErrCategoryNotFound  = errors.New("unit price category not found")
	ErrCategoryInUse     = errors.New("cannot delete unit price category: referenced by existing unit prices")
)

type Service interface {
	List() ([]UnitPriceCategoryDTO, error)
	Create(input CreateUnitPriceCategoryInput) (*UnitPriceCategoryDTO, error)
	Update(id uint, input UpdateUnitPriceCategoryInput) (*UnitPriceCategoryDTO, error)
	Delete(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List() ([]UnitPriceCategoryDTO, error) {
	items, err := s.repo.List()
	if err != nil {
		return nil, err
	}
	data := make([]UnitPriceCategoryDTO, len(items))
	for i := range items {
		data[i] = toDTO(&items[i])
	}
	return data, nil
}

func normalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}

func normalizePrefix(prefix string) string {
	prefix = strings.ToUpper(strings.TrimSpace(prefix))
	if prefix == "" {
		return "UP"
	}
	return prefix
}

func (s *service) Create(input CreateUnitPriceCategoryInput) (*UnitPriceCategoryDTO, error) {
	code := normalizeCode(input.Code)
	name := strings.TrimSpace(input.Name)
	if code == "" || name == "" {
		return nil, ErrRequiredFields
	}
	if existing, err := s.repo.FindByCode(code, nil); err == nil && existing != nil {
		return nil, ErrCodeAlreadyExists
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	c := domain.UnitPriceCategoryRecord{
		Code:       code,
		Name:       name,
		CodePrefix: normalizePrefix(input.CodePrefix),
		SortOrder:  input.SortOrder,
		IsActive:   isActive,
	}
	if err := s.repo.Create(&c); err != nil {
		return nil, err
	}
	dto := toDTO(&c)
	return &dto, nil
}

func (s *service) Update(id uint, input UpdateUnitPriceCategoryInput) (*UnitPriceCategoryDTO, error) {
	c, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	if input.Code != nil {
		code := normalizeCode(*input.Code)
		if code == "" {
			return nil, ErrRequiredFields
		}
		if existing, err := s.repo.FindByCode(code, &id); err == nil && existing != nil {
			return nil, ErrCodeAlreadyExists
		}
		c.Code = code
	}
	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, ErrRequiredFields
		}
		c.Name = name
	}
	if input.CodePrefix != nil {
		c.CodePrefix = normalizePrefix(*input.CodePrefix)
	}
	if input.SortOrder != nil {
		c.SortOrder = *input.SortOrder
	}
	if input.IsActive != nil {
		c.IsActive = *input.IsActive
	}

	if err := s.repo.Update(c); err != nil {
		return nil, err
	}
	dto := toDTO(c)
	return &dto, nil
}

func (s *service) Delete(id uint) error {
	c, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCategoryNotFound
		}
		return err
	}
	count, err := s.repo.CountReferences(c.Code)
	if err != nil {
		return err
	}
	if count > 0 {
		return ErrCategoryInUse
	}
	deleted, err := s.repo.Delete(id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrCategoryNotFound
	}
	return nil
}
