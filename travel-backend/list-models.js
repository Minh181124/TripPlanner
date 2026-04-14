const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key:', apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');
  
  // Note: The @google/generative-ai package doesn't have a direct listModels method on the genAI object easily for some versions.
  // We can try a direct fetch to the discovery endpoint if needed, or just try a different model name.
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision'
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent('test');
      console.log(`✅ Model ${modelName} is AVAILABLE`);
    } catch (err) {
      console.log(`❌ Model ${modelName} failed: ${err.status} - ${err.message}`);
    }
  }
}

listModels();
