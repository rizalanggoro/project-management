package projectplant

import (
	"musashi/backend/internal/domain"
	"musashi/backend/utils"
)

type ProjectPlantDTO struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

type CreateProjectPlantInput struct {
	Code string `json:"code" example:"Cikarang" validate:"required"`
	Name string `json:"name" example:"Cikarang" validate:"required"`
}

type UpdateProjectPlantInput struct {
	Code *string `json:"code,omitempty" example:"Cikarang"`
	Name *string `json:"name,omitempty" example:"Cikarang"`
}

func toDTO(p *domain.ProjectPlantRecord) ProjectPlantDTO {
	return ProjectPlantDTO{
		ID:   utils.FormatID(p.ID),
		Code: p.Code,
		Name: p.Name,
	}
}
