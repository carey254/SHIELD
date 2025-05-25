console.log('Server is starting...');
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const connectDB = require("./db");

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
