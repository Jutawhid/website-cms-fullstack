package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"cms-backend/internal/models"
)

// CreatePageRequest is our blueprint for exactly what data a user must send to create a new page
type CreatePageRequest struct {
	Title   string `json:"title" binding:"required"`
	Slug    string `json:"slug" binding:"required"`
	Content string `json:"content" binding:"required"`
	Status  string `json:"status" binding:"oneof=draft published"`
}

// CreatePage allows an authenticated user to write a new blog post/page
func CreatePage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Validate incoming JSON against our blueprint
		var req CreatePageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 2. Extract securely verified User ID from Context (Injected by AuthMiddleware!)
		userIDStr, _ := c.Get("userID")
		userID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user context"})
			return
		}

		// 3. Assemble the Page model
		page := models.Page{
			Title:    req.Title,
			Slug:     req.Slug,
			Content:  req.Content,
			Status:   req.Status,
			AuthorID: &userID,
		}

		// 4. Save to Database
		if err := db.Create(&page).Error; err != nil {
			// e.g. Slug must be unique
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create page, slug might already exist"})
			return
		}

		c.JSON(http.StatusCreated, page)
	}
}

// GetPages fetches all pages (with author info)
func GetPages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var pages []models.Page
		// Preload("Author") tells GORM to automatically fetch the User associated with AuthorID
		if err := db.Preload("Author").Find(&pages).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pages"})
			return
		}
		c.JSON(http.StatusOK, pages)
	}
}

// DeletePage removes a specific page using its ID
func DeletePage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id") // Extract the dynamic ID from the URL -> /pages/:id

		if err := db.Delete(&models.Page{}, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete page"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Page successfully deleted"})
	}
}

// GetPage mathematically fetches a single page by its UUID (Read)
func GetPage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var page models.Page
		if err := db.Where("id = ?", id).First(&page).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Page strictly not found"})
			return
		}
		c.JSON(http.StatusOK, page)
	}
}

// UpdatePage safely modifies an existing HTML page (Update)
func UpdatePage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		
		var req CreatePageRequest // We purposefully reuse the strict Create validation blueprint!
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var page models.Page
		if err := db.Where("id = ?", id).First(&page).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Page utterly destroyed or missing"})
			return
		}

		// Update fields in memory intelligently
		page.Title = req.Title
		page.Slug = req.Slug
		page.Content = req.Content
		page.Status = req.Status

		if err := db.Save(&page).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed mathematically to update postgres"})
			return
		}

		c.JSON(http.StatusOK, page)
	}
}
