require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set in server/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// SİSTEM YÖNERGESİ (KURALLAR) DOĞRUDAN MODELİN İÇİNE GÖMÜLÜR
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  systemInstruction: 'Sen yalnızca YKS, rehberlik, ders çalışma taktikleri ve ilgili sınav konularıyla ilgili yardımcı olacaksın. Kişisel tavsiye verirken genel, güvenli ve onaylanmış yöntemler öner. Sağlık, tıbbi teşhis, yasa dışı faaliyetler veya kişisel veri istekleri için kullanıcıyı yetkili bir uzmana yönlendir.'
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    // ARTIK SADECE KULLANICI MESAJINI GÖNDERİYORUZ, KURALLAR ZATEN MODELDE KAYITLI
    const result = await model.generateContent(message);
    const text = result.response?.text?.() ?? String(result);
    res.json({ reply: text });
    
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chat proxy running on http://localhost:${PORT}`));