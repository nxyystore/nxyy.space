import { NextResponse } from "next/server";

export async function GET() {
	try {
		const response = await fetch("https://api.e-girls.host/stats", {
            headers: {
                Accept: "application/json",
                "User-Agent": "nxyy crawler (https://nxyy.space/)",
            },
        });

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.statusText}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
        return NextResponse.json(
			{
				error: "Failed to fetch e-girls.host stats",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

