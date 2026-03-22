import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

async function generateLogo() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in environment');
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `A low poly geometric cat head logo, mysterious and ethereal, integrated into a deep black background (#0F0F0F). The cat head is filled with a luminous rainbow pastel mist (Pastel Blue, Pastel Violet, Pastel Yellow) emanating from the center. The outer contours are blurred into soft light glares and halos. The cat emerges from the darkness like a geometric aurora borealis. Behind the cat, there is a soft 'Glow Pastel Blue' effect for depth. The whiskers are ultra-thin, shimmering Pastel Yellow light filaments. High-tech, ethical, sophisticated aesthetic, centered composition. The logo is the light that illuminates the interface.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        fs.writeFileSync('public/Kaleidoland_logo.png', base64Data, 'base64');
        console.log('Logo generated and saved to public/Kaleidoland_logo.png');
        return;
      }
    }
    console.error('No image part found in response');
  } catch (error) {
    console.error('Error generating logo:', error);
  }
}

generateLogo();
