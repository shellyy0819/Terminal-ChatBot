import { config } from 'dotenv';
config();


import express from 'express';
import bodyParser from 'body-parser';


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));


// Vonage will call this when an SMS is received
app.get('/inbound-sms', (req, res) => {
console.log('Inbound SMS:', req.query);
res.status(200).send('OK');
});


app.listen(process.env.PORT, () => {
console.log(`Webhook server running on port ${process.env.PORT}`);
console.log('Expose this using ngrok when testing inbound SMS');
});