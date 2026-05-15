export type GenerateTextParams = {
  instructions: string;
  input: string;
  model?: string;
};

export type GenerateTextResult = {
  text: string;
  provider?: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
};

export type AITextProvider = {
  name: string;
  generateText: (params: GenerateTextParams) => Promise<GenerateTextResult>;
};
