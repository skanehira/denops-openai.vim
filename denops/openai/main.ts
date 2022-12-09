import { autocmd, Denops, helper, mapping } from "./deps.ts";
import { Client } from "./client.ts";
import { load } from "./config.ts";

export async function main(denops: Denops): Promise<void> {
  await denops.cmd(
    `command! OpenaiChat :e openai://chat`,
  );

  await autocmd.group(denops, "openai_chat_buffer", (helper) => {
    helper.remove("*");
    helper.define(
      "BufReadCmd",
      "openai://chat",
      `call denops#notify("${denops.name}", "openaiChat", [])`,
    );
    helper.define(
      "BufWriteCmd",
      "openai://chat",
      `call denops#notify("${denops.name}", "sendChatMessage", [getline(1, "$")])`,
    );
  });

  const config = await load(denops);
  const client = new Client(config);

  denops.dispatcher = {
    async openaiChat(): Promise<void> {
      await denops.cmd(
        "setlocal ft=markdown buftype=acwrite nomodified",
      );
      await denops.dispatch(denops.name, "sendChatMessage", ["Hello"]);
    },

    async sendChatMessage(message?: unknown): Promise<void> {
      // TODO argument validation
      let text = "";
      if (message) {
        text = (message as string[]).join("\n");
      } else {
        text = (await denops.call("getline", 1, "$") as string[]).join("\n");
      }
      await helper.echo(denops, "waiting for openai response...");
      const resp = await client.completion(text);
      await denops.call(
        "append",
        "$",
        resp.choices[0].text.split("\n").map((text) => `${text}`),
      );
      await denops.call("feedkeys", "Go");
      await helper.echo(denops, "");
    },
  };
}
