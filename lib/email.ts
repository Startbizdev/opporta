import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: "noreply@opporta.app",
      to: email,
      subject: "Vérifiez votre adresse email - OPPORTA",
      html: `
        <h2>Bienvenue sur OPPORTA</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}" style="color: #2F6BFF;">Vérifier mon email</a>
        <p style="color: #666; font-size: 12px;">Le lien expire dans 24 heures.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

export async function sendReplyNotification(
  recipientEmail: string,
  postTitle: string,
  senderName: string
) {
  try {
    await resend.emails.send({
      from: "noreply@opporta.app",
      to: recipientEmail,
      subject: `Nouvelle réponse sur: ${postTitle}`,
      html: `
        <h2>Vous avez reçu une nouvelle réponse</h2>
        <p><strong>${senderName}</strong> a répondu à votre post "<strong>${postTitle}</strong>"</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="color: #2F6BFF;">Voir la conversation</a>
      `,
    });
  } catch (error) {
    console.error("Failed to send reply notification:", error);
  }
}
