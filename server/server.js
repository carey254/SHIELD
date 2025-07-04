console.log('Server is starting...');
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const connectDB = require("./db");
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
});

const Feedback = mongoose.model("Feedback", FeedbackSchema, "feedback");

// Nodemailer Transporter (For sending emails)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

AWS.config.update({
    accessKeyId: 'AKIARUR7NWK5NNXDM BVB',
    secretAccessKey: 'NNbmH0TgOV/tJAEM6dB/GCzFgTyNXOacNN6BQQ3O',
    region: 'eu-west-1'
});

const polly = new AWS.Polly();

// Route to handle contact form submission
app.post("/send-message", async (req, res) => {
    const { name, email, message } = req.body;

    if (!email.endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Invalid email. Use @gmail.com" });
    }

    try {
        const feedback = new Feedback({ name, email, message });
        await feedback.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank you for your feedback!",
            text: `Hello ${name},\n\nThank you for reaching out to us! We have received your message: "${message}".\n\nWe'll get back to you soon.\n\nBest regards,\nYour Team`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("❌ Email sending failed:", err);
            } else {
                console.log("📧 Email sent:", info.response);
            }
        });

        res.json({ message: "Message received! Check your email for confirmation." });
    } catch (error) {
        res.status(500).json({ message: "Error saving feedback." });
    }
});

app.post('/tts', async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ message: 'Text is required.' });
    }
    const params = {
        OutputFormat: 'mp3',
        Text: text,
        VoiceId: 'Amy',
        LanguageCode: 'en-GB'
    };
    try {
        polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Polly error', error: err });
            }
            if (data && data.AudioStream instanceof Buffer) {
                res.set('Content-Type', 'audio/mpeg');
                res.send(data.AudioStream);
            } else {
                res.status(500).json({ message: 'No audio stream returned.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
