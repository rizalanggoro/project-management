package group

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
// @id          listGroups
// @Summary     List work item groups
// @Tags        groups
// @Produce     json
// @Success     200 {array} GroupDTO
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /groups [get]
func (h *Handler) List(c fiber.Ctx) error {
	data, err := h.svc.List(c.Query("q"))
	if err != nil {
		return httperr.Internal(c, "Failed to fetch groups")
	}
	return c.JSON(data)
}

// Create godoc
// @id          createGroup
// @Summary     Create work item group
// @Tags        groups
// @Accept      json
// @Produce     json
// @Param       body body CreateGroupInput true "Group input"
// @Success     201 {object} GroupDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /groups [post]
func (h *Handler) Create(c fiber.Ctx) error {
	var input CreateGroupInput
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
			return httperr.Internal(c, "Failed to create group")
		}
	}
	return c.Status(fiber.StatusCreated).JSON(dto)
}

// Update godoc
// @id          updateGroup
// @Summary     Update work item group
// @Tags        groups
// @Accept      json
// @Produce     json
// @Param       id path string true "Group ID"
// @Param       body body UpdateGroupInput true "Group update data"
// @Success     200 {object} GroupDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /groups/{id} [put]
func (h *Handler) Update(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid group ID", nil)
	}
	var input UpdateGroupInput
	if err := c.Bind().Body(&input); err != nil {
		return httperr.BadRequest(c, "Invalid request body", nil)
	}
	dto, err := h.svc.Update(id, input)
	if err != nil {
		switch {
		case errors.Is(err, ErrRequiredFields):
			return httperr.BadRequest(c, err.Error(), nil)
		case errors.Is(err, ErrGroupNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrCodeAlreadyExists):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to update group")
		}
	}
	return c.JSON(dto)
}

// Delete godoc
// @id          deleteGroup
// @Summary     Delete work item group
// @Tags        groups
// @Param       id path string true "Group ID"
// @Success     204
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /groups/{id} [delete]
func (h *Handler) Delete(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid group ID", nil)
	}
	if err := h.svc.Delete(id); err != nil {
		switch {
		case errors.Is(err, ErrGroupNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrGroupInUse):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to delete group")
		}
	}
	return c.SendStatus(fiber.StatusNoContent)
}
