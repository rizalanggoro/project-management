package unitpricecategory

import (
	"musashi/backend/internal/domain"
	"musashi/backend/utils"
)

type UnitPriceCategoryDTO struct {
	ID         string `json:"id"`
	Code       string `json:"code"`
	Name       string `json:"name"`
	CodePrefix string `json:"code_prefix"`
	SortOrder  int    `json:"sort_order"`
	IsActive   bool   `json:"is_active"`
}

type CreateUnitPriceCategoryInput struct {
	Code       string `json:"code" example:"LABOR" validate:"required"`
	Name       string `json:"name" example:"Labor" validate:"required"`
	CodePrefix string `json:"code_prefix" example:"LBR"`
	SortOrder  int    `json:"sort_order" example:"0"`
	IsActive   *bool  `json:"is_active,omitempty" example:"true"`
}

type UpdateUnitPriceCategoryInput struct {
	Code       *string `json:"code,omitempty" example:"LABOR"`
	Name       *string `json:"name,omitempty" example:"Tenaga Kerja"`
	CodePrefix *string `json:"code_prefix,omitempty" example:"LBR"`
	SortOrder  *int    `json:"sort_order,omitempty" example:"1"`
	IsActive   *bool   `json:"is_active,omitempty" example:"true"`
}

func toDTO(c *domain.UnitPriceCategoryRecord) UnitPriceCategoryDTO {
	return UnitPriceCategoryDTO{
		ID:         utils.FormatID(c.ID),
		Code:       c.Code,
		Name:       c.Name,
		CodePrefix: c.CodePrefix,
		SortOrder:  c.SortOrder,
		IsActive:   c.IsActive,
	}
}
