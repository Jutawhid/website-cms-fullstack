package main

import (
	"log"
	"time"
	"cms-backend/configs"
	"cms-backend/internal/handlers"
	"cms-backend/internal/models"
	"cms-backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	config := configs.LoadConfig()
	db := models.ConnectDatabase(config.DatabaseURL)
	models.Migrate(db)

	r := gin.Default()

	// Apply CORS middleware to allow requests from our Next.js frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Public routes
	r.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "success", "message": "CMS API is running smoothly."})
	})

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login(db))
			auth.POST("/register", handlers.Register(db)) // Brand new endpoint to spawn users!
			auth.POST("/refresh", handlers.Refresh(db))   // Resolving refresh loops
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Auth API Endpoints (Phase 2)
			protected.GET("/auth/me", handlers.Me(db))

			// Pages API Endpoints (Phase 3)
			protected.POST("/pages", handlers.CreatePage(db))
			protected.GET("/pages", handlers.GetPages(db))
			protected.GET("/pages/:id", handlers.GetPage(db))
			protected.PUT("/pages/:id", handlers.UpdatePage(db))
			protected.DELETE("/pages/:id", handlers.DeletePage(db))
		}
	}

	log.Printf("Starting server on port %s", config.Port)
	if err := r.Run(":" + config.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
