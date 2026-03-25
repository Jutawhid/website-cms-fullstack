package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"

	"cms-backend/internal/models"
	"cms-backend/pkg/utils"
)

// RefreshRequest is the blueprint for taking in expired refresh tokens
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Refresh completely revitalizes an expired Access Token using Postgres & JWT
func Refresh(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RefreshRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token required"})
			return
		}

		claims := &utils.Claims{}
		token, err := jwt.ParseWithClaims(req.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
			return utils.SecretKey, nil
		})

		// This rejects expired 7-day Refresh Tokens!
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
			return
		}

		// Double-check the user hasn't been banned or deleted during those 7 days!
		var user models.User
		if err := db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User no longer exists"})
			return
		}

		// Generate a fresh 15-minute Access Token, and keep the user's role completely up to date
		newAccess, _, err := utils.GenerateTokens(user.ID.String(), user.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "System failed to build tokens"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access_token": newAccess,
			"refresh_token": req.RefreshToken, // We maintain same refresh token to keep user smoothly logged in
		})
	}
}
