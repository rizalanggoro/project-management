package group

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

var (
	ErrRequiredFields    = errors.New("code and name are required")
	ErrCodeAlreadyExists = errors.New("group with that code already exists")
	ErrGroupNotFound     = errors.New("group not found")
	ErrGroupInUse        = errors.New("cannot delete group: referenced by existing items")
)

type Service interface {
	List(q string) ([]GroupDTO, error)
	Create(input CreateGroupInput) (*GroupDTO, error)
	Update(id uint, input UpdateGroupInput) (*GroupDTO, error)
	Delete(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(q string) ([]GroupDTO, error) {
	items, err := s.repo.List(strings.TrimSpace(q))
	if err != nil {
		return nil, err
	}
	data := make([]GroupDTO, len(items))
	for i := range items {
		data[i] = toDTO(&items[i])
	}
	return data, nil
}

func (s *service) Create(input CreateGroupInput) (*GroupDTO, error) {
	code := strings.TrimSpace(input.Code)
	name := strings.TrimSpace(input.Name)
	if code == "" || name == "" {
		return nil, ErrRequiredFields
	}
	if existing, err := s.repo.FindByCode(code, nil); err == nil && existing != nil {
		return nil, ErrCodeAlreadyExists
	}

	g := domain.Group{Code: code, Name: name}
	if err := s.repo.Create(&g); err != nil {
		return nil, err
	}
	dto := toDTO(&g)
	return &dto, nil
}

func (s *service) Update(id uint, input UpdateGroupInput) (*GroupDTO, error) {
	g, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	oldCode := g.Code
	if input.Code != nil {
		code := strings.TrimSpace(*input.Code)
		if code == "" {
			return nil, ErrRequiredFields
		}
		if existing, err := s.repo.FindByCode(code, &id); err == nil && existing != nil {
			return nil, ErrCodeAlreadyExists
		}
		g.Code = code
	}
	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, ErrRequiredFields
		}
		g.Name = name
	}

	if err := s.repo.Update(g); err != nil {
		return nil, err
	}
	if g.Code != oldCode {
		if err := s.repo.RenameCode(oldCode, g.Code); err != nil {
			return nil, err
		}
	}

	dto := toDTO(g)
	return &dto, nil
}

func (s *service) Delete(id uint) error {
	g, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGroupNotFound
		}
		return err
	}
	n, err := s.repo.CountReferences(g.Code)
	if err != nil {
		return err
	}
	if n > 0 {
		return ErrGroupInUse
	}
	deleted, err := s.repo.Delete(id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrGroupNotFound
	}
	return nil
}
