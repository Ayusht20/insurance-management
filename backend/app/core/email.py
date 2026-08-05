import resend
from app.config import settings

resend.api_key = settings.resend_api_key


async def send_email(subject: str, recipients: list[str], body: str):
    try:
        resend.Emails.send({
            "from": settings.mail_from,
            "to": recipients,
            "subject": subject,
            "html": body,
        })
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