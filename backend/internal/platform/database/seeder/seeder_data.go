// Code generated from docs/Renovasi Beton Bertulang.xlsx. DO NOT EDIT.
package seeder

import "musashi/backend/internal/domain"

const (
	projectName   = "RENOVASI BETON BERTULANG"
	projectBudget = 191326040
)

type unitPriceSeed struct {
	Code, WorkItem, Unit string
	Category             domain.UnitPriceCategory
	Price                int64
}

var unitPriceSeeds = []unitPriceSeed{
	{Code: "L.01", Category: domain.CategoryLabor, WorkItem: "Pekerja", Unit: "OH", Price: 170000},
	{Code: "L.04", Category: domain.CategoryLabor, WorkItem: "Mandor", Unit: "OH", Price: 270000},
	{Code: "EQP-001", Category: domain.CategoryEquipment, WorkItem: "Jack hammer + genset", Unit: "hari", Price: 2300000},
	{Code: "MAT-001", Category: domain.CategoryMaterials, WorkItem: "Sirtu (quarry - lokasi pekerjaan)", Unit: "m3", Price: 400000},
	{Code: "LAB-001", Category: domain.CategoryLabor, WorkItem: "Tukang", Unit: "OH", Price: 220000},
	{Code: "LAB-002", Category: domain.CategoryLabor, WorkItem: "Kepala Tukang", Unit: "OH", Price: 250000},
	{Code: "MAT-002", Category: domain.CategoryMaterials, WorkItem: "Air untuk pemadatan", Unit: "m3", Price: 25000},
	{Code: "MAT-003", Category: domain.CategoryMaterials, WorkItem: "Material bantu", Unit: "ls", Price: 2000},
	{Code: "EQP-002", Category: domain.CategoryEquipment, WorkItem: "Stamper", Unit: "jam", Price: 100000},
	{Code: "EQP-003", Category: domain.CategoryEquipment, WorkItem: "Alat bantu pemadatan", Unit: "ls", Price: 2000},
	{Code: "MAT-004", Category: domain.CategoryMaterials, WorkItem: "BjTP", Unit: "kg", Price: 18000},
	{Code: "MAT-005", Category: domain.CategoryMaterials, WorkItem: "Kawat beton", Unit: "kg", Price: 25000},
	{Code: "EQP-004", Category: domain.CategoryEquipment, WorkItem: "Cutter baja beton", Unit: "hari", Price: 800000},
	{Code: "EQP-005", Category: domain.CategoryEquipment, WorkItem: "Bender baja beton", Unit: "hari", Price: 850000},
	{Code: "LAB-003", Category: domain.CategoryLabor, WorkItem: "Tukang batu", Unit: "OH", Price: 220000},
	{Code: "MAT-006", Category: domain.CategoryMaterials, WorkItem: "Adukan beton K-275 ready mix", Unit: "m3", Price: 1350000},
	{Code: "LAB-004", Category: domain.CategoryLabor, WorkItem: "Tukang besi", Unit: "OH", Price: 220000},
	{Code: "MAT-007", Category: domain.CategoryMaterials, WorkItem: "Geotekstil non woven", Unit: "m2", Price: 105000},
	{Code: "MAT-008", Category: domain.CategoryMaterials, WorkItem: "Air untuk curing", Unit: "m3", Price: 25000},
	{Code: "MAT-009", Category: domain.CategoryMaterials, WorkItem: "Pengikat", Unit: "ls", Price: 3000},
	{Code: "EQP-006", Category: domain.CategoryEquipment, WorkItem: "Selang dan alat penyiram air", Unit: "ls", Price: 4000},
	{Code: "EQP-007", Category: domain.CategoryEquipment, WorkItem: "Peralatan bantu", Unit: "ls", Price: 2000},
	{Code: "MAT-010", Category: domain.CategoryMaterials, WorkItem: "Air untuk pendinginan blade", Unit: "m3", Price: 25000},
	{Code: "MAT-011", Category: domain.CategoryMaterials, WorkItem: "Bahan bantu cutting", Unit: "ls", Price: 2000},
	{Code: "EQP-008", Category: domain.CategoryEquipment, WorkItem: "Mesin concrete cutter", Unit: "jam", Price: 150000},
	{Code: "EQP-009", Category: domain.CategoryEquipment, WorkItem: "Diamond blade", Unit: "jam", Price: 100000},
	{Code: "LAB-005", Category: domain.CategoryLabor, WorkItem: "Tukang/operator mesin", Unit: "OH", Price: 220000},
	{Code: "MAT-012", Category: domain.CategoryMaterials, WorkItem: "Mata pisau diamond (keausan)", Unit: "bh", Price: 750000},
	{Code: "EQP-010", Category: domain.CategoryEquipment, WorkItem: "Mesin concrete grooving", Unit: "hari", Price: 500000},
	{Code: "MAT-013", Category: domain.CategoryMaterials, WorkItem: "Polyurethane sealant (600 ml)", Unit: "tube", Price: 180000},
	{Code: "MAT-014", Category: domain.CategoryMaterials, WorkItem: "Backing rod / foam joint", Unit: "m'", Price: 3000},
	{Code: "MAT-015", Category: domain.CategoryMaterials, WorkItem: "Primer sealant", Unit: "liter", Price: 100000},
	{Code: "MAT-016", Category: domain.CategoryMaterials, WorkItem: "Material pembersih celah", Unit: "lot", Price: 1500},
	{Code: "EQP-011", Category: domain.CategoryEquipment, WorkItem: "Caulking gun dan alat bantu aplikasi", Unit: "hari", Price: 250000},
}

type ahspItemSeed struct {
	Category                domain.UnitPriceCategory
	Sort                    int
	Description, Code, Unit string
	Coefficient             float64
	UnitPrice               int64
}

type ahspSeed struct {
	Code, WorkItem, Unit                                                  string
	OverheadProfitPct                                                     float64
	TotalLabor, TotalMaterial, TotalEquipment, TotalCost, UnitPriceOfWork int64
	Items                                                                 []ahspItemSeed
}

var ahspSeeds = []ahspSeed{
	{
		Code: "1.6.6", WorkItem: "Bongkaran 1 m3 beton mutu sedang 20 MPa ≤ f’c ≤ 40 MPa dengan jack hammer", Unit: "m3",
		OverheadProfitPct: 20.0, TotalLabor: 73400, TotalMaterial: 0, TotalEquipment: 115000, TotalCost: 188400, UnitPriceOfWork: 226080,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "L.01", Unit: "OH", Coefficient: 0.4, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Mandor", Code: "L.04", Unit: "OH", Coefficient: 0.02, UnitPrice: 270000},
			{Category: domain.CategoryEquipment, Sort: 3, Description: "Jack hammer + genset", Code: "", Unit: "hari", Coefficient: 0.05, UnitPrice: 2300000},
		},
	},
	{
		Code: "1.3.2.2", WorkItem: "1 m3 timbunan dan pemadatan sirtu  secara manual", Unit: "m3",
		OverheadProfitPct: 20.0, TotalLabor: 46010, TotalMaterial: 480000, TotalEquipment: 0, TotalCost: 526010, UnitPriceOfWork: 631212,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "L.01", Unit: "OH", Coefficient: 0.25, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Mandor", Code: "L.04", Unit: "OH", Coefficient: 0.013, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 3, Description: "Sirtu (quarry - lokasi pekerjaan)", Code: "", Unit: "m3", Coefficient: 1.2, UnitPrice: 400000},
		},
	},
	{
		Code: "AHSP-PEMADATAN-BASECOURSE", WorkItem: "Pemadatan basecourse", Unit: "m2",
		OverheadProfitPct: 20.0, TotalLabor: 14960, TotalMaterial: 2500, TotalEquipment: 17000, TotalCost: 34460, UnitPriceOfWork: 41352,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "", Unit: "OH", Coefficient: 0.05, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Tukang", Code: "", Unit: "OH", Coefficient: 0.02, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Kepala Tukang", Code: "", Unit: "OH", Coefficient: 0.005, UnitPrice: 250000},
			{Category: domain.CategoryLabor, Sort: 4, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.003, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 5, Description: "Air untuk pemadatan", Code: "", Unit: "m3", Coefficient: 0.02, UnitPrice: 25000},
			{Category: domain.CategoryMaterials, Sort: 6, Description: "Material bantu", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 2000},
			{Category: domain.CategoryEquipment, Sort: 7, Description: "Stamper", Code: "", Unit: "jam", Coefficient: 0.15, UnitPrice: 100000},
			{Category: domain.CategoryEquipment, Sort: 8, Description: "Alat bantu pemadatan", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 2000},
		},
	},
	{
		Code: "2.2.1.1.2", WorkItem: "1 kg penulangan slab untuk BjTP atau BjTS atau BjTS dia. ≥ 12 mm, cara semi mekanis (untuk bangunan gedung)", Unit: "kg",
		OverheadProfitPct: 20.0, TotalLabor: 3094, TotalMaterial: 18735, TotalEquipment: 330, TotalCost: 22159, UnitPriceOfWork: 26591,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "", Unit: "OH", Coefficient: 0.007, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.007, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Kepala tukang", Code: "", Unit: "OH", Coefficient: 0.0007, UnitPrice: 250000},
			{Category: domain.CategoryLabor, Sort: 4, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.0007, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 5, Description: "BjTP", Code: "", Unit: "kg", Coefficient: 1.02, UnitPrice: 18000},
			{Category: domain.CategoryMaterials, Sort: 6, Description: "Kawat beton", Code: "", Unit: "kg", Coefficient: 0.015, UnitPrice: 25000},
			{Category: domain.CategoryEquipment, Sort: 7, Description: "Cutter baja beton", Code: "", Unit: "hari", Coefficient: 0.0002, UnitPrice: 800000},
			{Category: domain.CategoryEquipment, Sort: 8, Description: "Bender baja beton", Code: "", Unit: "hari", Coefficient: 0.0002, UnitPrice: 850000},
		},
	},
	{
		Code: "2.2.1.6.1", WorkItem: "Pengecoran 1 m3  menggunakan ready mixed (untuk bangunan gedung)", Unit: "m3",
		OverheadProfitPct: 20.0, TotalLabor: 103300, TotalMaterial: 1377000, TotalEquipment: 0, TotalCost: 1480300, UnitPriceOfWork: 1776360,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "", Unit: "OH", Coefficient: 0.4, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Tukang batu", Code: "", Unit: "OH", Coefficient: 0.1, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Kepala Tukang", Code: "", Unit: "OH", Coefficient: 0.01, UnitPrice: 250000},
			{Category: domain.CategoryLabor, Sort: 4, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.04, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 5, Description: "Adukan beton K-275 ready mix", Code: "", Unit: "m3", Coefficient: 1.02, UnitPrice: 1350000},
		},
	},
	{
		Code: "AHSP-CURING-GEOTEKSTIL-NON-WO", WorkItem: "Curing geotekstil non woven", Unit: "m2",
		OverheadProfitPct: 20.0, TotalLabor: 72200, TotalMaterial: 119750, TotalEquipment: 6000, TotalCost: 197950, UnitPriceOfWork: 237540,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "", Unit: "OH", Coefficient: 0.25, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Tukang besi", Code: "", Unit: "OH", Coefficient: 0.1, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Kepala tukang", Code: "", Unit: "OH", Coefficient: 0.02, UnitPrice: 250000},
			{Category: domain.CategoryLabor, Sort: 4, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.01, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 5, Description: "Geotekstil non woven", Code: "", Unit: "m2", Coefficient: 1.1, UnitPrice: 105000},
			{Category: domain.CategoryMaterials, Sort: 6, Description: "Air untuk curing", Code: "", Unit: "m3", Coefficient: 0.05, UnitPrice: 25000},
			{Category: domain.CategoryMaterials, Sort: 7, Description: "Pengikat", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 3000},
			{Category: domain.CategoryEquipment, Sort: 8, Description: "Selang dan alat penyiram air", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 4000},
			{Category: domain.CategoryEquipment, Sort: 9, Description: "Peralatan bantu", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 2000},
		},
	},
	{
		Code: "AHSP-CUTTING-BETON-EXISTING", WorkItem: "Cutting beton existing", Unit: "m'",
		OverheadProfitPct: 20.0, TotalLabor: 21560, TotalMaterial: 2250, TotalEquipment: 28000, TotalCost: 51810, UnitPriceOfWork: 62172,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "", Unit: "OH", Coefficient: 0.05, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Tukang besi", Code: "", Unit: "OH", Coefficient: 0.05, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Kepala tukang", Code: "", Unit: "OH", Coefficient: 0.005, UnitPrice: 250000},
			{Category: domain.CategoryLabor, Sort: 4, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.003, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 5, Description: "Air untuk pendinginan blade", Code: "", Unit: "m3", Coefficient: 0.01, UnitPrice: 25000},
			{Category: domain.CategoryMaterials, Sort: 6, Description: "Bahan bantu cutting", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 2000},
			{Category: domain.CategoryEquipment, Sort: 7, Description: "Mesin concrete cutter", Code: "", Unit: "jam", Coefficient: 0.1, UnitPrice: 150000},
			{Category: domain.CategoryEquipment, Sort: 8, Description: "Diamond blade", Code: "", Unit: "jam", Coefficient: 0.1, UnitPrice: 100000},
			{Category: domain.CategoryEquipment, Sort: 9, Description: "Peralatan bantu", Code: "", Unit: "ls", Coefficient: 1.0, UnitPrice: 3000},
		},
	},
	{
		Code: "AHSP-FINISH-GROOVING-BETON", WorkItem: "Finish grooving beton", Unit: "m2",
		OverheadProfitPct: 20.0, TotalLabor: 30700, TotalMaterial: 15000, TotalEquipment: 25000, TotalCost: 70700, UnitPriceOfWork: 84840,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "", Unit: "OH", Coefficient: 0.1, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Tukang/operator mesin", Code: "", Unit: "OH", Coefficient: 0.05, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Mandor", Code: "", Unit: "OH", Coefficient: 0.01, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 4, Description: "Mata pisau diamond (keausan)", Code: "", Unit: "bh", Coefficient: 0.02, UnitPrice: 750000},
			{Category: domain.CategoryEquipment, Sort: 5, Description: "Mesin concrete grooving", Code: "", Unit: "hari", Coefficient: 0.05, UnitPrice: 500000},
		},
	},
	{
		Code: "AHSP-JOINT-DILATASI-MENGGUNAK", WorkItem: "Joint dilatasi menggunakan sealant", Unit: "m'",
		OverheadProfitPct: 20.0, TotalLabor: 14980, TotalMaterial: 38590, TotalEquipment: 2500, TotalCost: 56070, UnitPriceOfWork: 67284,
		Items: []ahspItemSeed{
			{Category: domain.CategoryLabor, Sort: 1, Description: "Pekerja", Code: "L.01", Unit: "OH", Coefficient: 0.03, UnitPrice: 170000},
			{Category: domain.CategoryLabor, Sort: 2, Description: "Tukang", Code: "L.02", Unit: "OH", Coefficient: 0.04, UnitPrice: 220000},
			{Category: domain.CategoryLabor, Sort: 3, Description: "Mandor", Code: "L.04", Unit: "OH", Coefficient: 0.004, UnitPrice: 270000},
			{Category: domain.CategoryMaterials, Sort: 4, Description: "Polyurethane sealant (600 ml)", Code: "", Unit: "tube", Coefficient: 0.183, UnitPrice: 180000},
			{Category: domain.CategoryMaterials, Sort: 5, Description: "Backing rod / foam joint", Code: "", Unit: "m'", Coefficient: 1.05, UnitPrice: 3000},
			{Category: domain.CategoryMaterials, Sort: 6, Description: "Primer sealant", Code: "", Unit: "liter", Coefficient: 0.01, UnitPrice: 100000},
			{Category: domain.CategoryMaterials, Sort: 7, Description: "Material pembersih celah", Code: "", Unit: "lot", Coefficient: 1.0, UnitPrice: 1500},
			{Category: domain.CategoryEquipment, Sort: 8, Description: "Caulking gun dan alat bantu aplikasi", Code: "", Unit: "hari", Coefficient: 0.01, UnitPrice: 250000},
		},
	},
}

type volumeSeed struct {
	Formula, Description                string
	Length, Width, Height               *float64
	Quantity, UnitWeight, TotalQuantity float64
}

type boqSeed struct {
	WorkItem, Unit string
	PlannedVolume  float64
	AhspCode       string
	SheetPrice     int64
	Volumes        []volumeSeed
}

var boqSeeds = []boqSeed{
	{
		WorkItem: "Pekerjaan persiapan, include:", Unit: "lot", PlannedVolume: 1.0, AhspCode: "", SheetPrice: 3000000,
		Volumes: []volumeSeed{
			{Formula: "unit_only", Length: nil, Width: nil, Height: nil, Quantity: 1.0, UnitWeight: 1.0, TotalQuantity: 1.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Cutting beton existing", Unit: "m'", PlannedVolume: 50.0, AhspCode: "AHSP-CUTTING-BETON-EXISTING", SheetPrice: 62172,
		Volumes: []volumeSeed{
			{Formula: "custom", Length: f(15.0), Width: f(10.0), Height: nil, Quantity: 25.0, UnitWeight: 2.0, TotalQuantity: 50.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Pembobokan beton existing, t = 20 cm", Unit: "m3", PlannedVolume: 30.0, AhspCode: "", SheetPrice: 45200,
		Volumes: []volumeSeed{
			{Formula: "box", Length: f(15.0), Width: f(10.0), Height: f(0.2), Quantity: 30.0, UnitWeight: 1.0, TotalQuantity: 30.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Pembuangan puing bongkaran", Unit: "m3", PlannedVolume: 30.0, AhspCode: "", SheetPrice: 125000,
		Volumes: []volumeSeed{
			{Formula: "box", Length: f(15.0), Width: f(10.0), Height: f(0.2), Quantity: 30.0, UnitWeight: 1.0, TotalQuantity: 30.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Urugan basecourse, t = 5 cm", Unit: "m3", PlannedVolume: 7.5, AhspCode: "1.3.2.2", SheetPrice: 631200,
		Volumes: []volumeSeed{
			{Formula: "box", Length: f(15.0), Width: f(10.0), Height: f(0.05), Quantity: 7.5, UnitWeight: 1.0, TotalQuantity: 7.5, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Pemadatan basecourse", Unit: "m2", PlannedVolume: 150.0, AhspCode: "AHSP-PEMADATAN-BASECOURSE", SheetPrice: 41300,
		Volumes: []volumeSeed{
			{Formula: "area_pl", Length: f(15.0), Width: f(10.0), Height: nil, Quantity: 150.0, UnitWeight: 1.0, TotalQuantity: 150.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Pemasangan plastik cor", Unit: "m2", PlannedVolume: 150.0, AhspCode: "", SheetPrice: 20000,
		Volumes: []volumeSeed{
			{Formula: "area_pl", Length: f(15.0), Width: f(10.0), Height: nil, Quantity: 150.0, UnitWeight: 1.0, TotalQuantity: 150.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Penulangan beton D13 2 lapis", Unit: "kg", PlannedVolume: 3125.0, AhspCode: "2.2.1.1.2", SheetPrice: 26500,
		Volumes: []volumeSeed{
			{Formula: "weight_rebar", Length: f(15.0), Width: nil, Height: nil, Quantity: 781.2500000000001, UnitWeight: 1.0, TotalQuantity: 781.25, Description: "sisi panjang"},
			{Formula: "weight_rebar", Length: f(10.0), Width: nil, Height: nil, Quantity: 781.2500000000001, UnitWeight: 1.0, TotalQuantity: 781.25, Description: "sisi lebar"},
			{Formula: "custom", Length: nil, Width: nil, Height: nil, Quantity: 1562.5, UnitWeight: 2.0, TotalQuantity: 3125.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Pengecoran beton ready mix K-400, t = 20 cm", Unit: "m3", PlannedVolume: 30.0, AhspCode: "2.2.1.6.1", SheetPrice: 1776300,
		Volumes: []volumeSeed{
			{Formula: "box", Length: f(15.0), Width: f(10.0), Height: f(0.2), Quantity: 30.0, UnitWeight: 1.0, TotalQuantity: 30.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Finish grooving beton", Unit: "m2", PlannedVolume: 150.0, AhspCode: "AHSP-FINISH-GROOVING-BETON", SheetPrice: 84840,
		Volumes: []volumeSeed{
			{Formula: "area_pl", Length: f(15.0), Width: f(10.0), Height: nil, Quantity: 150.0, UnitWeight: 1.0, TotalQuantity: 150.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Curing beton menggunakan geotekstil non woven", Unit: "m2", PlannedVolume: 150.0, AhspCode: "AHSP-CURING-GEOTEKSTIL-NON-WO", SheetPrice: 100000,
		Volumes: []volumeSeed{
			{Formula: "area_pl", Length: f(15.0), Width: f(10.0), Height: nil, Quantity: 150.0, UnitWeight: 1.0, TotalQuantity: 150.0, Description: "Take-off dari Back Up"},
		},
	},
	{
		WorkItem: "Joint dilatasi menggunakan sealant", Unit: "m'", PlannedVolume: 35.0, AhspCode: "AHSP-JOINT-DILATASI-MENGGUNAK", SheetPrice: 67284,
		Volumes: []volumeSeed{
			{Formula: "linear_p", Length: f(35.0), Width: nil, Height: nil, Quantity: 35.0, UnitWeight: 1.0, TotalQuantity: 35.0, Description: "Take-off dari Back Up"},
		},
	},
}
