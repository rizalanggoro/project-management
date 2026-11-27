package projectsection

import (
	"musashi/backend/internal/domain"
	"musashi/backend/utils"
)

type ProjectSectionDTO struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

type CreateProjectSectionInput struct {
	Code string `json:"code" example:"GA Building" validate:"required"`
	Name string `json:"name" example:"GA Building" validate:"required"`
}

type UpdateProjectSectionInput struct {
	Code *string `json:"code,omitempty" example:"GA Building"`
	Name *string `json:"name,omitempty" example:"GA Building"`
}

func toDTO(s *domain.ProjectSectionRecord) ProjectSectionDTO {
	return ProjectSectionDTO{
		ID:   utils.FormatID(s.ID),
		Code: s.Code,
		Name: s.Name,
	}
}
