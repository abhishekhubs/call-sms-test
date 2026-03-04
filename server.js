require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
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

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

// ── POST /mail ──────────────────────────────────────────────────
// Sends an emergency email via Nodemailer (Gmail)
app.post('/mail', async (req, res) => {
  const to = req.body.to || process.env.EMAIL_TO;
  if (!to) {
    return res.status(400).json({ success: false, message: 'No recipient email provided.' });
  }

  try {
    const info = await transporter.sendMail({
      from: `"🚨 Emergency Alert" <${process.env.EMAIL_USER}>`,
      to,
      subject: '🚨 EMERGENCY ALERT — Immediate Assistance Required',
      html: `
        <div style="font-family:Inter,sans-serif;background:#0a0a0f;color:#f0f0f5;padding:2rem;border-radius:12px;max-width:520px;margin:auto;">
          <h1 style="color:#e63946;margin-bottom:0.5rem;">🚨 Emergency Alert</h1>
          <p style="color:#8888aa;margin-bottom:1.5rem;">Sent automatically from the Emergency Alert System</p>
          <p style="font-size:1.1rem;line-height:1.7;">
            <strong>Someone has triggered an emergency email alert.</strong><br/>
            Please respond immediately and check on them as soon as possible.
          </p>
          <hr style="border-color:rgba(255,255,255,0.1);margin:1.5rem 0;"/>
          <p style="color:#8888aa;font-size:0.82rem;">This is an automated emergency message. Do not reply to this email.</p>
        </div>
      `,
    });
    console.log(`[MAIL] MessageID: ${info.messageId} → ${to}`);
    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    console.error('[MAIL ERROR]', err.message);
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
