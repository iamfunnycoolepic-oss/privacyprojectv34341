export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, platform, handle } = req.body;

    // Get IP (Vercel-compatible)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    // Geo lookup
    let country = "Unknown";
    let countryCode = "";

    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geo = await geoRes.json();
      country = geo.country_name || "Unknown";
      countryCode = geo.country_code || "";
    } catch {}

    const time = new Date().toUTCString();

    const message = `
🚀 *New Early Access Submission*

📧 Email: ${email}
📱 Platform: ${platform}
👤 Handle: ${handle}

🌍 Country: ${country}
🌐 IP: ${ip}
🕒 Time: ${time}
    `;

    const telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(telegramURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}
