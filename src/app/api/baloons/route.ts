import { NextResponse } from "next/server";

// Fallback sample data (same type as [latitude, longitude, altitude])
const SAMPLE_DATA: [number, number, number][] = [
  [-0.8234947986247869, 172.81706041445517, 3.6808595556242256],
  [50.813010401735646, 141.85201829486707, 3.369649522061529],
  [72.66130077522725, 108.53954442453075, 17.35895906484483],
  [-62.981731785279365, 24.196209658094762, 14.06707702682182],
  [74.84547263518624, -77.2062158124169, 2.3123602919294157],
  [-3.4126363322169935, 114.54269440305465, 9.604115072197002],
];

export async function GET() {
  const remoteUrl = "https://a.windbornesystems.com/treasure/00.json";

  try {
    const response = await fetch(remoteUrl);
    // If the response is not OK (for example, 404), log and return fallback data.
    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}. Using fallback sample data.`
      );
      return NextResponse.json(SAMPLE_DATA, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching remote data:", error);
    return NextResponse.json(SAMPLE_DATA, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
