package projectsection

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
// @id          listProjectSections
// @Summary     List project sections
// @Tags        project-sections
// @Produce     json
// @Success     200 {array} ProjectSectionDTO
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-sections [get]
func (h *Handler) List(c fiber.Ctx) error {
	data, err := h.svc.List(c.Query("q"))
	if err != nil {
		return httperr.Internal(c, "Failed to fetch project sections")
	}
	return c.JSON(data)
}

// Create godoc
// @id          createProjectSection
// @Summary     Create project section
// @Tags        project-sections
// @Accept      json
// @Produce     json
// @Param       body body CreateProjectSectionInput true "Project section input"
// @Success     201 {object} ProjectSectionDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-sections [post]
func (h *Handler) Create(c fiber.Ctx) error {
	var input CreateProjectSectionInput
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
			return httperr.Internal(c, "Failed to create project section")
		}
	}
	return c.Status(fiber.StatusCreated).JSON(dto)
}

// Update godoc
// @id          updateProjectSection
// @Summary     Update project section
// @Tags        project-sections
// @Accept      json
// @Produce     json
// @Param       id path string true "Project section ID"
// @Param       body body UpdateProjectSectionInput true "Project section update data"
// @Success     200 {object} ProjectSectionDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-sections/{id} [put]
func (h *Handler) Update(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid project section ID", nil)
	}
	var input UpdateProjectSectionInput
	if err := c.Bind().Body(&input); err != nil {
		return httperr.BadRequest(c, "Invalid request body", nil)
	}
	dto, err := h.svc.Update(id, input)
	if err != nil {
		switch {
		case errors.Is(err, ErrRequiredFields):
			return httperr.BadRequest(c, err.Error(), nil)
		case errors.Is(err, ErrSectionNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrCodeAlreadyExists):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to update project section")
		}
	}
	return c.JSON(dto)
}

// Delete godoc
// @id          deleteProjectSection
// @Summary     Delete project section
// @Tags        project-sections
// @Param       id path string true "Project section ID"
// @Success     204
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /project-sections/{id} [delete]
func (h *Handler) Delete(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid project section ID", nil)
	}
	if err := h.svc.Delete(id); err != nil {
		switch {
		case errors.Is(err, ErrSectionNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrSectionInUse):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to delete project section")
		}
	}
	return c.SendStatus(fiber.StatusNoContent)
}
