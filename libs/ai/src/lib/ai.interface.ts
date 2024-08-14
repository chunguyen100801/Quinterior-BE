export interface AIServiceInterface {
  generateText(prompt: string): Promise<string>;
}
