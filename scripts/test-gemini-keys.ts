import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";

// Read .env.local file directly
const envPath = path.resolve(process.cwd(), ".env.local");
let apiKeysStr = "";

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    if (line.startsWith("GEMINI_API_KEY=")) {
      apiKeysStr = line.substring("GEMINI_API_KEY=".length).trim();
      break;
    }
  }
}

const apiKeys = apiKeysStr.split(",").map(k => k.trim()).filter(Boolean);

console.log(`Found ${apiKeys.length} keys in .env.local\n`);

async function testKeys() {
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i];
    console.log(`Testing Key #${i} (${key.substring(0, 15)}...):`);
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      const result = await model.generateContent("Respond with the single word: HELLO");
      console.log(`  -> SUCCESS! Response: "${result.response.text().trim()}"\n`);
    } catch (err: any) {
      console.log(`  -> FAILED! Error: ${err.message || err}\n`);
    }
  }
}

testKeys();
