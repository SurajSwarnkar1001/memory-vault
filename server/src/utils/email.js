import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendInvitationEmail = async (email, projectName, inviteLink) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Memory Vault" <${process.env.SMTP_FROM || 'noreply@memoryvault.com'}>`,
      to: email,
      subject: `You have been invited to collaborate on "${projectName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1b7a43;">Invitation to Collaborate</h2>
          <p>Hello!</p>
          <p>You have been invited to join the project <strong>"${projectName}"</strong> on Memory Vault.</p>
          <p>Click the button below to accept the invitation and start collaborating:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #1b7a43; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 40px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};
