package group

import (
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
	"musashi/backend/internal/model"
)

type Repository interface {
	List(q string) ([]domain.Group, error)
	FindByID(id uint) (*domain.Group, error)
	FindByCode(code string, excludeID *uint) (*domain.Group, error)
	Create(g *domain.Group) error
	Update(g *domain.Group) error
	RenameCode(oldCode, newCode string) error
	CountReferences(code string) (int64, error)
	Delete(id uint) (bool, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) List(q string) ([]domain.Group, error) {
	var models []model.Group
	query := r.db.Order("code ASC")
	if q != "" {
		query = query.Where("lower(code) LIKE ? OR lower(name) LIKE ?", "%"+strings.ToLower(q)+"%", "%"+strings.ToLower(q)+"%")
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}
	items := make([]domain.Group, len(models))
	for i := range models {
		items[i] = *models[i].ToDomain()
	}
	return items, nil
}

func (r *repository) FindByID(id uint) (*domain.Group, error) {
	var m model.Group
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *repository) FindByCode(code string, excludeID *uint) (*domain.Group, error) {
	var m model.Group
	query := r.db.Where("lower(code) = lower(?)", code)
	if excludeID != nil {
		query = query.Where("id <> ?", *excludeID)
	}
	if err := query.First(&m).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *repository) Create(g *domain.Group) error {
	m := model.FromGroupDomain(g)
	if err := r.db.Create(m).Error; err != nil {
		return err
	}
	*g = *m.ToDomain()
	return nil
}

func (r *repository) Update(g *domain.Group) error {
	m := model.FromGroupDomain(g)
	if err := r.db.Save(m).Error; err != nil {
		return err
	}
	*g = *m.ToDomain()
	return nil
}

func (r *repository) RenameCode(oldCode, newCode string) error {
	if err := r.db.Table("boq_items").Where("lower(item_group) = lower(?)", oldCode).Update("item_group", newCode).Error; err != nil {
		return err
	}
	return r.db.Table("rab_items").Where("lower(item_group) = lower(?)", oldCode).Update("item_group", newCode).Error
}

func (r *repository) CountReferences(code string) (int64, error) {
	var boqCount, rabCount int64
	if err := r.db.Table("boq_items").Where("lower(item_group) = lower(?)", code).Where("deleted_at IS NULL").Count(&boqCount).Error; err != nil {
		return 0, err
	}
	if err := r.db.Table("rab_items").Where("lower(item_group) = lower(?)", code).Where("deleted_at IS NULL").Count(&rabCount).Error; err != nil {
		return 0, err
	}
	return boqCount + rabCount, nil
}

func (r *repository) Delete(id uint) (bool, error) {
	res := r.db.Delete(&model.Group{}, id)
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}
