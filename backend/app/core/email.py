from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


async def send_email(subject: str, recipients: list[str], body: str):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"EMAIL SEND FAILED: {e}")


async def send_otp_email(to_email: str, otp: str, policy_number: str):
    await send_email(
        subject="Confirm Your Insurance Application",
        recipients=[to_email],
        body=f"""
        <p>Your verification code for policy application <b>{policy_number}</b> is:</p>
        <h2 style="letter-spacing: 4px;">{otp}</h2>
        <p>This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
        """,
    )