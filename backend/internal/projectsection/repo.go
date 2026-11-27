package projectsection

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"musashi/backend/internal/crud"
	"musashi/backend/internal/domain"
	"musashi/backend/internal/model"
)

// Repository combines the shared CRUD contract with section-specific queries.
type Repository interface {
	crud.Repository[domain.ProjectSectionRecord, FindOptions, ListOptions]

	CountReferences(db *gorm.DB, code string) (int64, error)
}

type repository struct{}

func NewRepository() Repository {
	return &repository{}
}

func (r *repository) Create(db *gorm.DB, s *domain.ProjectSectionRecord) error {
	m := model.FromProjectSectionDomain(s)
	if err := db.Create(m).Error; err != nil {
		return err
	}
	*s = *m.ToDomain()
	return nil
}

// FindOptions selects one section by ID or by code. ExcludeID skips a row when
// matching by code, used to detect duplicates during an update.
type FindOptions struct {
	ID        *uint
	Code      *string
	ExcludeID *uint
}

var (
	ErrFindRequiresIDOrCode = errors.New("provide id or code")
	ErrFindAmbiguous        = errors.New("provide only one of id or code")
)

func (r *repository) Find(db *gorm.DB, opts FindOptions) (*domain.ProjectSectionRecord, error) {
	if opts.ID == nil && opts.Code == nil {
		return nil, ErrFindRequiresIDOrCode
	}
	if opts.ID != nil && opts.Code != nil {
		return nil, ErrFindAmbiguous
	}

	var m model.ProjectSection
	if opts.ID != nil {
		if err := db.First(&m, *opts.ID).Error; err != nil {
			return nil, err
		}
		return m.ToDomain(), nil
	}

	query := db.Where("lower(code) = lower(?)", *opts.Code)
	if opts.ExcludeID != nil {
		query = query.Where("id <> ?", *opts.ExcludeID)
	}
	if err := query.First(&m).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

// ListOptions is the section-specific list query.
type ListOptions struct {
	Keyword  string
	SortBy   string
	SortDir  string
	Includes []string
}

func (r *repository) List(db *gorm.DB, opts ListOptions) ([]domain.ProjectSectionRecord, error) {
	var models []model.ProjectSection
	query := db.Model(&model.ProjectSection{})

	if opts.Keyword != "" {
		like := "%" + strings.ToLower(opts.Keyword) + "%"
		query = query.Where("lower(code) LIKE ? OR lower(name) LIKE ?", like, like)
	}

	// Whitelist: values from callers must never reach GORM's Order unvalidated.
	column := "code"
	switch opts.SortBy {
	case "code", "name":
		column = opts.SortBy
	}
	direction := "ASC"
	if strings.EqualFold(opts.SortDir, "desc") {
		direction = "DESC"
	}
	query = query.Order(column + " " + direction)

	// Includes belum dipakai: ProjectSection belum punya relasi untuk di-preload.

	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}
	items := make([]domain.ProjectSectionRecord, len(models))
	for i := range models {
		items[i] = *models[i].ToDomain()
	}
	return items, nil
}

func (r *repository) Update(db *gorm.DB, s *domain.ProjectSectionRecord) error {
	m := model.FromProjectSectionDomain(s)
	if err := db.Save(m).Error; err != nil {
		return err
	}
	*s = *m.ToDomain()
	return nil
}

func (r *repository) Delete(db *gorm.DB, id uint) (bool, error) {
	res := db.Delete(&model.ProjectSection{}, id)
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}

func (r *repository) CountReferences(db *gorm.DB, code string) (int64, error) {
	var count int64
	err := db.Table("projects").
		Where("lower(section) = lower(?)", code).
		Where("deleted_at IS NULL").
		Count(&count).Error
	return count, err
}
