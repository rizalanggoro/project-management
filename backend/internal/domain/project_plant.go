package domain

import "time"

type ProjectPlantRecord struct {
	ID        uint      `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
}
