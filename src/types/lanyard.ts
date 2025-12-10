export interface LanyardData {
	active_on_discord_desktop: boolean;
	active_on_discord_mobile: boolean;
	active_on_discord_web: boolean;
	activities: any[];
	discord_status: string;
	discord_user: {
		avatar: string;
		discriminator: string;
		global_name: string;
		id: string;
		public_flags: number;
		username: string;
	};
	kv: Record<string, string>;
	listening_to_spotify: boolean;
	spotify: null | any;
	success: boolean;
}
