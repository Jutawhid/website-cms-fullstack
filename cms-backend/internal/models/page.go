package models

import (
	"time"

	"github.com/google/uuid"
)

type Page struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Slug      string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"slug"`
	Content   string    `gorm:"type:text" json:"content"`
	AuthorID  *uuid.UUID `gorm:"type:uuid" json:"author_id"`
	Author    User      `gorm:"foreignKey:AuthorID" json:"author"`
	Status    string    `gorm:"type:varchar(50);default:'draft'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
