import { autocmd, Denops, gather, helper } from "./deps.ts";
import { Client } from "./client.ts";
import { load } from "./config.ts";
import { Response } from "./types.ts";

export async function main(denops: Denops): Promise<void> {
  const config = await load(denops);
  const client = new Client(config);

  async function newline(num?: number): Promise<void> {
    const lines = [""];
    if (num && num > 1) {
      lines.push("");
    }
    await denops.batch(
      ["append", "$", lines],
      ["setcursorcharpos", "$", "0"],
    );
  }

  async function draw(
    stream: ReadableStream<string>,
  ): Promise<void> {
    let line = "AI: ";
    for await (const chunk of stream) {
      // NOTE: response body
      // data: {"id": "cmpl-6SIesreBDlTDhljzzg8afVwfuooWf", "object": "text_completion", "created": 1672202926, "choices": [{"text": "", "index": 0, "logprobs": null, "finish_reason": "stop"}], "model": "text-davinci-003"}
      // data: [DONE]
      // sometimes we would receive multiple event
      for (const message of chunk.split("\n")) {
        if (message.match(/^data: /)) {
          const body = message.replace("data: ", "");
          if (!body || body === "\n") {
            continue;
          }
          if (body === "[DONE]") {
            break;
          }

          const json = JSON.parse(body);
          const text = Response.parse(json).choices[0].text as string;
          for (const c of text) {
            if (c === "\n") {
              await newline();
              line = "";
            } else {
              line += c;
              await denops.call(
                "setline",
                ".",
                line,
              );
            }
          }
        }
      }
    }
    await newline();
  }

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

      try {
        const stream = await client.completion(text);
        if (await denops.call("line", ".") !== 1) {
          await newline(2);
        }
        await draw(stream);

        await gather(denops, async (helper) => {
          await helper.call("append", "$", "Human:  ");
          await helper.call("setcursorcharpos", "$", 8);
          await helper.cmd("startinsert");
        });
        await denops.cmd("setlocal nomodified");
      } catch (e) {
        await helper.echoerr(denops, e.message);
      }
    },
  };

  await denops.cmd(
    `command! OpenAIChat :drop openai://chat`,
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
}
