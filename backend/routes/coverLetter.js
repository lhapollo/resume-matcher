const express = require('express');
const { generateCoverLetter } = require('../services/gemini');

const router = express.Router();

router.post('/', async (req, res) => {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: 'resumeText and jobDescription are required in the request body.' });
    }

    try {
        const coverLetter = await generateCoverLetter(resumeText, jobDescription);
        res.json({ coverLetter });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;