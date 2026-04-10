require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));
// MongoDB connect
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/padhaanDB')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// JWT middleware
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Schema
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, default: "Pending" }
});

const Message = mongoose.model('Message', messageSchema);

// Public contact route
app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();
        res.json({ success: true, message: "Saved successfully" });
    } catch (err) {
        console.log("❌ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin login route
app.post('/admin/login', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.json({ success: true, token });
});

// Admin fetch messages
app.get('/admin/messages', verifyJWT, async (req, res) => {
    try {
        const allMessages = await Message.find().sort({ _id: -1 });
        res.json(allMessages);
    } catch (err) {
        res.status(500).json({ error: "Data fetch nahi ho paya" });
    }
});

// Admin delete message
app.delete('/admin/messages/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    try {
        await Message.findByIdAndDelete(id);
        res.json({ success: true, message: "Message deleted successfully" });
    } catch (err) {
        console.log("❌ ERROR:", err);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
});

// Admin reply
app.post('/admin/reply', verifyJWT, async (req, res) => {
    const { to, subject, message, id } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ error: "All fields required" });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text: message,
        });

        await Message.findByIdAndUpdate(id, { status: "Resolved" });

        res.json({ success: true, message: "Email sent successfully" });
    } catch (err) {
        console.log("❌ EMAIL ERROR:", err);
        res.status(500).json({ error: "Email send failed" });
    }
});

app.listen(process.env.PORT || 5000, () => console.log("Server running on port 5000"));