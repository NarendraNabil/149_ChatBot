
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra-550b-a55b',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten AI yang ramah, ringkas, dan membantu.' },
          { role: 'user', content: message }
        ],
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || 'Gagal mendapatkan respons dari NVIDIA API.'
      });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// Jalankan server secara lokal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;