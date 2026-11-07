import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = (process.env.GEMINI_API_KEY || "").trim();

if (!apiKey) {
  console.warn("⚠️ PERINGATAN: GEMINI_API_KEY belum dikonfigurasi di file .env!");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

// Export model gemini-1.5-flash dengan konfigurasi output JSON
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1, // Rendah untuk meminimalkan halusinasi medis
  },
});

