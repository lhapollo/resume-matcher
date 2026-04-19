const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

//reads file and extracts text based on mimetype, supports PDF and Word documents -> mime = Multipurpose Internet Media Extension
async function extractText(filePath, mimetype) {
    const buffer = fs.readFileSync(filePath);

    if (mimetype === 'application/pdf') {
        const data = await pdfParse(buffer);
        return data.text.trim();
    }

    if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword'
    ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
    }

    throw new Error('Unsupported file type');
}

module.exports = { extractText };