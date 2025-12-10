import { NextResponse } from "next/server";

export async function GET() {
	try {
		const response = await fetch("https://api.warm.lat/bot/status", {
			headers: {
				Accept: "application/json",
				"User-Agent": "nxyy crawler (https://nxyy.space/)",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch warm.lat stats",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
