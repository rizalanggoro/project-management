package seeder

import (
	"errors"
	"fmt"
	"log/slog"
	"math"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"musashi/backend/internal/domain"
	"musashi/backend/internal/model"
)

// Seed populates the database with data extracted from
// docs/Renovasi Beton Bertulang.xlsx. Idempotent: existing rows are kept.
func Seed(db *gorm.DB) error {
	slog.Info("starting database seeder...")

	if err := seedUsers(db); err != nil {
		return fmt.Errorf("seed users: %w", err)
	}

	upMap, err := seedUnitPrices(db)
	if err != nil {
		return fmt.Errorf("seed unit prices: %w", err)
	}

	ahspMap, err := seedAhsps(db, upMap)
	if err != nil {
		return fmt.Errorf("seed ahsps: %w", err)
	}

	if err := seedProject(db, ahspMap); err != nil {
		return fmt.Errorf("seed project: %w", err)
	}

	slog.Info("database seeding completed successfully")
	return nil
}

func f(v float64) *float64 { return &v }

func seedUsers(db *gorm.DB) error {
	adminHash := "$2a$10$i/3zZPOBK/Bw79ayDXks9u3YblN8XnEAQqruvWzi2uwzl4u/TQerS" // admin123
	staffHash, err := bcrypt.GenerateFromPassword([]byte("staff123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	users := []model.User{
		{
			Email:        "admin@musashi.local",
			Name:         "Administrator",
			PasswordHash: adminHash,
			Role:         domain.RoleAdmin,
		},
		{
			Email:        "staff@musashi.local",
			Name:         "Staff Estimator",
			PasswordHash: string(staffHash),
			Role:         domain.RoleStaff,
		},
	}

	for _, u := range users {
		var existing model.User
		err := db.Where("lower(email) = lower(?) AND deleted_at IS NULL", u.Email).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&u).Error; err != nil {
				return err
			}
			slog.Info("seeded user", "email", u.Email, "role", u.Role)
		} else if err != nil {
			return err
		}
	}

	return nil
}

func seedUnitPrices(db *gorm.DB) (map[string]model.UnitPrice, error) {
	result := make(map[string]model.UnitPrice)
	for _, seed := range unitPriceSeeds {
		var existing model.UnitPrice
		err := db.Where("lower(code) = lower(?) AND deleted_at IS NULL", seed.Code).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			item := model.UnitPrice{
				Code:      seed.Code,
				Category:  seed.Category,
				WorkItem:  seed.WorkItem,
				Unit:      seed.Unit,
				UnitPrice: seed.Price,
				Note:      "Diekstrak dari Renovasi Beton Bertulang.xlsx",
			}
			if err := db.Create(&item).Error; err != nil {
				return nil, err
			}
			result[seed.Code] = item
		} else if err != nil {
			return nil, err
		} else {
			result[seed.Code] = existing
		}
	}
	return result, nil
}

func seedAhsps(db *gorm.DB, upMap map[string]model.UnitPrice) (map[string]model.Ahsp, error) {
	byWorkItem := make(map[string]model.UnitPrice)
	for _, up := range upMap {
		key := strings.ToLower(up.WorkItem) + "|" + strings.ToLower(up.Unit)
		byWorkItem[key] = up
	}

	result := make(map[string]model.Ahsp)
	for _, seed := range ahspSeeds {
		var existing model.Ahsp
		err := db.Where("lower(code) = lower(?) AND deleted_at IS NULL", seed.Code).First(&existing).Error
		if err == nil {
			result[seed.Code] = existing
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		var totalLabor, totalMaterial, totalEquipment int64
		items := make([]model.AhspItem, 0, len(seed.Items))
		for i, it := range seed.Items {
			up, ok := upMap[it.Code]
			if !ok {
				up = byWorkItem[strings.ToLower(it.Description)+"|"+strings.ToLower(it.Unit)]
			}
			unitPrice := it.UnitPrice
			if unitPrice == 0 && up.ID != 0 {
				unitPrice = up.UnitPrice
			}
			var upID *uint
			if ok || up.ID != 0 {
				upID = &up.ID
			}
			cost := int64(math.Round(it.Coefficient * float64(unitPrice)))
			switch it.Category {
			case domain.CategoryLabor:
				totalLabor += cost
			case domain.CategoryMaterials:
				totalMaterial += cost
			case domain.CategoryEquipment:
				totalEquipment += cost
			}
			items = append(items, model.AhspItem{
				Category:    it.Category,
				Sort:        i + 1,
				Description: it.Description,
				Code:        it.Code,
				Unit:        it.Unit,
				Coefficient: it.Coefficient,
				UnitPrice:   unitPrice,
				Cost:        cost,
				UnitPriceID: upID,
			})
		}

		totalCost := totalLabor + totalMaterial + totalEquipment
		overhead := int64(math.Round(seed.OverheadProfitPct / 100.0 * float64(totalCost)))
		ahsp := model.Ahsp{
			Code:              seed.Code,
			WorkItem:          seed.WorkItem,
			Unit:              seed.Unit,
			OverheadProfitPct: seed.OverheadProfitPct,
			TotalLabor:        totalLabor,
			TotalMaterial:     totalMaterial,
			TotalEquipment:    totalEquipment,
			TotalCost:         totalCost,
			UnitPriceOfWork:   totalCost + overhead,
			Status:            domain.AhspStatusFinal,
			Note:              "Diekstrak dari Renovasi Beton Bertulang.xlsx",
			Items:             items,
		}
		if err := db.Create(&ahsp).Error; err != nil {
			return nil, err
		}
		result[ahsp.Code] = ahsp
		slog.Info("seeded ahsp", "code", ahsp.Code, "unitPrice", ahsp.UnitPriceOfWork)
	}

	return result, nil
}

func seedProject(db *gorm.DB, ahspMap map[string]model.Ahsp) error {
	var project model.Project
	err := db.Where("lower(name) = lower(?) AND deleted_at IS NULL", projectName).First(&project).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		now := time.Now()
		plan := now.AddDate(0, 1, 0)
		project = model.Project{
			Name:               projectName,
			Section:            string(domain.ProjectSectionGABuilding),
			Plant:              string(domain.ProjectPlantCikarang),
			ImplementationPlan: &plan,
			Budget:             projectBudget,
			Note:               "Data seed hasil ekstraksi dari Renovasi Beton Bertulang.xlsx",
			Status:             domain.ProjectStatusPlanning,
			ProgressPPT:        domain.ProgressDone,
			ProgressDrawing:    domain.ProgressDone,
			ProgressRAB:        domain.ProgressDone,
		}
		if err := db.Create(&project).Error; err != nil {
			return err
		}
		slog.Info("seeded project", "name", project.Name, "id", project.ID)
	} else if err != nil {
		return err
	}

	date := time.Now().AddDate(0, 0, -10)
	for _, seed := range boqSeeds {
		var boq model.BoqItem
		bErr := db.Where("project_id = ? AND lower(work_item) = lower(?) AND deleted_at IS NULL", project.ID, seed.WorkItem).First(&boq).Error
		if bErr == nil {
			continue
		}
		if !errors.Is(bErr, gorm.ErrRecordNotFound) {
			return bErr
		}

		boq = model.BoqItem{
			ProjectID:     project.ID,
			WorkItem:      seed.WorkItem,
			Unit:          seed.Unit,
			PlannedVolume: seed.PlannedVolume,
		}
		if ah, ok := ahspMap[seed.AhspCode]; ok && seed.AhspCode != "" {
			boq.AhspID = &ah.ID
		}
		if err := db.Create(&boq).Error; err != nil {
			return err
		}

		for _, v := range seed.Volumes {
			vol := model.Volume{
				BoqItemID:     boq.ID,
				Date:          &date,
				Formula:       v.Formula,
				Length:        v.Length,
				Width:         v.Width,
				Height:        v.Height,
				Quantity:      v.Quantity,
				UnitWeight:    v.UnitWeight,
				TotalQuantity: v.TotalQuantity,
				Description:   v.Description,
			}
			if err := db.Create(&vol).Error; err != nil {
				return err
			}
		}

		unitPrice := seed.SheetPrice
		if ah, ok := ahspMap[seed.AhspCode]; ok && seed.AhspCode != "" {
			unitPrice = ah.UnitPriceOfWork
		}
		rab := model.RabItem{
			ProjectID: project.ID,
			BoqItemID: &boq.ID,
			WorkItem:  seed.WorkItem,
			Unit:      seed.Unit,
			Volume:    seed.PlannedVolume,
			UnitPrice: unitPrice,
			TotalCost: int64(math.Round(seed.PlannedVolume * float64(unitPrice))),
		}
		if err := db.Create(&rab).Error; err != nil {
			return err
		}
		slog.Info("seeded boq, volume, rab", "workItem", boq.WorkItem, "unitPrice", unitPrice)
	}

	return nil
}
