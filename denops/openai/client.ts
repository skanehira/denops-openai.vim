import { ErrorResponse, Response } from "./types.ts";
import { Config } from "./config.ts";

export class Client {
  #apiKey = "";
  #defaultPrompt = [
    "The following is a conversation with an AI assistant.",
    "The assistant is helpful, creative, clever, and very friendly",
    "コードブロックは markdown 形式にしてほしい。",
    "コードブロックの syntax highlight をしてほしい。"
  ];

  constructor(config: Config) {
    this.#apiKey = config.apiKey;
    if (config.prompt) {
      this.#defaultPrompt = [...this.#defaultPrompt, ...config.prompt];
    }
  }

  async completion(text: string): Promise<Response> {
    const prompt = this.#defaultPrompt.concat([
      `Human: ${text}`,
      `AI:`,
    ]);

    const body = {
      model: "text-davinci-003",
      prompt: prompt.join("\n"),
      temperature: 0.9,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: ["Human:", "AI:"],
    };

    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      const body = ErrorResponse.parse(await response.json());
      console.log(body.error.message);
      throw new Error(body.error.message);
    } else {
      const body = Response.parse(await response.json());
      return body;
    }
  }
}
