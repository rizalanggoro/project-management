package unitpricecategory

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
// @id          listUnitPriceCategories
// @Summary     List unit price categories
// @Tags        unit-price-categories
// @Produce     json
// @Success     200 {array} UnitPriceCategoryDTO
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /unit-price-categories [get]
func (h *Handler) List(c fiber.Ctx) error {
	data, err := h.svc.List()
	if err != nil {
		return httperr.Internal(c, "Failed to fetch unit price categories")
	}
	return c.JSON(data)
}

// Create godoc
// @id          createUnitPriceCategory
// @Summary     Create unit price category
// @Tags        unit-price-categories
// @Accept      json
// @Produce     json
// @Param       body body CreateUnitPriceCategoryInput true "Category input"
// @Success     201 {object} UnitPriceCategoryDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /unit-price-categories [post]
func (h *Handler) Create(c fiber.Ctx) error {
	var input CreateUnitPriceCategoryInput
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
			return httperr.Internal(c, "Failed to create unit price category")
		}
	}
	return c.Status(fiber.StatusCreated).JSON(dto)
}

// Update godoc
// @id          updateUnitPriceCategory
// @Summary     Update unit price category
// @Tags        unit-price-categories
// @Accept      json
// @Produce     json
// @Param       id path string true "Category ID"
// @Param       body body UpdateUnitPriceCategoryInput true "Category update data"
// @Success     200 {object} UnitPriceCategoryDTO
// @Failure     400 {object} httperr.ErrorResponse
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /unit-price-categories/{id} [put]
func (h *Handler) Update(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid category ID", nil)
	}
	var input UpdateUnitPriceCategoryInput
	if err := c.Bind().Body(&input); err != nil {
		return httperr.BadRequest(c, "Invalid request body", nil)
	}
	dto, err := h.svc.Update(id, input)
	if err != nil {
		switch {
		case errors.Is(err, ErrRequiredFields):
			return httperr.BadRequest(c, err.Error(), nil)
		case errors.Is(err, ErrCategoryNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrCodeAlreadyExists):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to update unit price category")
		}
	}
	return c.JSON(dto)
}

// Delete godoc
// @id          deleteUnitPriceCategory
// @Summary     Delete unit price category
// @Tags        unit-price-categories
// @Param       id path string true "Category ID"
// @Success     204 "No Content"
// @Failure     404 {object} httperr.ErrorResponse
// @Failure     409 {object} httperr.ErrorResponse
// @Failure     500 {object} httperr.ErrorResponse
// @Router      /unit-price-categories/{id} [delete]
func (h *Handler) Delete(c fiber.Ctx) error {
	id, err := utils.ParseID(c.Params("id"))
	if err != nil {
		return httperr.BadRequest(c, "Invalid category ID", nil)
	}
	if err := h.svc.Delete(id); err != nil {
		switch {
		case errors.Is(err, ErrCategoryNotFound):
			return httperr.NotFound(c, err.Error())
		case errors.Is(err, ErrCategoryInUse):
			return httperr.Conflict(c, err.Error())
		default:
			return httperr.Internal(c, "Failed to delete unit price category")
		}
	}
	return c.SendStatus(fiber.StatusNoContent)
}
