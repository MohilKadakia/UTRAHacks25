// main.go

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"github.com/joho/godotenv"
)

// Point represents a single coordinate point in the workout
type Point struct {
	X                 float64 `json:"x" bson:"x"`
	Y                 float64 `json:"y" bson:"y"`
	ElapsedMilliseconds uint    `json:"elapsed" bson:"elapsed"`
}

// Workout represents the complete workout data
type Workout struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Points    []Point           `json:"points" bson:"points"`
	Timestamp time.Time         `json:"timestamp" bson:"timestamp"`
}

var workoutsCollection *mongo.Collection

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// MongoDB connection URI (get these values from .env file)
	username := os.Getenv("MONGO_USERNAME")
	password := os.Getenv("MONGO_PASSWORD")
	clusterURL := os.Getenv("MONGO_CLUSTER_URL")

	// MongoDB URI format
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/myFirstDatabase?retryWrites=true&w=majority", username, password, clusterURL)

	// Create a new MongoDB client
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	// Get database and collection
	database := client.Database("main")
	
	// Create collection with schema validation
	jsonSchema := bson.M{
		"bsonType": "object",
		"required": []string{"points", "timestamp"},
		"properties": bson.M{
			"points": bson.M{
				"bsonType": "array",
				"minItems": 1,
				"items": bson.M{
					"bsonType": "object",
					"required": []string{"x", "y", "elapsed"},
					"properties": bson.M{
						"x": bson.M{
							"bsonType": "double",
							"description": "x coordinate - must be a double/float",
						},
						"y": bson.M{
							"bsonType": "double",
							"description": "y coordinate - must be a double/float",
						},
						"elapsed": bson.M{
							"bsonType": "long",
							"minimum": 0,
							"multipleOf": 1,
							"description": "elapsed time in milliseconds - must be a non-negative integer",
						},
					},
				},
			},
			"timestamp": bson.M{
				"bsonType": "date",
				"description": "timestamp of the workout",
			},
		},
	}

	validator := bson.M{
		"$jsonSchema": jsonSchema,
	}

	opts := options.CreateCollection().SetValidator(validator)

	// Create collection if it doesn't exist
	collections, _ := database.ListCollectionNames(ctx, bson.M{"name": "workouts"})
	if len(collections) == 0 {
		err = database.CreateCollection(ctx, "workouts", opts)
		if err != nil {
			log.Fatal(err)
		}
	}

	workoutsCollection = database.Collection("workouts")

	// Setup HTTP routes
	http.HandleFunc("/addWorkout", addWorkoutHandler)
	http.HandleFunc("/getWorkouts", getWorkoutsHandler)
	http.HandleFunc("/getWorkout", getWorkoutHandler)

	// Start HTTP server
	fmt.Println("Server starting on port 4000...")
	log.Fatal(http.ListenAndServe(":4000", nil))
}

func addWorkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var points []Point
	if err := json.NewDecoder(r.Body).Decode(&points); err != nil {
		http.Error(w, "Invalid request body: expected array of points", http.StatusBadRequest)
		return
	}

	// Validate that we received at least one point
	if len(points) == 0 {
		http.Error(w, "Workout must contain at least one point", http.StatusBadRequest)
		return
	}

	// Create workout document
	workout := Workout{
		Points:    points,
		Timestamp: time.Now(),
	}

	// Insert into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := workoutsCollection.InsertOne(ctx, workout)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the inserted ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": result.InsertedID,
	})
}

func getWorkoutsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := workoutsCollection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var workouts []map[string]interface{}
	if err = cursor.All(ctx, &workouts); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workouts)
}

func getWorkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid id format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var workout map[string]interface{}
	err = workoutsCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&workout)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workout)
}