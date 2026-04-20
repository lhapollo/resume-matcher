const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

function buildPrompt(resumeText, jobDescription) {
    return `Analyze the alignment between this resume and job description. Be specific and honest.
    
    ---RESUME---
    ${resumeText}

    ---JOB DESCRIPTION---
    ${jobDescription}
    ---

    Respond ONLY with a valid JSON object. No markdown or backticks.

    {
        "overallScore": <integer 0-100>,
        "summary": "<2-3 sentence honest assessment>",
        "categories": {
            "skills": {
                "score": <integer 0-100>,
                "matched": [<list of key skills that matched>],
                "missing": [<list of key skills that were missing>]
            },
            "experience": {
                "score": <integer 0-100>,
                "notes": "<2-3 sentences about the quality and relevance of the candidate's experience>"
            },
            "education": {
                "score": <integer 0-100>,
                "notes": "<1-2 sentences about the candidate's education fit>"
            },
            "keywords": {
                "score": <integer 0-100>,
                "matched": [<list of important keywords from the job description found in the resume>],
                "missing": [<list of important keywords from the job description NOT found in the resume>]
            }
        },
        "strengths": [<list of the candidate's key strengths>],
        "gaps": [<list of the candidate's key gaps or weaknesses>],
        "recommendations": [<list of specific recommendations to improve the resume or skills>]
    }`;
}

async function analyzeMatch(resumeText, jobDescription) {
    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: buildPrompt(resumeText, jobDescription),
        config: {temperature: 0.2, maxOutputTokens: 2048 }
    });

    const rawText = res.text;
    if (!rawText) throw new Error("No response from Gemini");

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        throw new Error("Failed to parse Gemini response as JSON: " + cleaned.slice(0, 200));
    }
}

module.exports = { analyzeMatch };