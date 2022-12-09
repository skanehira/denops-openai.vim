import { z } from "./deps.ts";

export const Choice = z.object({
  text: z.string(),
  index: z.number(),
  finish_reason: z.string(),
});

export const Usage = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});

export const Response = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(Choice),
  usage: Usage,
});
export type Response = z.infer<typeof Response>;

export const ErrorResponse = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
    param: z.any(),
    code: z.any(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponse>;
