const mongoose = require('mongoose');

const schoolPartnerSchema = new mongoose.Schema({
    schoolName: String,
    schoolType: String,
    affiliation: String,
    studentCount: Number,
    schoolAddress: String,
    city: String,
    state: String,
    pincode: String,
    schoolWebsite: String,

    contactName: String,
    designation: String,
    contactEmail: String,
    contactPhone: String,
    altPhone: String,
    preferredTime: String,

    partnershipReason: String,
    specialRequirements: String,
    consent: Boolean,

    status: {
        type: String,
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('SchoolPartner', schoolPartnerSchema);