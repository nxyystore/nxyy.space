export interface WarmStatus {
	shards: Array<{
		id: number;
		guilds: number;
		users: number;
		ping: number;
		status: string;
	}>;
	total_guilds: number;
	total_users: number;
	total_shards: number;
	avg_ping: number;
	uptime: number;
}

export interface egirlsStatus {
	users: number;
	uploads: number;
	storageUsedBytes: number;
	storageUsedMB: number;
	storageUsedGB: number;
}
