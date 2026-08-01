from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Firebase configuration for migration
    firebase_api_key: str = ""
    firebase_auth_domain: str = ""
    firebase_project_id: str = ""
    firebase_storage_bucket: str = ""
    firebase_messaging_sender_id: str = ""
    firebase_app_id: str = ""
    firebase_measurement_id: str = ""
    
    class Config:
        env_file = ".env"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Return parsed CORS origins.

        - If cors_origins is '*' (single star) return ['*'] to allow all origins.
        - If empty or only whitespace, return an empty list.
        - Otherwise, split by comma and trim entries.
        """
        raw = (self.cors_origins or "").strip()
        if raw == "*":
            return ["*"]
        if not raw:
            return []
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    
    @property
    def firebase_config(self) -> dict:
        return {
            "apiKey": self.firebase_api_key,
            "authDomain": self.firebase_auth_domain,
            "projectId": self.firebase_project_id,
            "storageBucket": self.firebase_storage_bucket,
            "messagingSenderId": self.firebase_messaging_sender_id,
            "appId": self.firebase_app_id,
            "measurementId": self.firebase_measurement_id,
        }

settings = Settings()

