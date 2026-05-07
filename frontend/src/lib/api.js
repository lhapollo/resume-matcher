import { sessionId } from '../App';

const BASE_URL = 'http://localhost:5001';

export async function analyzeMatch(resumeFile, jobText) {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobText', jobText);

    const res = await fetch(`${BASE_URL}/api/match`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze match');
    return data;
}

export async function generateCoverLetter(resumeText, jobDescription) {
    const res = await fetch(`${BASE_URL}/api/cover-letter`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate cover letter');
    return data.coverLetter;
}

export async function fetchHistory() {
    const res = await fetch(`${BASE_URL}/api/history/${sessionId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
    return data;
}