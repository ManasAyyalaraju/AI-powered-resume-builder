from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    openai_api_key: Optional[str] = None  # we'll use this later

    model_config = {
        "env_file": ".env"
    }
    
    def validate_api_key(self):
        """Validate that the API key is set and not a placeholder."""
        if not self.openai_api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set. Please add your OpenAI API key to the .env file:\n"
                "OPENAI_API_KEY=your_actual_api_key_here\n"
                "Get your API key from: https://platform.openai.com/account/api-keys"
            )
        if self.openai_api_key in ["your_api_key_here", "your_actual_api_key_here", ""]:
            raise ValueError(
                "OPENAI_API_KEY is set to a placeholder value. Please replace it with your actual API key in the .env file.\n"
                "Get your API key from: https://platform.openai.com/account/api-keys"
            )
        if not self.openai_api_key.startswith("sk-"):
            raise ValueError(
                "OPENAI_API_KEY appears to be invalid. OpenAI API keys typically start with 'sk-'.\n"
                "Please check your API key in the .env file.\n"
                "Get your API key from: https://platform.openai.com/account/api-keys"
            )

settings = Settings()