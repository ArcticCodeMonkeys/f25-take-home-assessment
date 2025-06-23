"use client";

import React, { useState } from 'react';
import { Search, Calendar, MapPin, FileText, Thermometer, Wind, Droplets, Eye, AlertCircle, Loader2, Cloud, CloudSun } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define types for weatherData
type WeatherData = {
  id: string;
  user_data?: {
    date?: string;
    location?: string;
    notes?: string;
    created_at?: string;
  };
  weather_data?: {
    location?: {
      name?: string;
      region?: string;
      country?: string;
    };
    current?: {
      temperature?: number;
      wind_speed?: number;
      humidity?: number;
      visibility?: number;
      weather_descriptions?: string[];
    };
  };
};

export default function WeatherLookup() {
  const [weatherId, setWeatherId] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherData = async () => {
    if (!weatherId.trim()) {
      setError('Please enter a weather ID');
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherId.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Weather data not found. Please check the ID and try again.');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch weather data');
      }
    } finally {
      setLoading(false);
    }
  };

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = (e: HandleSubmitEvent): void => {
    e.preventDefault();
    fetchWeatherData();
  };

  interface FormatDateOptions {
    year: 'numeric';
    month: 'long';
    day: 'numeric';
  }

  const formatDate = (dateString: string | undefined): string => {
    try {
      return new Date(dateString as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      } as FormatDateOptions);
    } catch {
      return dateString as string;
    }
  };

  const formatDateTime = (dateString: string | undefined): string => {
    try {
      return new Date(dateString as string).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString as string;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Lookup</CardTitle>
        <CardDescription>
          Look up weather data using your request ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search Interface */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="weather-id" className="text-sm font-medium text-foreground">
                Weather ID
              </label>
              <div className="relative">
                <input
                  id="weather-id"
                  type="text"
                  value={weatherId}
                  onChange={(e) => setWeatherId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchWeatherData()}
                  placeholder="Enter weather ID (e.g., sample-weather-123)"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              onClick={fetchWeatherData}
              disabled={loading || !weatherId.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Searching...' : 'Look Up Weather Data'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Weather Data Display */}
          {weatherData && (
            <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
              {/* Header */}
              <div className="border-b border-border pb-3">
                <h3 className="text-lg font-semibold text-card-foreground">Weather Data Found!</h3>
                <p className="text-sm text-muted-foreground">ID: {weatherData.id}</p>
              </div>

              {/* User Request Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Request Details
                </h4>
                <div className="grid gap-2 text-sm text-card-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(weatherData.user_data?.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{weatherData.user_data?.location}</span>
                  </div>
                  {weatherData.user_data?.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="font-medium">Notes:</span>
                      <span className="text-muted-foreground">{weatherData.user_data.notes}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created: {formatDateTime(weatherData.user_data?.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Weather Information */}
              {weatherData.weather_data && (
                <div className="space-y-3">
                  <h4 className="font-medium text-card-foreground flex items-center gap-2">
                    <CloudSun className="h-4 w-4" />
                    Current Weather
                  </h4>
                  
                  {/* Location Info */}
                  {weatherData.weather_data.location && (
                    <div className="text-sm text-card-foreground">
                      <span className="font-medium">
                        {weatherData.weather_data.location.name}
                        {weatherData.weather_data.location.region && 
                          `, ${weatherData.weather_data.location.region}`}
                        {weatherData.weather_data.location.country && 
                          `, ${weatherData.weather_data.location.country}`}
                      </span>
                    </div>
                  )}

                  {/* Weather Details */}
                  {weatherData.weather_data.current && (
                    <div className="grid grid-cols-2 gap-3 text-sm text-card-foreground">
                      <div className="flex items-center gap-2">
                        
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span>Temp: {weatherData.weather_data.current.temperature}°C</span>
                      </div>
                      
                      {weatherData.weather_data.current.wind_speed && (
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-blue-500" />
                          <span>Gusts: {weatherData.weather_data.current.wind_speed} km/h</span>
                        </div>
                      )}
                      
                      {weatherData.weather_data.current.humidity && (
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-400" />
                          <span>Prec: {weatherData.weather_data.current.humidity}%</span>
                        </div>
                      )}
                      
                      {weatherData.weather_data.current.visibility && (
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>Visibility: {weatherData.weather_data.current.visibility} km</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weather Description */}
                  {weatherData.weather_data.current?.weather_descriptions && (
                    <div className="text-sm text-card-foreground">
                      <span className="font-medium">Conditions: </span>
                      <span className="text-muted-foreground">
                        {weatherData.weather_data.current.weather_descriptions.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}