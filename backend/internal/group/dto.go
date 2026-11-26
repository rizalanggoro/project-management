package group

import (
	"musashi/backend/internal/domain"
	"musashi/backend/utils"
)

type GroupDTO struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

type CreateGroupInput struct {
	Code string `json:"code" example:"C" validate:"required"`
	Name string `json:"name" example:"Pekerjaan Finishing"`
}

type UpdateGroupInput struct {
	Code *string `json:"code,omitempty" example:"C"`
	Name *string `json:"name,omitempty" example:"Pekerjaan Finishing"`
}

func toDTO(g *domain.Group) GroupDTO {
	return GroupDTO{
		ID:   utils.FormatID(g.ID),
		Code: g.Code,
		Name: g.Name,
	}
}
