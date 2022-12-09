import { Denops, variable, z } from "./deps.ts";
export const Config = z.object({
  apiKey: z.string(),
  prompt: z.optional(z.array(z.string())),
});

export type Config = z.infer<typeof Config>;

export async function load(denops: Denops): Promise<Config> {
  const config = await variable.g.get(denops, "openai_config");
  return Config.parse(config);
}
