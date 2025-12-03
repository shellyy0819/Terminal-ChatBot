import { config } from "dotenv";
config();

import express from "express";
import bodyParser from "body-parser";
import { makeCall } from "./call.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Vonage will call this when an SMS is received
app.get("/inbound-sms", (req, res) => {
  console.log("Inbound SMS:", req.query);
  res.status(200).send("OK");
});

// Create calls, control calls in-progress, get information about previous calls, and more.

app.get("/call", async (req, res) => {
  await makeCall();
  res.send("Call initiated!");
});

app.get("/answer", (req, res) => {
  console.log("📞 /answer webhook hit");
  res.json([
    {
      action: "talk",
      text: "Hello, your call is connected.",
    },
  ]);
});

// Call status updates
app.post("/event", (req, res) => {
  console.log("EVENT:", req.body);
  res.status(200).end();
});

app.listen(process.env.PORT, () => {
  console.log(`Webhook server running on port ${process.env.PORT}`);
  console.log("Expose this using ngrok when testing inbound SMS");
});
