import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import migration, recipes

# Basic logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger('keittokirja')

app = FastAPI(
    title="Keittokirja API",
    description="Recipe API for the Keittokirja cookbook",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(migration.router)
app.include_router(recipes.router)

# Optionally mount static files for recipe images
if settings.serve_images_from_backend:
    try:
        from fastapi.staticfiles import StaticFiles
        import os

        static_dir = os.path.abspath(settings.images_static_dir)
        if not os.path.isdir(static_dir):
            logger.warning('IMAGES_STATIC_DIR %s does not exist; StaticFiles mount will still be created but may return 404s', static_dir)

        app.mount(settings.images_url_prefix, StaticFiles(directory=static_dir), name="recipe_images")
        logger.info('Mounted StaticFiles for recipe images at %s -> %s', settings.images_url_prefix, static_dir)
    except Exception as e:
        logger.exception('Failed to mount StaticFiles for images: %s', e)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_debug
    )
