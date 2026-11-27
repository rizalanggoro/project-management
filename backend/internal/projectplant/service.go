package projectplant

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

var (
	ErrRequiredFields    = errors.New("code and name are required")
	ErrCodeAlreadyExists = errors.New("project plant with that code already exists")
	ErrPlantNotFound     = errors.New("project plant not found")
	ErrPlantInUse        = errors.New("cannot delete project plant: referenced by existing projects")
)

type Service interface {
	List(q string) ([]ProjectPlantDTO, error)
	Create(input CreateProjectPlantInput) (*ProjectPlantDTO, error)
	Update(id uint, input UpdateProjectPlantInput) (*ProjectPlantDTO, error)
	Delete(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(q string) ([]ProjectPlantDTO, error) {
	items, err := s.repo.List(strings.TrimSpace(q))
	if err != nil {
		return nil, err
	}
	data := make([]ProjectPlantDTO, len(items))
	for i := range items {
		data[i] = toDTO(&items[i])
	}
	return data, nil
}

func (s *service) Create(input CreateProjectPlantInput) (*ProjectPlantDTO, error) {
	code := strings.TrimSpace(input.Code)
	name := strings.TrimSpace(input.Name)
	if code == "" || name == "" {
		return nil, ErrRequiredFields
	}
	if existing, err := s.repo.FindByCode(code, nil); err == nil && existing != nil {
		return nil, ErrCodeAlreadyExists
	}

	plant := domain.ProjectPlantRecord{Code: code, Name: name}
	if err := s.repo.Create(&plant); err != nil {
		return nil, err
	}
	dto := toDTO(&plant)
	return &dto, nil
}

func (s *service) Update(id uint, input UpdateProjectPlantInput) (*ProjectPlantDTO, error) {
	plant, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlantNotFound
		}
		return nil, err
	}

	oldCode := plant.Code
	if input.Code != nil {
		code := strings.TrimSpace(*input.Code)
		if code == "" {
			return nil, ErrRequiredFields
		}
		if existing, err := s.repo.FindByCode(code, &id); err == nil && existing != nil {
			return nil, ErrCodeAlreadyExists
		}
		plant.Code = code
	}
	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, ErrRequiredFields
		}
		plant.Name = name
	}

	if err := s.repo.Update(plant); err != nil {
		return nil, err
	}
	if plant.Code != oldCode {
		if err := s.repo.RenameCode(oldCode, plant.Code); err != nil {
			return nil, err
		}
	}

	dto := toDTO(plant)
	return &dto, nil
}

func (s *service) Delete(id uint) error {
	plant, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPlantNotFound
		}
		return err
	}
	n, err := s.repo.CountReferences(plant.Code)
	if err != nil {
		return err
	}
	if n > 0 {
		return ErrPlantInUse
	}
	deleted, err := s.repo.Delete(id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrPlantNotFound
	}
	return nil
}
