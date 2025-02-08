"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { Globe2, Wind, ArrowUp } from "lucide-react";

// Define types for clarity
type BalloonData = [number, number, number]; // [latitude, longitude, altitude]

type FormattedBalloon = {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
};

// Fallback sample data
const SAMPLE_DATA: BalloonData[] = [
  [-0.8234947986247869, 172.81706041445517, 3.6808595556242256],
  [50.813010401735646, 141.85201829486707, 3.369649522061529],
  [72.66130077522725, 108.53954442453075, 17.35895906484483],
  [-62.981731785279365, 24.196209658094762, 14.06707702682182],
  [74.84547263518624, -77.2062158124169, 2.3123602919294157],
  [-3.4126363322169935, 114.54269440305465, 9.604115072197002],
];

// Helper function to format raw data
const formatData = (data: BalloonData[]): FormattedBalloon[] => {
  return data.map((balloon, index) => ({
    id: index + 1,
    latitude: balloon[0],
    longitude: balloon[1],
    altitude: balloon[2],
  }));
};

const WindBorneDashboard = () => {
  const [constellationData, setConstellationData] = useState<FormattedBalloon[]>(
    formatData(SAMPLE_DATA)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch data directly from the remote endpoint using AllOrigins as a proxy.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        // Use AllOrigins to bypass CORS restrictions.
        const targetUrl = "https://a.windbornesystems.com/treasure/00.json";
        const proxyUrl =
          "https://api.allorigins.hexocode.repl.co/get?disableCache=true&url=";
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // AllOrigins returns a JSON with a "contents" field containing the fetched data.
        const allOriginsData = await response.json();
        // Parse the contents field to get the actual JSON data.
        const data: BalloonData[] = JSON.parse(allOriginsData.contents);

        setConstellationData(formatData(data));
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err instanceof Error && err.name === "AbortError") {
          setError("Connection timed out. Displaying sample data.");
        } else {
          setError("An error occurred. Displaying sample data.");
        }
        // Fallback to sample data
        setConstellationData(formatData(SAMPLE_DATA));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics based on the current data
  const stats = {
    totalBalloons: constellationData.length,
    avgAltitude:
      constellationData.reduce((acc, curr) => acc + curr.altitude, 0) /
      constellationData.length,
    maxAltitude: Math.max(...constellationData.map((b) => b.altitude)),
    minAltitude: Math.min(...constellationData.map((b) => b.altitude)),
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800">
          WindBorne Atlas Dashboard
        </h1>
      </header>

      {error && (
        <Alert className="mb-6 bg-yellow-100 border-yellow-500">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Alert className="mb-6 bg-blue-100 border-blue-500">
          <AlertDescription>Refreshing data...</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Globe2 className="h-6 w-6 text-indigo-600" />
              Active Balloons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-semibold text-center text-gray-700">
              {stats.totalBalloons}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <ArrowUp className="h-6 w-6 text-green-600" />
              Average Altitude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-semibold text-center text-gray-700">
              {stats.avgAltitude.toFixed(2)} km
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Wind className="h-6 w-6 text-red-600" />
              Altitude Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-semibold text-center text-gray-700">
              {stats.minAltitude.toFixed(1)} - {stats.maxAltitude.toFixed(1)} km
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Distribution Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Global Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="longitude"
                    domain={[-180, 180]}
                    label={{
                      value: "Longitude",
                      position: "insideBottomRight",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="latitude"
                    domain={[-90, 90]}
                    label={{
                      value: "Latitude",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <ZAxis type="number" dataKey="altitude" range={[50, 400]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload || !payload[0]) return null;
                      const data = payload[0].payload as FormattedBalloon;
                      return (
                        <div className="bg-white p-2 border rounded shadow-md">
                          <p className="font-medium">Balloon #{data.id}</p>
                          <p>Lat: {data.latitude.toFixed(4)}°</p>
                          <p>Lon: {data.longitude.toFixed(4)}°</p>
                          <p>Alt: {data.altitude.toFixed(2)} km</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Balloons" data={constellationData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Altitude Distribution Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Altitude Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="longitude"
                    domain={[-180, 180]}
                    label={{
                      value: "Longitude",
                      position: "insideBottomRight",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="altitude"
                    label={{
                      value: "Altitude (km)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload || !payload[0]) return null;
                      const data = payload[0].payload as FormattedBalloon;
                      return (
                        <div className="bg-white p-2 border rounded shadow-md">
                          <p className="font-medium">Balloon #{data.id}</p>
                          <p>Lon: {data.longitude.toFixed(4)}°</p>
                          <p>Alt: {data.altitude.toFixed(2)} km</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Balloons" data={constellationData} fill="#82ca9d" />
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
