const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
console.log('KEY LENGTH:', (process.env.GEMINI_API_KEY || '').length);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
model.generateContent({
  contents: [{ role: 'user', parts: [{ text: 'return json: {"a":1}' }] }],
  generationConfig: { responseMimeType: 'application/json' }
}).then(res => console.log('SUCCESS:', res.response.text())).catch(err => console.error('ERROR_CAUGHT:', err));
