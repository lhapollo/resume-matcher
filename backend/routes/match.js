const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { extractText } = require('../services/extractor');

const router = express.Router();

const upload = multer({
    dest: '/tmp/resume-matcher',
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed =  [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only PDF and DOCX files are supported'));
    }
});

function cleanUp(...paths) {
    paths.forEach(p => p && fs.existsSync(p) && fs.unlinkSync(p));
}

router.post(
    '/',
    upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'jobFile', maxCount: 1}]), 
    async( req, res) => {
        const resumePath = req.files?.resume?.[0]?.path;
        const resumeMime = req.files?.resume?.[0]?.mimetype;
        const jobFilePath = req.files?.jobFile?.[0]?.path;
        const jobFileMime = req.files?.jobFile?.[0]?.mimetype;
        const jobText = req.body?.jobText?.trim();

        try {
            if (!resumePath) return res.status(400).json({ error: 'Resume file required.'});
            if (!jobFilePath && !jobText) return res.status(400).json({error: 'Job description required'});

            const resumeText = await extractText(resumePath, resumeMime);
            if (!resumeText || resumeText.length < 50) return res.status(400).json({ error: 'Could not extract resume text.'});

            const jobDescription = jobFilePath ? await extractText(jobFilePath, jobFileMime) : jobText;

            const {analyzeMatch} = require('../services/gemini');

            const result = await analyzeMatch(resumeText, jobDescription);
            result.analyzedAt = new Date().toISOString();
            res.json(result);
            // res.json({
            //     status: 'extraction_ok',
            //     resumeLength: resumeText.length,
            //     jobLength: jobDescription.length,
            //     resumePreview: resumeText.slice(0, 200),
            //     jobPreview: jobDescription.slice(0, 200)
            // });
        } catch (err) {
            console.error('Error processing files: ', err.message);
            res.status(500).json({ error: err.message });
        } finally {
            cleanUp(resumePath, jobFilePath);
        }
    }
);

module.exports = router;