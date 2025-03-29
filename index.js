const express = require('express');
const axios = require('axios');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
const PORT = Math.floor(Math.random() * (9999 - 3000 + 1)) + 3000;

// Fungsi untuk mendapatkan nama bot dari API Telegram
async function getBotName() {
    try {
        const response = await axios.get("https://api.telegram.org/bot8081215093:AAEvcU4Vh1rwitBmEnXjHL-qXxBUYrDGZzo/getMe");
        if (response.data.ok) {
            return response.data.result.first_name;
        } else {
            throw new Error("Gagal mengambil nama bot.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

// Middleware untuk validasi API Key
app.use(async (req, res, next) => {
    const apiKey = req.query.apikey;
    if (!apiKey) {
        return res.status(400).json({ error: 'Parameter "apikey" harus diisi!' });
    }

    const botName = await getBotName();
    if (!botName) {
        return res.status(500).json({ error: "Gagal mengambil nama bot dari API Telegram." });
    }

    if (apiKey !== botName) {
        return res.status(403).json({ error: "Akses ditolak. API Key tidak valid!" });
    }

    next();
});

// Endpoint pairing
app.get('/pairing', async (req, res) => {
    const nomor = req.query.nomor;
    if (!nomor) {
        return res.status(400).json({ error: 'Parameter "nomor" harus diisi!' });
    }

    const zidddwaCodes = 20;

    res.json({
        nomor: nomor,
        message: `Berhasil mengirim ${zidddwaCodes} pairing code ke nomor ${nomor}.`,
        warning: `Jika Anda melakukan spam atau DDOS, web ini akan dihapus secara permanen.`,
        created: `Dzikry Hamidan`,
        date_created: `24-3-2025`
    });

    generatePairingCodes(nomor, zidddwaCodes).catch(error => {
        console.error('Kesalahan saat generate pairing code:', error);
    });
});

// Fungsi untuk generate pairing code
async function generatePairingCodes(nomor, zidddwaCodes) {
    const { state } = await useMultiFileAuthState('./node_modules');
    const BrezzeFx = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    const phoneNumber = nomor;
    const time = 2000; // Delay antar permintaan (2 detik)

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < zidddwaCodes; i++) {
        try {
            await new Promise(resolve => setTimeout(resolve, time));
            let code = await BrezzeFx.requestPairingCode(phoneNumber);
            console.log(`${phoneNumber} [${i + 1}/${zidddwaCodes}] - Code: ${code}`);
            successCount++;
        } catch (error) {
            failedCount++;
            console.error(`Error pada kode ${i + 1}:`, error.message);
        }
    }

    console.log(`Proses selesai. ${successCount} pairing code berhasil dikirim.`);
}

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
