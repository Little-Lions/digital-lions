import logging
import os

import resend
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class EmailService:
    """Service to send emails."""

    def __init__(self, settings: BaseSettings):
        """Init the service."""
        self.settings = settings
        resend.api_key = self.settings.RESEND_API_KEY
        self.template_dir = os.path.join(".", "templates")
        self.register_template = os.path.join(self.template_dir, "register.html")
        self.register_subject = "Digital Lions Invite"

        self.reset_password_template = os.path.join(
            self.template_dir, "reset_password.html"
        )
        self.reset_password_subject = "Digital Lions Password Reset"  # nosec
        self.sender = self.settings.RESEND_SENDER

    def send_reset_password_link(self, email: str, link: str):
        """Reset user pass."""
        template = self._get_template(self.reset_password_template).replace(
            "{{ reset_link }}", link
        )
        params = self._get_send_params(email, self.reset_password_subject, template)
        email = resend.Emails.send(params)
        email_id = email["id"]
        logger.info(f"Password reset email sent to {email} with Resend id: {email_id}")

    def send_invite_link(self, email: str, link: str):
        """Send invite link (i.e. password reset link) to user."""
        template = self._get_template(self.register_template).replace(
            "{{ register_link }}", link
        )
        params = self._get_send_params(email, self.register_subject, template)
        email = resend.Emails.send(params)
        email_id = email["id"]
        logger.info(f"Invite link sent to {email} with Resend id: {email_id}")

    def _get_send_params(self, email_address: str, subject: str, template: str):
        """Get email send params."""
        params: resend.Emails.SendParams = {
            "from": self.sender,
            "to": [email_address],
            "subject": subject,
            "html": template,
        }
        return params

    def _get_template(self, path: str):
        """Get template from file."""
        with open(path) as f:
            return f.read()
