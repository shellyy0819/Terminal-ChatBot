import { config } from "dotenv";
config();

import { Vonage } from "@vonage/server-sdk";

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

async function sendSms() {
  try {
    const response = await vonage.sms.send({
      to: process.env.TO_NUMBER,
      from: process.env.FROM_NUMBER,
      text: "Hello from Vonage SMS POC!",
    });

    console.log("SMS Sent Successfully:", response);
  } catch (err) {
    console.error("Error sending SMS:", err);
  }
}

sendSms();
