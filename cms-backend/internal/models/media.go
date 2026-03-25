package models

import (
	"time"

	"github.com/google/uuid"
)

type Media struct {
	ID         uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Filename   string     `gorm:"type:varchar(255);not null" json:"filename"`
	FileURL    string     `gorm:"type:varchar(500);not null" json:"file_url"`
	FileType   string     `gorm:"type:varchar(100);not null" json:"file_type"`
	UploaderID *uuid.UUID `gorm:"type:uuid;constraint:OnDelete:CASCADE;" json:"uploader_id"`
	Uploader   User       `gorm:"foreignKey:UploaderID" json:"uploader"`
	CreatedAt  time.Time  `json:"created_at"`
}
