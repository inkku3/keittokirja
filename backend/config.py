from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    database_url: str
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Static image serving options
    serve_images_from_backend: bool = False
    images_static_dir: str = "./static/recipes/img"
    images_url_prefix: str = "/recipes/img"
    images_base_url: Optional[str] = ""
    
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

settings = Settings()

