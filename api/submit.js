export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, platform, handle } = req.body || {};

    if (!email || !platform) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const BOT_TOKEN = process.env.TG_BOT_TOKEN;
    const CHAT_ID = process.env.TG_CHAT_ID; // keep negative

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Missing env vars');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ??
      req.socket?.remoteAddress ??
      'unknown';

    const time = new Date().toUTCString();

    const message = `
🧠 New Early Access Submission

📧 Email: ${email}
📱 Platform: ${platform}
👤 Handle: ${handle || 'N/A'}

🌍 IP: ${ip}
⏱ Time: ${time}
`;

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      }
    );

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      return res.status(500).json({ error: 'Telegram send failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
