const path = require('path');
require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const SchoolPartner = require('./models/school-partner');
const Admin = require('./models/admin.js');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/padhaanDB')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Mail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Create default admin
async function createDefaultAdmin() {
    try {
        const existing = await Admin.findOne({ email: 'padhaan.org@gmail.com' });

        if (!existing) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

            await Admin.create({
                email: 'padhaan.org@gmail.com',
                password: hashedPassword,
                role: 'superadmin'
            });

            console.log('✅ Default admin created');
        }
    } catch (err) {
        console.log('❌ DEFAULT ADMIN ERROR:', err);
    }
}
createDefaultAdmin();

// JWT Middleware
function verifyJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (!['superadmin', 'staff'].includes(decoded.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Message schema
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// PUBLIC ROUTES

app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newMessage = new Message({
            name,
            email,
            subject,
            message,
            status: 'Pending'
        });

        await newMessage.save();

        try {
            await transporter.sendMail({
                from: `"Padhaan" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'We received your message',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for contacting <strong>Padhaan</strong>.</p>
                        <p>We have received your message and our team will get back to you shortly.</p>
                        <p>Best regards,<br><strong>Padhaan Team</strong></p>
                    </div>
                `
            });
        } catch (e) {
            console.log('❌ CONTACT AUTO MAIL ERROR:', e);
        }

        res.json({ success: true, message: 'Saved successfully' });
    } catch (err) {
        console.log('❌ CONTACT SAVE ERROR:', err);
        res.status(500).json({ error: 'Failed to save contact message' });
    }
});

app.post('/school-partner', async (req, res) => {
    try {
        const newPartner = new SchoolPartner({
            ...req.body,
            status: 'Pending'
        });

        await newPartner.save();

        try {
            await transporter.sendMail({
                from: `"Padhaan" <${process.env.EMAIL_USER}>`,
                to: req.body.contactEmail,
                subject: 'Partnership request received',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
                        <h2>Hello ${req.body.contactName || 'there'},</h2>
                        <p>We received your school partnership request.</p>
                        <p>Our team will contact you soon.</p>
                        <p>Best regards,<br><strong>Padhaan Team</strong></p>
                    </div>
                `
            });
        } catch (e) {
            console.log('❌ SCHOOL AUTO MAIL ERROR:', e);
        }

        res.json({ success: true, message: 'School partnership request submitted successfully' });
    } catch (err) {
        console.log('❌ SCHOOL PARTNER ERROR:', err);
        res.status(500).json({ error: 'Failed to save school partnership request' });
    }
});

// AUTH ROUTES

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { role: admin.role, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ success: true, token, role: admin.role });
    } catch (err) {
        console.log('❌ LOGIN ERROR:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/admin/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.json({ message: 'If email exists, link sent' });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        const link = `http://localhost:5000/reset-password.html?token=${token}`;

        await transporter.sendMail({
            from: `"Padhaan" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Password',
            html: `<p>Click below to reset your password:</p><a href="${link}">${link}</a>`
        });

        res.json({ message: 'Reset link sent' });
    } catch (err) {
        console.log('❌ FORGOT PASSWORD ERROR:', err);
        res.status(500).json({ error: 'Email send failed' });
    }
});

app.post('/admin/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashed = await bcrypt.hash(newPassword, 10);

        await Admin.findByIdAndUpdate(decoded.id, {
            password: hashed
        });

        res.json({ message: 'Password updated' });
    } catch (err) {
        console.log('❌ RESET PASSWORD ERROR:', err);
        res.status(400).json({ error: 'Invalid token' });
    }
});

app.post('/admin/change-password', verifyJWT, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const admin = await Admin.findOne({ email: req.user.email });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Old password incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.log('❌ CHANGE PASSWORD ERROR:', err);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// ADMIN DASHBOARD ROUTES

app.get('/admin/messages', verifyJWT, async (req, res) => {
    try {
        const allMessages = await Message.find().sort({ createdAt: -1 });
        res.json(allMessages);
    } catch (err) {
        console.log('❌ FETCH MESSAGES ERROR:', err);
        res.status(500).json({ error: 'Data fetch nahi ho paya' });
    }
});

app.get('/admin/school-partners', verifyJWT, async (req, res) => {
    try {
        const allPartners = await SchoolPartner.find().sort({ createdAt: -1 });
        res.json(allPartners);
    } catch (err) {
        console.log('❌ FETCH SCHOOL PARTNER ERROR:', err);
        res.status(500).json({ error: 'School partnership data fetch nahi ho paya' });
    }
});

app.put('/admin/school-partners/:id/status', verifyJWT, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await SchoolPartner.findByIdAndUpdate(id, { status });
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        console.log('❌ SCHOOL STATUS UPDATE ERROR:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.delete('/admin/messages/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;

    if (req.user?.role !== 'superadmin') {
        return res.status(403).json({ error: 'Only superadmin can delete' });
    }

    try {
        await Message.findByIdAndDelete(id);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.log('❌ DELETE MESSAGE ERROR:', err);
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
});

app.delete('/admin/school-partners/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;

    try {
        await SchoolPartner.findByIdAndDelete(id);
        res.json({ success: true, message: 'School partnership request deleted successfully' });
    } catch (err) {
        console.log('❌ DELETE SCHOOL PARTNER ERROR:', err);
        res.status(500).json({ error: 'Failed to delete school partnership request' });
    }
});

app.post('/admin/reply', verifyJWT, async (req, res) => {
    const { to, subject, message, id } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        await transporter.sendMail({
            from: `"Padhaan" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: message
        });

        const updatedMessage = await Message.findByIdAndUpdate(id, { status: 'Resolved' });

        if (!updatedMessage) {
            await SchoolPartner.findByIdAndUpdate(id, { status: 'Contacted' });
        }

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
        console.log('❌ EMAIL ERROR:', err);
        res.status(500).json({ error: 'Email send failed' });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});