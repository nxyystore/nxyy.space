import { useState, useEffect } from "react";
import { LanyardData } from "@/types/lanyard";

export const useLanyard = (userId: string) => {
	const [data, setData] = useState<LanyardData | null>(null);

	useEffect(() => {
		const fetchLanyardData = async () => {
			try {
				const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
				const lanyardData = await res.json();
				if (lanyardData.success) {
					setData(lanyardData.data);
				}
			} catch (error) {
				console.error(`Failed to fetch Lanyard data for user ${userId}`, error);
			}
		};

		fetchLanyardData();
	}, [userId]);

	return data;
};
