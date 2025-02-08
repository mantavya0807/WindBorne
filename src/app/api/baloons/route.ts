import { NextResponse } from "next/server";

const SAMPLE_DATA: [number, number, number][] = [
  [-0.8234947986247869, 172.81706041445517, 3.6808595556242256],
  [50.813010401735646, 141.85201829486707, 3.369649522061529],
  [72.66130077522725, 108.53954442453075, 17.35895906484483],
  [-62.981731785279365, 24.196209658094762, 14.06707702682182],
  [74.84547263518624, -77.2062158124169, 2.3123602919294157],
  [-3.4126363322169935, 114.54269440305465, 9.604115072197002],
];

export async function GET() {
  try {
    const response = await fetch(
      "https://a.windbornesystems.com/treasure/00.json"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching remote data:", error);
    // Fallback to sample data if remote fetch fails.
    return NextResponse.json(SAMPLE_DATA, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
