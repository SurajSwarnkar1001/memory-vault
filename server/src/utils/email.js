export const sendInvitationEmail = async (email, projectName, inviteLink) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL is not configured. Falling back to console log.');
    console.log('--- DEVELOPMENT INVITE LINK ---');
    console.log(inviteLink);
    return false; // Return false so the frontend knows it was not actually sent via email
  }

  try {
    const payload = {
      email,
      projectName,
      inviteLink
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`n8n webhook failed with status: ${response.status}`);
      return false;
    }

    console.log('Invitation triggered via n8n webhook successfully.');
    return true;
  } catch (error) {
    console.error('Error triggering n8n webhook:', error);
    return false;
  }
};
