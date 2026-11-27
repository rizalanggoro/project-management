package model

import (
	"gorm.io/gorm"

	"musashi/backend/internal/domain"
)

type UnitPriceCategory struct {
	gorm.Model
	Code       string `gorm:"uniqueIndex;not null"`
	Name       string `gorm:"not null;default:''"`
	CodePrefix string `gorm:"not null;default:'UP'"`
	SortOrder  int    `gorm:"not null;default:0"`
	IsActive   bool   `gorm:"not null;default:true"`
}

func (UnitPriceCategory) TableName() string {
	return "unit_price_categories"
}

func (c *UnitPriceCategory) ToDomain() *domain.UnitPriceCategoryRecord {
	if c == nil {
		return nil
	}
	return &domain.UnitPriceCategoryRecord{
		ID:         c.ID,
		CreatedAt:  c.CreatedAt,
		UpdatedAt:  c.UpdatedAt,
		Code:       c.Code,
		Name:       c.Name,
		CodePrefix: c.CodePrefix,
		SortOrder:  c.SortOrder,
		IsActive:   c.IsActive,
	}
}

func FromUnitPriceCategoryDomain(d *domain.UnitPriceCategoryRecord) *UnitPriceCategory {
	if d == nil {
		return nil
	}
	c := &UnitPriceCategory{
		Code:       d.Code,
		Name:       d.Name,
		CodePrefix: d.CodePrefix,
		SortOrder:  d.SortOrder,
		IsActive:   d.IsActive,
	}
	c.ID = d.ID
	c.CreatedAt = d.CreatedAt
	c.UpdatedAt = d.UpdatedAt
	return c
}
