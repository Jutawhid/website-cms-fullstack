package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"cms-backend/internal/models"
	"cms-backend/pkg/utils"
)

// LoginRequest is a simple "struct" (like a blueprint) that dictates exactly what JSON data we expect from the frontend.
// The `binding:"required"` tags force Gin to automatically block requests that don't have an email and password.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login is an HTTP handler function that processes a user's attempt to sign in.
// We pass the Database connection (`*gorm.DB`) as a parameter so the handler knows how to talk to Postgres.
func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		
		// 1. Check if the inbound JSON matches our LoginRequest blueprint.
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			// If missing fields or bad email format, return a 400 Bad Request
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 2. Ask the database if a user exists with this exact email.
		var user models.User
		if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
			// If not found, return a generic message to prevent hackers from checking if an email is registered here
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// 3. We NEVER store or compare plain text! We compare the input string against the secure hash in the DB.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// 4. If correct, we generate a VIP pass (JWT access & refresh tokens) for the user to navigate the app securely.
		accessToken, refreshToken, err := utils.GenerateTokens(user.ID.String(), user.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate security tokens"})
			return
		}

		// 5. Success! Send the tokens and user info back to the Next.js frontend.
		c.JSON(http.StatusOK, gin.H{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"user": gin.H{
				"id":    user.ID,
				"email": user.Email,
				"role":  user.Role,
			},
		})
	}
}

// Auth.Me handler
func Me(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Extract the User ID from the JWT token (which was validated by the AuthMiddleware)
		userID, _ := c.Get("userID") // Fixed Context Key to match the Middleware!
		var user models.User
		if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		// 2. Return the user data (excluding the password hash) to the frontend
		c.JSON(http.StatusOK, gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		})
	}
}
