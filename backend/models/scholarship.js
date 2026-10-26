const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    id: { type: Number, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: String, required: true, trim: true },
    deadline: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Soon', 'Closed'], default: 'Open' },
    description: { type: String, required: true, trim: true },
    eligibility: { type: mongoose.Schema.Types.Mixed, default: {} },
    field: { type: [String], default: [] },
    group: { type: String, default: 'all' },
    link: { type: String, default: '' },
    documents: { type: [String], default: [] },
    benefits: { type: [String], default: [] }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
