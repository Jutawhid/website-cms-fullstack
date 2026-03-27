package utils

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PaginationResponse enforces a perfectly consistent metadata structure across our entire CMS API
type PaginationResponse struct {
	TotalItems  int64       `json:"total_items"`
	TotalPages  int         `json:"total_pages"`
	CurrentPage int         `json:"current_page"`
	Limit       int         `json:"limit"`
	Data        interface{} `json:"data"`
}

// Paginate mathematically limits SQL bounds and universally calculates structural metadata!
func Paginate(c *gin.Context, db *gorm.DB, model interface{}, result interface{}, preloads []string) (PaginationResponse, error) {
	// 1. Securely parse query parameters with default fallbacks
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit

	// 2. Count the absolute total items dynamically before offset
	var totalItems int64
	db.Model(model).Count(&totalItems)

	// 3. Compute structural metadata limits
	totalPages := int(math.Ceil(float64(totalItems) / float64(limit)))

	// 4. Assemble query offsets and structural GORM preloads
	query := db.Limit(limit).Offset(offset).Order("created_at desc") // Best Practice: Newest first
	for _, preload := range preloads {
		query = query.Preload(preload)
	}

	// 5. Fire query safely into Postgres
	err := query.Find(result).Error

	return PaginationResponse{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		Limit:       limit,
		Data:        result,
	}, err
}
