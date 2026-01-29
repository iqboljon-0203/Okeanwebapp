export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { text, chat_id, reply_markup } = req.body;
    
    // Tokenni Environment Variable dan olamiz yoki fallback ishlatamiz
    const token = process.env.VITE_BOT_TOKEN || '8503195199:AAFnjXFzYIMGxTA3TK6yu0erWZFwsIhOeZE';

    if (!token) {
        return res.status(500).json({ error: 'Bot token not found on server' });
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chat_id,
                text: text,
                parse_mode: 'HTML',
                reply_markup: reply_markup
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Telegram Function Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
