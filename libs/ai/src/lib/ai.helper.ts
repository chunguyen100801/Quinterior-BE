import { Content } from '@google/generative-ai';

export function createContent(role: string, prompt: string): Content[] {
  return [
    {
      role: role,
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];
}
