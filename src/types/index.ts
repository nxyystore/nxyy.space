export interface TeamMember {
	name: string;
	role: string;
	id: string;
	info: string;
	website?: string;
}

export interface ProjectStats {
	[key: string]: {
		uptime?: string;
		users?: number;
    servers?: number;
    used_storage?: number;
	};
}
