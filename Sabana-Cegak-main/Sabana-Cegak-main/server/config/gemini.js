import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = (process.env.GEMINI_API_KEY || "").trim();

if (!apiKey) {
  console.warn("⚠️ PERINGATAN: GEMINI_API_KEY belum dikonfigurasi di file .env!");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1,
  },
});

/**
 * Menjalankan generateContent multimodal dengan fallback model
 */
export const runGeminiWithFallback = async (parts) => {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini AI] Memproses dokumen dengan model: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const result = await model.generateContent(parts);
      console.log(`[Gemini AI] Model ${modelName} berhasil menghasilkan konten!`);
      return result;
    } catch (err) {
      console.warn(`[Gemini AI] Model ${modelName} gagal:`, err.message.split("\n")[0]);
      lastError = err;
    }
  }

  throw lastError;
};
