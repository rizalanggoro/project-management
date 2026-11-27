package model

import (
	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type ProjectSection struct {
	gorm.Model
	Code string `gorm:"uniqueIndex;not null"`
	Name string `gorm:"not null;default:''"`
}

func (ProjectSection) TableName() string {
	return "project_sections"
}

func (s *ProjectSection) ToDomain() *domain.ProjectSectionRecord {
	if s == nil {
		return nil
	}
	return &domain.ProjectSectionRecord{
		ID:        s.ID,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
		Code:      s.Code,
		Name:      s.Name,
	}
}

func FromProjectSectionDomain(d *domain.ProjectSectionRecord) *ProjectSection {
	s := &ProjectSection{
		Code: d.Code,
		Name: d.Name,
	}
	s.ID = d.ID
	s.CreatedAt = d.CreatedAt
	s.UpdatedAt = d.UpdatedAt
	return s
}
