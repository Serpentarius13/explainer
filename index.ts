import { Bot } from "grammy";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) throw new Error("No BOT_TOKEN");
  const openaiKey = process.env.OPENAI_KEY;
  if (!openaiKey) throw new Error("No OPENAI_KEY");

  const b = new Bot(botToken);
  const openai = new OpenAI({
    apiKey: openaiKey,
  });
  const getFileUri = (path: string) =>
    `https://api.telegram.org/file/bot${botToken}/${path}`;

  b.on("message:media", async (ctx) => {
    try {
      await ctx.reply("Received...");
      const f = await ctx.getFile();

      const blob = await fetch(getFileUri(f.file_path!))
        .then((r) => r.arrayBuffer())
        .then((r) => Buffer.from(r).toString("base64"));

      await ctx.reply("Processed file...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe what you see in this image, only tell about what is depicted, do not provide an explanation. If you see text, citate it directly, do not explain in your own words. Respond in Russian.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${blob}`,
                },
              },
            ],
          },
        ],
        store: true,
      });

      await ctx.reply(response.choices[0].message.content ?? "error", {
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
    } catch (error) {
      console.log(error);
      await ctx.reply(JSON.stringify(error, null, 2));
    }
  });
  b.start({
    onStart() {
      console.log("==== BOT STARTED ====");
    },
  });
}

run();
