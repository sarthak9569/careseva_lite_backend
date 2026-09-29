from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        # Map room_name -> List[WebSocket]
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        if room not in self.active_rooms:
            self.active_rooms[room] = []
        self.active_rooms[room].append(websocket)
        print(f"📡 WebSocket connected to room: {room}")

    def disconnect(self, room: str, websocket: WebSocket):
        if room in self.active_rooms:
            if websocket in self.active_rooms[room]:
                self.active_rooms[room].remove(websocket)
            if not self.active_rooms[room]:
                del self.active_rooms[room]
        print(f"📡 WebSocket disconnected from room: {room}")

    async def broadcast_to_room(self, room: str, message: dict):
        if room in self.active_rooms:
            for connection in self.active_rooms[room]:
                try:
                    await connection.send_text(json.dumps(message, default=str))
                except Exception as e:
                    print(f"❌ Error broadcasting to socket: {e}")

ws_manager = ConnectionManager()
