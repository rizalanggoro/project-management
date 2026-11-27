package domain

import "time"

type UnitPriceCategoryRecord struct {
	ID         uint      `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Code       string    `json:"code"`
	Name       string    `json:"name"`
	CodePrefix string    `json:"code_prefix"`
	SortOrder  int       `json:"sort_order"`
	IsActive   bool      `json:"is_active"`
}
