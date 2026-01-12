package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/go-ctf-platform/backend/internal/config"
	"github.com/go-ctf-platform/backend/internal/database"
)

func main() {
	cfg := config.LoadConfig()

	// Connect to Database
	database.ConnectDB(cfg.MongoURI, cfg.DBName)

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	log.Printf("Server running on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
