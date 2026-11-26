package model

import (
	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type Group struct {
	gorm.Model
	Code string `gorm:"not null"`
	Name string `gorm:"not null;default:''"`
}

func (Group) TableName() string {
	return "groups"
}

func (g *Group) ToDomain() *domain.Group {
	if g == nil {
		return nil
	}
	return &domain.Group{
		ID:        g.ID,
		CreatedAt: g.CreatedAt,
		UpdatedAt: g.UpdatedAt,
		Code:      g.Code,
		Name:      g.Name,
	}
}

func FromGroupDomain(d *domain.Group) *Group {
	g := &Group{
		Code: d.Code,
		Name: d.Name,
	}
	g.ID = d.ID
	g.CreatedAt = d.CreatedAt
	g.UpdatedAt = d.UpdatedAt
	return g
}
