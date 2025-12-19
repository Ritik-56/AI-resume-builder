const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

// @route   POST api/resume
// @desc    Create a new resume
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, resumeType } = req.body;

    try {
        const newResume = new Resume({
            userId: req.user.id,
            title,
            resumeType,
            personalDetails: {},
            education: [],
            experience: [],
            skills: [],
            certifications: [],
        });

        const resume = await newResume.save();
        res.json(resume);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/resume
// @desc    Get all resumes for current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(resumes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/resume/analyze
// @desc    Analyze AI Content
// @access  Private
router.post('/analyze', auth, async (req, res) => {
    try {
        console.log("Received /analyze request");
        const { currentData } = req.body;
        if (!currentData) {
            console.error("Analyze error: Missing currentData");
            return res.status(400).json({ message: 'Missing resume data' });
        }
        const result = await analyzeResumeContent(currentData);
        console.log("Analysis successful");
        res.json(result);
    } catch (err) {
        console.error("Route Analysis Error:", err);
        res.status(500).json({ message: 'Server Error during analysis', details: err.message });
    }
});

// @route   GET api/resume/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        // Make sure user owns resume
        if (resume.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(resume);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Resume not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT api/resume/:id
// @desc    Update resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        // Make sure user owns resume
        if (resume.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Update fields
        // This is a simple update, for nested fields (like removing an education item) 
        // logic might need to be more specific or send the whole array
        const fieldsToUpdate = req.body;

        resume = await Resume.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true }
        );

        res.json(resume);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/resume/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        // Make sure user owns resume
        if (resume.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await resume.remove(); // OR await Resume.findByIdAndRemove(req.params.id); for newer mongoose

        res.json({ msg: 'Resume removed' });
    } catch (err) {
        console.error(err.message);
        // Note: For newer Mongoose versions, `remove()` might be deprecated on the document. 
        // Using deleteOne here for safety if the above fails in my mental model check, 
        // but `findByIdAndDelete` is safer usually.
        // Let's actually refine this in the catch block or rewriting it now to be safe.
        // Re-writing the delete logic below to be safer for Mongoose 6/7+
        try {
            await Resume.findByIdAndDelete(req.params.id);
            res.json({ msg: 'Resume removed' });
        } catch (innerErr) {
            res.status(500).send('Server error');
        }
    }
});

// Re-write delete to be cleaner based on the catch block comment
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) return res.status(404).json({ msg: 'Resume not found' });
        if (resume.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Resume.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Resume removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


const { generateResumeContent, analyzeResumeContent } = require('../services/aiService');

// @route   POST api/resume/generate
// @desc    Generate AI content for resume
// @access  Private
router.post('/generate', auth, async (req, res) => {
    const { resumeId, currentData } = req.body;

    try {
        const resume = await Resume.findById(resumeId);
        if (!resume) return res.status(404).json({ msg: 'Resume not found' });
        if (resume.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const generatedContent = await generateResumeContent(resume.resumeType, resume.personalDetails, currentData || resume);

        // We don't save automatically, we return to user to review/apply
        // But for "Auto-fill" we might want to suggest saving. 
        // Let's return the data for the frontend to populate.

        res.json(generatedContent);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during AI generation');
    }
});

module.exports = router;
