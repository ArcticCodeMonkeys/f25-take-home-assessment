from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import httpx
import uuid
import os
from dotenv import load_dotenv
from datetime import datetime

# Set up FastAPI application
app = FastAPI(title="Weather Data System", version="1.0.0")

# Load environment variables from .env file
load_dotenv()

# WeatherStack API configuration
WEATHERSTACK_API_KEY = os.getenv("WEATHERSTACK_API_KEY")
WEATHERSTACK_BASE_URL = "http://api.weatherstack.com/current"


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

async def fetch_weather_data(location: str) -> Dict[str, Any]:
    params = {
        "access_key": WEATHERSTACK_API_KEY,
        "query": location
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(WEATHERSTACK_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Check if API returned an error
            if "error" in data:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Weather API error: {data['error']['info']}"
                )
            
            return data
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=503, 
                detail=f"Weather service unavailable: {str(e)}"
            )

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    try:
        # Generate unique ID for this weather request
        weather_id = str(uuid.uuid4())
        
        # Fetch weather data from WeatherStack API
        weather_data = await fetch_weather_data(request.location)
        
        # Add user provided data and weather data
        all_data = {
            "id": weather_id,
            "user_data": {
                "date": request.date,
                "location": request.location,
                "notes": request.notes,
                "created_at": datetime.now().isoformat()
            },
            "weather_data": weather_data
        }
        
        weather_storage[weather_id] = all_data
        
        # Return the ID
        return WeatherResponse(id=weather_id)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)