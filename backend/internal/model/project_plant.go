package model

import (
	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type ProjectPlant struct {
	gorm.Model
	Code string `gorm:"uniqueIndex;not null"`
	Name string `gorm:"not null;default:''"`
}

func (ProjectPlant) TableName() string {
	return "project_plants"
}

func (p *ProjectPlant) ToDomain() *domain.ProjectPlantRecord {
	if p == nil {
		return nil
	}
	return &domain.ProjectPlantRecord{
		ID:        p.ID,
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
		Code:      p.Code,
		Name:      p.Name,
	}
}

func FromProjectPlantDomain(d *domain.ProjectPlantRecord) *ProjectPlant {
	p := &ProjectPlant{
		Code: d.Code,
		Name: d.Name,
	}
	p.ID = d.ID
	p.CreatedAt = d.CreatedAt
	p.UpdatedAt = d.UpdatedAt
	return p
}
