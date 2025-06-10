package models

import (
	"time"
)

type Person struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Present      bool      `gorm:"default:false" json:"present"`
	WinCount     int       `gorm:"default:0" json:"win_count"`
	LastWin      *time.Time `json:"last_win"`
	LastWinReset *time.Time `json:"last_win_reset"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type Winner struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PersonID  uint      `json:"person_id"`
	Person    Person    `gorm:"foreignKey:PersonID" json:"person"`
	WonAt     time.Time `json:"won_at"`
	CreatedAt time.Time `json:"created_at"`
}