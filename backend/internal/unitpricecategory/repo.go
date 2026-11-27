package unitpricecategory

import (
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
	"musashi/backend/internal/model"
)

type Repository interface {
	List() ([]domain.UnitPriceCategoryRecord, error)
	FindByID(id uint) (*domain.UnitPriceCategoryRecord, error)
	FindByCode(code string, excludeID *uint) (*domain.UnitPriceCategoryRecord, error)
	CountReferences(code string) (int64, error)
	Create(c *domain.UnitPriceCategoryRecord) error
	Update(c *domain.UnitPriceCategoryRecord) error
	Delete(id uint) (bool, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) List() ([]domain.UnitPriceCategoryRecord, error) {
	var models []model.UnitPriceCategory
	if err := r.db.Order("sort_order ASC, code ASC").Find(&models).Error; err != nil {
		return nil, err
	}
	items := make([]domain.UnitPriceCategoryRecord, len(models))
	for i := range models {
		items[i] = *models[i].ToDomain()
	}
	return items, nil
}

func (r *repository) FindByID(id uint) (*domain.UnitPriceCategoryRecord, error) {
	var m model.UnitPriceCategory
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *repository) FindByCode(code string, excludeID *uint) (*domain.UnitPriceCategoryRecord, error) {
	var m model.UnitPriceCategory
	query := r.db.Where("lower(code) = lower(?)", strings.TrimSpace(code))
	if excludeID != nil {
		query = query.Where("id <> ?", *excludeID)
	}
	if err := query.First(&m).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *repository) CountReferences(code string) (int64, error) {
	var count int64
	err := r.db.Model(&model.UnitPrice{}).
		Where("lower(category) = lower(?)", code).
		Where("deleted_at IS NULL").
		Count(&count).Error
	return count, err
}

func (r *repository) Create(c *domain.UnitPriceCategoryRecord) error {
	m := model.FromUnitPriceCategoryDomain(c)
	if err := r.db.Create(m).Error; err != nil {
		return err
	}
	*c = *m.ToDomain()
	return nil
}

func (r *repository) Update(c *domain.UnitPriceCategoryRecord) error {
	m := model.FromUnitPriceCategoryDomain(c)
	if err := r.db.Save(m).Error; err != nil {
		return err
	}
	*c = *m.ToDomain()
	return nil
}

func (r *repository) Delete(id uint) (bool, error) {
	res := r.db.Delete(&model.UnitPriceCategory{}, id)
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}
