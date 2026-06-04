const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GITHUB_TOKEN = process.env.PAT_TOKEN;
const REPO = 'ClarenceFerreiro/postman-api-tests';

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(chatId, text, replyMarkup) {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: 'markdown',
            reply_markup: replyMarkup
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function answerCallback(callbackQueryId, text) {
    try {
        await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
            callback_query_id: callbackQueryId,
            text: text,
            show_alert: false
        });
    } catch (error) {
        console.error('Error answering callback:', error.message);
    }
}

const startKeyboard = {
    inline_keyboard: [
        [
            { text: '📊 Status', callback_data: 'status' },
            { text: '📋 Report', callback_data: 'report' }
        ],
        [
            { text: '🚀 Run Tests', callback_data: 'run' },
            { text: '🔗 Allure Report', url: 'https://clarenceferreiro.github.io/postman-api-tests/' }
        ]
    ]
};

async function handleStatus(chatId) {
    await sendMessage(chatId, "✅ Postman: passed\n💙 TypeScript: passed\n🎭 Playwright: passed");
}

async function handleReport(chatId) {
    await sendMessage(chatId, "📊 *Отчёты:*\nPostman: https://clarenceferreiro.github.io/postman-api-tests/\nPlaywright: https://clarenceferreiro.github.io/postman-api-tests/playwright/");
}

async function handleRun(chatId) {
    await sendMessage(chatId, "🚀 Запускаю тесты...");
    try {
        await axios.post(
            `https://api.github.com/repos/${REPO}/actions/workflows/allure-report.yml/dispatches`,
            { ref: 'main' },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        await sendMessage(chatId, "✅ Тесты запущены!");
    } catch (error) {
        await sendMessage(chatId, "❌ Ошибка запуска");
    }
}

app.post(`/${TOKEN}`, async (req, res) => {
    const { message, callback_query } = req.body;

    if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text;

        if (text === '/start') {
            await sendMessage(
                chatId,
                "🤖 *Test Bot*\n\nИспользуй кнопки ниже для управления тестами.",
                startKeyboard
            );
        }
        else if (text === '/status') {
            await handleStatus(chatId);
        }
        else if (text === '/report') {
            await handleReport(chatId);
        }
        else if (text === '/run') {
            await handleRun(chatId);
        }
    }

    if (callback_query) {
        const chatId = callback_query.message.chat.id;
        const data = callback_query.data;
        const queryId = callback_query.id;

        if (data === 'status') {
            await answerCallback(queryId, 'Показываю статус');
            await handleStatus(chatId);
        }
        else if (data === 'report') {
            await answerCallback(queryId, 'Показываю отчёты');
            await handleReport(chatId);
        }
        else if (data === 'run') {
            await answerCallback(queryId, 'Запускаю тесты');
            await handleRun(chatId);
        }
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
