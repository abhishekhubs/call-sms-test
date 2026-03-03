require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_PHONE_NUMBER;
const TO = process.env.MY_PHONE_NUMBER;

// ── POST /call ──────────────────────────────────────────────────
// Triggers an outbound voice call with a TwiML spoken message
app.post('/call', async (req, res) => {
  try {
    const call = await client.calls.create({
      to: TO,
      from: FROM,
      twiml: `<Response>
        <Say voice="alice" language="en-US">
          Emergency alert! Someone has pressed the emergency call button.
          Please respond immediately. I repeat — this is an emergency alert.
        </Say>
      </Response>`
    });
    console.log(`[CALL] SID: ${call.sid} → ${TO}`);
    res.json({ success: true, message: `Call initiated to ${TO}`, sid: call.sid });
  } catch (err) {
    console.error('[CALL ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /sms ───────────────────────────────────────────────────
// Sends an emergency SMS
app.post('/sms', async (req, res) => {
  try {
    const message = await client.messages.create({
      to: TO,
      from: FROM,
      body: `Hi Abhishek, contact me as soon as possible!`
    });
    console.log(`[SMS] SID: ${message.sid} → ${TO}`);
    res.json({ success: true, message: `SMS sent to ${TO}`, sid: message.sid });
  } catch (err) {
    console.error('[SMS ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Start Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n🚨 Emergency Server running at http://localhost:${PORT}`);
  console.log(`   From: ${FROM}  →  To: ${TO}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`   Run this to fix it, then try again:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -State Listen).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
