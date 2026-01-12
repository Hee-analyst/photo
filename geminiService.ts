
import { GoogleGenAI } from "@google/genai";
import { PROMPTS } from "../constants";

export const transformImageToResumePhoto = async (base64Image: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean up base64 prefix if exists
  const imageData = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  const mimeType = base64Image.match(/^data:(image\/[a-z]+);base64,/)?. [1] || "image/jpeg";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          {
            text: PROMPTS.TRANSFORM_RESUME,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response parts received from AI model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("AI did not return an image. Please try another photo.");
  } catch (error: any) {
    console.error("Gemini Image Transformation Error:", error);
    throw new Error(error.message || "Failed to transform image. Please try again later.");
  }
};
