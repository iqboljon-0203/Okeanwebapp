const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN || '8503195199:AAFnjXFzYIMGxTA3TK6yu0erWZFwsIhOeZE';
const DEFAULT_CHAT_ID = '-1003804421466';

export const notifyTelegramGroup = async (text, chatId = DEFAULT_CHAT_ID, replyMarkup = null) => {
    try {
        const isDev = import.meta.env.DEV;
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        };
        if (replyMarkup) {
            body.reply_markup = replyMarkup;
        }

        if (isDev) {
            await fetch(`/telegram-api/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            await fetch('/api/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }
    } catch (err) {
        console.error('Telegram notification error:', err);
    }
};

