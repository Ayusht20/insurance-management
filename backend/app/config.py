from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    mail_username: str
    mail_password: str
    mail_from: str
    mail_port: int = 587
    mail_server: str

    class Config:
        env_file = ".env"

settings = Settings()