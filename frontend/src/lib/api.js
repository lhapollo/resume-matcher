const BASE_URL = 'http://localhost:5001';

export async function analyzeMatch(resumeFile, jobText) {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobText', jobText);

    const res = await fetch(`${BASE_URL}/api/match`, {
        method: 'POST',
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze match');
    return data;
}