package database

import (
	"log"
	"roulette/models"
)

func Seed() {
	// Check if we already have data
	var count int64
	DB.Model(&models.Person{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded, skipping...")
		return
	}

	// List of 30 French names for BNI members
	names := []string{
		"Jean-Pierre Dupont",
		"Marie-Claire Martin",
		"François Leblanc",
		"Sophie Bernard",
		"Michel Moreau",
		"Isabelle Petit",
		"Philippe Durand",
		"Catherine Leroy",
		"Alain Robert",
		"Nathalie Simon",
		"Thierry Laurent",
		"Valérie Morel",
		"Pascal Roux",
		"Sandrine David",
		"Laurent Bertrand",
		"Céline Girard",
		"Patrick Bonnet",
		"Aurélie Dupuis",
		"Nicolas Fontaine",
		"Émilie Rousseau",
		"Stéphane Vincent",
		"Caroline Chevalier",
		"Jérôme Blanchard",
		"Delphine Gauthier",
		"Christophe Garcia",
		"Laure Martinez",
		"Frédéric Nguyen",
		"Sylvie Mercier",
		"Antoine Lefebvre",
		"Julie Perrin",
	}

	// Create persons
	for _, name := range names {
		person := models.Person{
			Name:    name,
			Present: false, // All start as absent
		}
		if err := DB.Create(&person).Error; err != nil {
			log.Printf("Error creating person %s: %v", name, err)
		}
	}

	log.Printf("Successfully seeded database with %d persons", len(names))
}