package projectplant

import (
	"errors"

	"github.com/gofiber/fiber/v3"

	"musashi/backend/internal/platform/httperr"
	"musashi/backend/utils"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// List godoc
// @id          listProjectPlants
// @Summary     List project plants
// @Tags        project-plants
// @Produce     json
// @Success     200 {array} ProjectPlantDTO
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-plants [get]
func (h *Handler) List(c fiber.Ctx) error {
	data, err := h.svc.List(c.Query("q"))
	if err != nil {
		return httperr.Internal(c, "Failed to fetch project plants")
	}
	return c.JSON(data)
}

// Create godoc
// @id          createProjectPlant
// @Summary     Create project plant
// @Tags        project-plants
// @Accept      json
// @Produce     json
// @Param       body body CreateProjectPlantInput true "Project plant input"
// @Success     201 {object} ProjectPlantDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-plants [post]
func (h *Handler) Create(c fiber.Ctx) error {
	var input CreateProjectPlantInput
	if err := c.Bind().Body(&input); err != nil {
		return httperr.BadRequest(c, "Invalid request body", nil)
	}
	dto, err := h.svc.Create(input)
	if err != nil {
		switch {
		case errors.Is(err, ErrRequiredFields):
			return httperr.BadRequest(c, err.Error(), nil)
		case errors.Is(err, ErrCodeAlreadyExists):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to create project plant")
		}
	}
	return c.Status(fiber.StatusCreated).JSON(dto)
}

// Update godoc
// @id          updateProjectPlant
// @Summary     Update project plant
// @Tags        project-plants
// @Accept      json
// @Produce     json
// @Param       id path string true "Project plant ID"
// @Param       body body UpdateProjectPlantInput true "Project plant update data"
// @Success     200 {object} ProjectPlantDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-plants/{id} [put]
func (h *Handler) Update(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid project plant ID", nil)
	}
	var input UpdateProjectPlantInput
	if err := c.Bind().Body(&input); err != nil {
		return httperr.BadRequest(c, "Invalid request body", nil)
	}
	dto, err := h.svc.Update(id, input)
	if err != nil {
		switch {
		case errors.Is(err, ErrRequiredFields):
			return httperr.BadRequest(c, err.Error(), nil)
		case errors.Is(err, ErrPlantNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrCodeAlreadyExists):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to update project plant")
		}
	}
	return c.JSON(dto)
}

// Delete godoc
// @id          deleteProjectPlant
// @Summary     Delete project plant
// @Tags        project-plants
// @Param       id path string true "Project plant ID"
// @Success     204
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-plants/{id} [delete]
func (h *Handler) Delete(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid project plant ID", nil)
	}
	if err := h.svc.Delete(id); err != nil {
		switch {
		case errors.Is(err, ErrPlantNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrPlantInUse):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to delete project plant")
		}
	}
	return c.SendStatus(fiber.StatusNoContent)
}
