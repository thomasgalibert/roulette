package handlers

import (
	"math"
	"math/rand"
	"net/http"
	"roulette/database"
	"roulette/models"
	"time"

	"github.com/gin-gonic/gin"
)

func SpinRoulette(c *gin.Context) {
	var presentPersons []models.Person
	database.DB.Where("present = ?", true).Find(&presentPersons)

	if len(presentPersons) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No present persons to select from"})
		return
	}

	// Calculate weights based on wins and time since last win
	weights := calculateWeights(presentPersons)
	
	// Select winner based on weighted random
	winner := selectWeightedRandom(presentPersons, weights)

	// Update winner's stats
	now := time.Now()
	winner.WinCount++
	winner.LastWin = &now
	
	// Reset win count if more than 3 months since last reset
	if winner.LastWinReset == nil || now.Sub(*winner.LastWinReset) > 90*24*time.Hour {
		winner.WinCount = 1
		winner.LastWinReset = &now
	}

	if err := database.DB.Save(&winner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update winner"})
		return
	}

	// Record the win
	winnerRecord := models.Winner{
		PersonID: winner.ID,
		WonAt:    now,
	}
	database.DB.Create(&winnerRecord)

	c.JSON(http.StatusOK, gin.H{
		"winner": winner,
		"total_participants": len(presentPersons),
	})
}

func calculateWeights(persons []models.Person) []float64 {
	weights := make([]float64, len(persons))
	now := time.Now()

	for i, person := range persons {
		baseWeight := 1.0
		
		// Reduce weight based on win count
		if person.WinCount > 0 {
			// Check if we should reset wins (3 months)
			if person.LastWinReset != nil && now.Sub(*person.LastWinReset) > 90*24*time.Hour {
				baseWeight = 1.0
			} else {
				// Exponentially decrease chances with more wins
				baseWeight = math.Pow(0.7, float64(person.WinCount))
			}
		}

		// Additional reduction if won recently (within last 7 days)
		if person.LastWin != nil {
			daysSinceWin := now.Sub(*person.LastWin).Hours() / 24
			if daysSinceWin < 7 {
				baseWeight *= 0.5
			}
		}

		weights[i] = baseWeight
	}

	return weights
}

func selectWeightedRandom(persons []models.Person, weights []float64) models.Person {
	totalWeight := 0.0
	for _, w := range weights {
		totalWeight += w
	}

	r := rand.Float64() * totalWeight
	
	cumulative := 0.0
	for i, w := range weights {
		cumulative += w
		if r <= cumulative {
			return persons[i]
		}
	}

	// Fallback (should not happen)
	return persons[len(persons)-1]
}

func GetWinHistory(c *gin.Context) {
	var winners []models.Winner
	database.DB.Preload("Person").Order("won_at desc").Limit(50).Find(&winners)
	c.JSON(http.StatusOK, winners)
}

func ResetWinCounts(c *gin.Context) {
	now := time.Now()
	if err := database.DB.Model(&models.Person{}).Where("1 = 1").Updates(map[string]interface{}{
		"win_count": 0,
		"last_win_reset": now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset win counts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Win counts reset successfully"})
}