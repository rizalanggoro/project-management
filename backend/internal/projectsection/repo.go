package projectsection

import (
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/domain"
	"musashi/backend/internal/model"
)

type Repository interface {
	List(q string) ([]domain.ProjectSectionRecord, error)
	FindByID(id uint) (*domain.ProjectSectionRecord, error)
	FindByCode(code string, excludeID *uint) (*domain.ProjectSectionRecord, error)
	Create(s *domain.ProjectSectionRecord) error
	Update(s *domain.ProjectSectionRecord) error
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

func (r *repository) List(q string) ([]domain.ProjectSectionRecord, error) {
	var models []model.ProjectSection
	query := r.db.Order("code ASC")
	if q != "" {
		like := "%" + strings.ToLower(q) + "%"
		query = query.Where("lower(code) LIKE ? OR lower(name) LIKE ?", like, like)
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}
	items := make([]domain.ProjectSectionRecord, len(models))
	for i := range models {
		items[i] = *models[i].ToDomain()
	}
	return items, nil
}

func (r *repository) FindByID(id uint) (*domain.ProjectSectionRecord, error) {
	var m model.ProjectSection
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *repository) FindByCode(code string, excludeID *uint) (*domain.ProjectSectionRecord, error) {
	var m model.ProjectSection
	query := r.db.Where("lower(code) = lower(?)", code)
	if excludeID != nil {
		query = query.Where("id <> ?", *excludeID)
	}
	if err := query.First(&m).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *repository) Create(s *domain.ProjectSectionRecord) error {
	m := model.FromProjectSectionDomain(s)
	if err := r.db.Create(m).Error; err != nil {
		return err
	}
	*s = *m.ToDomain()
	return nil
}

func (r *repository) Update(s *domain.ProjectSectionRecord) error {
	m := model.FromProjectSectionDomain(s)
	if err := r.db.Save(m).Error; err != nil {
		return err
	}
	*s = *m.ToDomain()
	return nil
}

func (r *repository) RenameCode(oldCode, newCode string) error {
	return r.db.Table("projects").
		Where("lower(section) = lower(?)", oldCode).
		Update("section", newCode).Error
}

func (r *repository) CountReferences(code string) (int64, error) {
	var count int64
	err := r.db.Table("projects").
		Where("lower(section) = lower(?)", code).
		Where("deleted_at IS NULL").
		Count(&count).Error
	return count, err
}

func (r *repository) Delete(id uint) (bool, error) {
	res := r.db.Delete(&model.ProjectSection{}, id)
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}
