package main

import (
	"net/http"
	"roulette/database"
	"roulette/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.Init()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "healthy",
				"message": "Gin server is running!",
			})
		})

		// Person routes
		api.GET("/persons", handlers.GetPersons)
		api.GET("/persons/:id", handlers.GetPerson)
		api.POST("/persons", handlers.CreatePerson)
		api.PUT("/persons/:id", handlers.UpdatePerson)
		api.DELETE("/persons/:id", handlers.DeletePerson)
		api.PATCH("/persons/:id/presence", handlers.UpdatePresence)
		api.POST("/persons/presence", handlers.ToggleAllPresence)
		api.POST("/persons/:id/reset-wins", handlers.ResetPersonWins)

		// Roulette routes
		api.POST("/roulette/spin", handlers.SpinRoulette)
		api.GET("/roulette/history", handlers.GetWinHistory)
		api.POST("/roulette/reset", handlers.ResetWinCounts)
	}

	// Start server
	r.Run(":8080")
}
