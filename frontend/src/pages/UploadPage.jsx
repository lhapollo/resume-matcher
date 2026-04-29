import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { analyzeMatch } from '../lib/api';

export default function UploadPage() {
  const [resume, setResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [jobText, setJobText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function handleFile(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setError('Please upload a PDF or DOCX file.'); return; }
    setError('');
    setResume(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file.type === 'application/pdf' ? URL.createObjectURL(file) : null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit() {
    if (!resume) return setError('Please upload your resume.');
    if (!jobText.trim()) return setError('Please enter the job description.');
    setError('');
    setLoading(true);
    try {
      const res = await analyzeMatch(resume, jobText);
      setFadingOut(true);
      setTimeout(() => {
        navigate('/results', { state: { result: res, resumeText: res.resumeText, jobDescription: res.jobDescription } });
      }, 400);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 font-google-sans transition-colors duration-200 absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]" style={{ opacity: fadingOut ? 0 : 1, transition: fadingOut ? 'opacity 400ms ease-in' : undefined }}>

      {/* Header */}
      <header className="flex items-center px-6 pr-20 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 dark:text-yellow-400 text-3xl">◈</span>
          <span className="text-3xl font-semibold tracking-tight dark:text-white">FitCheck</span>
        </div>
      </header>

      {/* Title */}
      <div className="flex flex-col items-center text-center px-6 pt-6 pb-5">
        <h1 className="text-6xl lg:text-7xl font-semibold tracking-tight dark:text-white leading-none">
          FitCheck
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-xl">
          How fit is your resume for a job? Find out below.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Resume card */}
        <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-800 dark:border-neutral-700 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 text-sm">◧</span>
              <span className="text-[14px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Your Resume</span>
            </div>
            {resume && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-3 py-1 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer"
              >
                Change file
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div
            onClick={!resume ? () => fileInputRef.current.click() : undefined}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg overflow-hidden transition-all duration-200
              ${!resume ? 'min-h-[240px] sm:min-h-[280px] lg:min-h-[300px] xl:min-h-[320px] 2xl:min-h-[420px] flex items-center justify-center cursor-pointer' : ''}
              ${dragOver
                ? 'border-yellow-400 bg-yellow-400/5'
                : resume
                ? 'border-neutral-300 dark:border-neutral-700'
                : 'border-neutral-700 hover:border-neutral-500'
              }
            `}
          >
            {resume ? (
              previewUrl ? (
                <iframe src={previewUrl} className="w-full h-[240px] sm:h-[280px] lg:h-[300px] xl:h-[320px] 2xl:h-[420px] block" title="Resume preview" />
              ) : (
                <div className="min-h-[240px] sm:min-h-[280px] lg:min-h-[300px] xl:min-h-[320px] 2xl:min-h-[420px] flex flex-col items-center justify-center gap-3 text-center p-8">
                  <span className="text-5xl text-neutral-400">📄</span>
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{resume.name}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{(resume.size / 1024).toFixed(1)} KB</div>
                  <div className="text-xs text-neutral-400">Preview not available for DOCX</div>
                </div>
              )
            ) : (
              <div className="text-center flex flex-col items-center gap-2">
                <span className="text-3xl text-neutral-400">⊕</span>
                <div className="text-sm font-medium text-neutral-500">Drop your resume here</div>
                <div className="text-xs text-neutral-400">PDF or DOCX, up to 10MB</div>
              </div>
            )}
          </div>
        </div>

        {/* Job description card */}
        <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-800 dark:border-neutral-700 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 text-sm">◨</span>
            <span className="text-[14px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Job Description</span>
          </div>

          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the job posting here. Markdown is supported."
            spellCheck={false}
            className="flex-1 min-h-[240px] sm:min-h-[280px] lg:min-h-[300px] xl:min-h-[320px] 2xl:min-h-[420px] border border-neutral-800 dark:border-neutral-700 rounded-lg p-4 text-sm placeholder-neutral-500 dark:placeholder-neutral-600 font-google-sans leading-relaxed resize-none outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 focus:border-neutral-600 dark:focus:border-neutral-500 transition-colors duration-200"
          />

          <div className="text-right font-mono text-[11px] text-neutral-500 dark:text-neutral-500">
            {jobText.length} chars
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-5xl mx-auto px-6 mb-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-center pb-16">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#e8ff6e] text-black font-semibold text-sm px-8 py-4 rounded-lg cursor-pointer hover:bg-[#f5ff8a] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Analyzing match...
            </>
          ) : (
            <>
              <span>Analyze Match</span>
              <span className="text-lg">→</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
