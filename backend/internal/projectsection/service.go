package projectsection

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

var (
	ErrRequiredFields    = errors.New("code and name are required")
	ErrCodeAlreadyExists = errors.New("project section with that code already exists")
	ErrSectionNotFound   = errors.New("project section not found")
	ErrSectionInUse      = errors.New("cannot delete project section: referenced by existing projects")
)

type Service interface {
	List(q string) ([]ProjectSectionDTO, error)
	Create(input CreateProjectSectionInput) (*ProjectSectionDTO, error)
	Update(id uint, input UpdateProjectSectionInput) (*ProjectSectionDTO, error)
	Delete(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(q string) ([]ProjectSectionDTO, error) {
	items, err := s.repo.List(strings.TrimSpace(q))
	if err != nil {
		return nil, err
	}
	data := make([]ProjectSectionDTO, len(items))
	for i := range items {
		data[i] = toDTO(&items[i])
	}
	return data, nil
}

func (s *service) Create(input CreateProjectSectionInput) (*ProjectSectionDTO, error) {
	code := strings.TrimSpace(input.Code)
	name := strings.TrimSpace(input.Name)
	if code == "" || name == "" {
		return nil, ErrRequiredFields
	}
	if existing, err := s.repo.FindByCode(code, nil); err == nil && existing != nil {
		return nil, ErrCodeAlreadyExists
	}

	section := domain.ProjectSectionRecord{Code: code, Name: name}
	if err := s.repo.Create(&section); err != nil {
		return nil, err
	}
	dto := toDTO(&section)
	return &dto, nil
}

func (s *service) Update(id uint, input UpdateProjectSectionInput) (*ProjectSectionDTO, error) {
	section, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSectionNotFound
		}
		return nil, err
	}

	oldCode := section.Code
	if input.Code != nil {
		code := strings.TrimSpace(*input.Code)
		if code == "" {
			return nil, ErrRequiredFields
		}
		if existing, err := s.repo.FindByCode(code, &id); err == nil && existing != nil {
			return nil, ErrCodeAlreadyExists
		}
		section.Code = code
	}
	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, ErrRequiredFields
		}
		section.Name = name
	}

	if err := s.repo.Update(section); err != nil {
		return nil, err
	}
	if section.Code != oldCode {
		if err := s.repo.RenameCode(oldCode, section.Code); err != nil {
			return nil, err
		}
	}

	dto := toDTO(section)
	return &dto, nil
}

func (s *service) Delete(id uint) error {
	section, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSectionNotFound
		}
		return err
	}
	n, err := s.repo.CountReferences(section.Code)
	if err != nil {
		return err
	}
	if n > 0 {
		return ErrSectionInUse
	}
	deleted, err := s.repo.Delete(id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrSectionNotFound
	}
	return nil
}
