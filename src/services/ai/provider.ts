export type AiProvider = "openai" | "claude" | "gemini";

export interface AiRequest {
  prompt: string;
  provider?: AiProvider;
}

export interface AiResponse {
  text: string;
  provider: AiProvider;
}

export class AiService {
  async generateText(request: AiRequest): Promise<AiResponse> {
    const provider = request.provider ?? "openai";
    const text = `AI response for: ${request.prompt}`;
    return { text, provider };
  }
}
