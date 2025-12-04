from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str | None = None  # we'll use this later

    model_config = {
        "env_file": ".env"
    }

settings = Settings()