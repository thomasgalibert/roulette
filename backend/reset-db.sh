#!/bin/bash

# Script to reset the roulette database
# This will delete the SQLite database file and let the application recreate it with seed data

echo "🎲 Roulette Database Reset Script"
echo "================================"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_FILE="$SCRIPT_DIR/roulette.db"

# Check if database file exists
if [ -f "$DB_FILE" ]; then
    echo "⚠️  Found existing database: $DB_FILE"
    read -p "Are you sure you want to delete this database? All data will be lost! (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        echo "🗑️  Deleting database..."
        rm -f "$DB_FILE"
        echo "✅ Database deleted successfully"
        echo ""
        echo "📝 The database will be recreated with seed data when you next run the application."
        echo "   Run './run.sh' or 'go run main.go' to start the server with a fresh database."
    else
        echo "❌ Database reset cancelled"
        exit 0
    fi
else
    echo "ℹ️  No database file found at: $DB_FILE"
    echo "   The database will be created when you run the application."
fi

echo ""
echo "✨ Done!"