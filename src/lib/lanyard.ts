import { LanyardData, LanyardWebSocketMessage } from "@/types/lanyard";

type LanyardEventType = "INIT_STATE" | "PRESENCE_UPDATE";

interface LanyardEventHandlers {
    onPresenceUpdate: (userId: string, data: LanyardData) => void;
    onConnect: () => void;
    onDisconnect: () => void;
}

class LanyardService {
    private ws: WebSocket | null = null;
    private userIds: string[] = [];
    private handlers: Partial<LanyardEventHandlers> = {};
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private readonly WS_URL = "wss://api.lanyard.rest/socket";

    subscribe(userIds: string[], handlers: Partial<LanyardEventHandlers>) {
        this.userIds = userIds;
        this.handlers = handlers;
        this.connect();
    }

    private connect() {
        if (typeof window === 'undefined') return;
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.WS_URL);

        this.ws.onopen = () => {
            this.handlers.onConnect?.();
            this.sendSubscribe();
        };

        this.ws.onmessage = (event) => {
            try {
                const message: LanyardWebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error("Failed to parse Lanyard message:", error);
            }
        };

        this.ws.onclose = () => {
            this.handlers.onDisconnect?.();
            this.cleanup();
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error("Lanyard WebSocket error:", error);
        };
    }

    private sendSubscribe() {
        if (typeof window !== 'undefined' && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_ids: this.userIds
                }
            }));
        }
    }

    private handleMessage(message: LanyardWebSocketMessage) {
        switch (message.op) {
            case 1:
                if (message.d && typeof message.d === 'object' && 'heartbeat_interval' in message.d) {
                    this.startHeartbeat((message.d as any).heartbeat_interval);
                }
                break;
            case 0:
                this.handleEvent(message.t as LanyardEventType, message.d as LanyardData);
                break;
        }
    }

    private handleEvent(eventType: LanyardEventType, data: LanyardData) {
        if (!data) return;

        switch (eventType) {
            case "INIT_STATE":
            case "PRESENCE_UPDATE":
                this.handlers.onPresenceUpdate?.(data.discord_user.id, data);
                break;
        }
    }

    private startHeartbeat(interval: number) {
        this.heartbeatInterval = setInterval(() => {
            if (typeof window !== 'undefined' && this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 3 }));
            }
        }, interval);
    }

    private cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) return;

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, 5000);
    }

    disconnect() {
        this.cleanup();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    async fetchPresence(userId: string): Promise<LanyardData | null> {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error(`Failed to fetch presence for ${userId}:`, error);
            return null;
        }
    }
}

export const lanyardService = new LanyardService();