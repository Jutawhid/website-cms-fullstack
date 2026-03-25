package models

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDatabase(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	return db
}

func Migrate(db *gorm.DB) {
	err := db.AutoMigrate(&User{}, &Page{}, &Media{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
}
