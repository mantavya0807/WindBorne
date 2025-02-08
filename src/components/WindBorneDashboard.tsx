"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Globe2, Wind, ArrowUp } from 'lucide-react';

// Sample data from the API response
const SAMPLE_DATA = [
  [-0.8234947986247869, 172.81706041445517, 3.6808595556242256],
  [50.813010401735646, 141.85201829486707, 3.369649522061529],
  [72.66130077522725, 108.53954442453075, 17.35895906484483],
  [-62.981731785279365, 24.196209658094762, 14.06707702682182],
  [74.84547263518624, -77.2062158124169, 2.3123602919294157],
  [-3.4126363322169935, 114.54269440305465, 9.604115072197002]
];

const formatData = (data) => {
  return data.map((balloon, index) => ({
    id: index + 1,
    latitude: balloon[0],
    longitude: balloon[1],
    altitude: balloon[2]
  }));
};

const WindBorneDashboard = () => {
  const [constellationData, setConstellationData] = useState(() => formatData(SAMPLE_DATA));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Using a proxy or direct fetch depending on environment
        const response = await fetch('/api/balloons');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setConstellationData(formatData(data));
        setError(null);
      } catch (err) {
        console.log('Using sample data due to:', err.message);
        // Keep using the sample data that was set initially
        setError('Using sample data for demonstration purposes.');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalBalloons: constellationData.length,
    avgAltitude: constellationData.reduce((acc, curr) => acc + curr.altitude, 0) / constellationData.length,
    maxAltitude: Math.max(...constellationData.map(b => b.altitude)),
    minAltitude: Math.min(...constellationData.map(b => b.altitude))
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">WindBorne Atlas Dashboard</h1>
      
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Alert className="mb-6">
          <AlertDescription>Refreshing data...</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-6 w-6" />
              Active Balloons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalBalloons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-6 w-6" />
              Average Altitude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.avgAltitude.toFixed(2)} km</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-6 w-6" />
              Altitude Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {stats.minAltitude.toFixed(1)} - {stats.maxAltitude.toFixed(1)} km
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="longitude" 
                    domain={[-180, 180]} 
                    label={{ value: 'Longitude', position: 'bottom' }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="latitude" 
                    domain={[-90, 90]} 
                    label={{ value: 'Latitude', angle: -90, position: 'left' }} 
                  />
                  <ZAxis type="number" dataKey="altitude" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || !payload[0]) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">Balloon #{data.id}</p>
                          <p>Lat: {data.latitude.toFixed(4)}°</p>
                          <p>Lon: {data.longitude.toFixed(4)}°</p>
                          <p>Alt: {data.altitude.toFixed(2)} km</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter 
                    name="Balloons" 
                    data={constellationData} 
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Altitude Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="longitude" 
                    domain={[-180, 180]} 
                    label={{ value: 'Longitude', position: 'bottom' }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="altitude" 
                    label={{ value: 'Altitude (km)', angle: -90, position: 'left' }} 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || !payload[0]) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">Balloon #{data.id}</p>
                          <p>Lon: {data.longitude.toFixed(4)}°</p>
                          <p>Alt: {data.altitude.toFixed(2)} km</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter 
                    name="Balloons" 
                    data={constellationData} 
                    fill="#82ca9d"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WindBorneDashboard;