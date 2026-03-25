package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"cms-backend/internal/models"
)

// RegisterRequest dictates exactly what JSON data we expect from the frontend to create a user.
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Register is an HTTP handler that creates a new admin user in our Postgres database.
func Register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 1. Hash the password mathematically so we never store plain text!
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// 2. Create our blueprint User model in Go Memory
		user := models.User{
			Email:        req.Email,
			PasswordHash: string(hashedPassword),
			Role:         "admin", // Defaulting to admin for our very first system user!
		}

		// 3. Save the model to PostgreSQL via GORM
		if err := db.Create(&user).Error; err != nil {
			// If the email is already taken, Postgres will throw an error immediately preventing duplicates
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}

		// 4. Send Success message! We intentionally omit the password hash.
		c.JSON(http.StatusCreated, gin.H{
			"message": "User successfully created!",
			"user": gin.H{
				"id":    user.ID,
				"email": user.Email,
				"role":  user.Role,
			},
		})
	}
}
