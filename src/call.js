import { Vonage } from "@vonage/server-sdk";
import { config } from "dotenv";
config();

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});

export async function makeCall() {
  try {
    console.log("📞 Calling:");

    const res = await vonage.voice.createOutboundCall({
      to: [{ type: "phone", number: "919660294600" }],
      from: { type: "phone", number: '12345678901' },
      answer_url: [`${process.env.NGROK_DEV_URL}answer`],
      event_url: [`${process.env.NGROK_DEV_URL}event`]
    });

    console.log("✅ Call started:", res);
  } catch (err) {
    console.error("❌ Call error:", err);
  }
}
