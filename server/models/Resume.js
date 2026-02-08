const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    resumeType: {
        type: String,
        required: true,
        enum: ['Engineering', 'Management', 'Banking', 'Finance', 'Analytics', 'IT', 'Custom'],
    },
    layout: {
        type: String,
        default: 'standard', // 'standard' or 'compact'
    },
    personalDetails: {
        fullName: String,
        role: String, // Job Title
        email: String,
        phone: String,
        location: String,
        location: String,
        linkedin: String, // URL
        objective: String,
        declaration: String,
    },
    education: [{
        institution: String,
        degree: String,
        year: String,
        gradeType: String, // 'Percentage' or 'CGPA'
        grade: String,
        marksheet: String, // URL or Link
    }],
    experience: [{
        company: String,
        role: String,
        duration: String,
        details: String, // Paragraph
    }],
    projects: [{
        title: String,
        link: String,
        description: String,
        technologies: String // Comma separated
    }],
    skills: [String],
    certifications: [{ // Changed from simple string array to object array or string
        name: String,
        details: String,
        link: String,
    }],
    aiGenerated: {
        careerObjective: String,
        declaration: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Resume', resumeSchema);
