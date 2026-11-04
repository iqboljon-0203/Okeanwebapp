import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.VITE_BOT_TOKEN;
const WEB_APP_URL = process.env.WEBAPP_URL || process.env.VITE_WEBAPP_URL || 'https://okean-market.vercel.app';

// --- 1. ADMINLAR ID RO'YXATI ---
const ADMIN_IDS = [
    1332582307,
    8146600957,
    224939174
];

// --- 2. KURYERLAR ID RO'YXATI ---
const COURIER_IDS = [
    7487725350,
    224939174
];

const bot = new Telegraf(BOT_TOKEN || 'DUMMY_TOKEN');

// --- 3. /start komandasi ---
bot.start(async (ctx) => {
    const name = ctx.from.first_name || 'foydalanuvchi';
    const userId = ctx.from.id;

    // Foydalanuvchi rolini tekshiramiz
    const isAdmin = ADMIN_IDS.includes(userId);
    const isCourier = COURIER_IDS.includes(userId);

    let welcomeMessage = `👋 *Salom, ${name}!*\n\n*OkeanMarket* — qulay va tezkor xaridlar platformasi.`;

    // Asosiy tugma (Hamma uchun chiqadi)
    let buttons = [
        [Markup.button.webApp('🚀 Okean Marketni ochish', WEB_APP_URL)]
    ];

    // Agar admin bo'lsa
    if (isAdmin) {
        welcomeMessage += `\n\n🕵️‍♂️ *Siz Adminsiz.* Boshqaruv paneliga kirishingiz mumkin.`;
        buttons.push([
            Markup.button.webApp('⚙️ Admin Panel', `${WEB_APP_URL}/admin`)
        ]);
    }

    // Agar kuryer bo'lsa
    if (isCourier) {
        welcomeMessage += `\n\n🛵 *Siz Kuryersiz.* Buyurtmalarni qabul qilish uchun panelga o'ting.`;
        buttons.push([
            Markup.button.webApp('🛵 Kuryer Paneli', `${WEB_APP_URL}/courier`)
        ]);
    }

    // Oddiy foydalanuvchi bo'lsa
    if (!isAdmin && !isCourier) {
        welcomeMessage += `\nMarketni ochish uchun pastdagi tugmani bosing! 🌊`;
    }

    return ctx.replyWithMarkdown(
        welcomeMessage,
        Markup.inlineKeyboard(buttons)
    );
});

// --- 4. Har qanday xabar yuborilganda ---
bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const isAdmin = ADMIN_IDS.includes(userId);
    const isCourier = COURIER_IDS.includes(userId);

    let buttons = [
        [Markup.button.webApp('🚀 Okean Marketni ochish', WEB_APP_URL)]
    ];

    if (isAdmin) {
        buttons.push([Markup.button.webApp('⚙️ Admin Panel', `${WEB_APP_URL}/admin`)]);
    }

    if (isCourier) {
        buttons.push([Markup.button.webApp('🛵 Kuryer Paneli', `${WEB_APP_URL}/courier`)]);
    }

    return ctx.reply('Quyidagi tugmalar orqali davom eting:',
        Markup.inlineKeyboard(buttons)
    );
});

// --- 5. Vercel Serverless Function Handler ---
export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            return res.status(200).json({ ok: true });
        } catch (error) {
            console.error('Telegram Update xatosi:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'GET') {
        try {
            // Brauzer orqali /api/bot?setup=menu deb kirilsa, Menu tugmasini avtomatik sozlaydi
            if (req.query?.setup === 'menu') {
                await bot.telegram.setChatMenuButton({
                    menuButton: {
                        type: 'web_app',
                        text: 'Market 🛒',
                        web_app: { url: WEB_APP_URL }
                    }
                });
                return res.status(200).json({ ok: true, message: 'Chat menu tugmasi muvaffaqiyatli sozlandi!' });
            }

            return res.status(200).json({
                ok: true,
                status: 'OkeanBot Serverless Webhook ishlab turibdi!',
                menuSetupTip: 'Menu tugmasini sozlash uchun: ?setup=menu'
            });
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

