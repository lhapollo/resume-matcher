import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { marked } from 'marked';
import { generateCoverLetter } from '../lib/api';

function ScoreRing({ score }) {
  const radius = 96;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <div className="relative w-[240px] h-[240px] flex-shrink-0">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <circle cx="120" cy="120" r={radius} fill="none" strokeWidth="14" style={{ stroke: 'var(--ring-track)' }} />
        <circle
          cx="120" cy="120" r={radius} fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 120 120)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-mono font-semibold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-[15px] font-mono text-neutral-500 dark:text-neutral-400">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <span className="text-[11px] font-mono font-medium" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

function TagList({ items, variant }) {
  const styles = {
    green:  'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    red:    'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
  };

  if (!items?.length) {
    return <span className="text-sm text-neutral-500 italic">None identified</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`text-[11px] font-mono px-2.5 py-1 rounded-full ${styles[variant]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-yellow-600 dark:text-yellow-400 text-sm">{icon}</span>
      <span className="text-[14px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {title}
      </span>
    </div>
  );
}

function Card({ children, wide = false }) {
  return (
    <div className={`bg-white dark:bg-neutral-900 border border-neutral-800 dark:border-neutral-700 rounded-xl p-6 flex flex-col gap-6 ${wide ? 'md:col-span-2' : ''}`}>
      {children}
    </div>
  );
}

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  const [coverLetter, setCoverLetter] = useState(null);
  const [clLoading, setClLoading] = useState(false);
  const [clError, setClError] = useState(null);

  async function handleGenerateCoverLetter() {
    setClLoading(true);
    setClError(null);
    try {
        const text = await generateCoverLetter(resumeText, jobDescription);
        setCoverLetter(text);
    } catch (err) {
        setClError(err.message);
    } finally {
        setClLoading(false);
    }
  }

  if (!result) {
    navigate('/');
    return null;
  }

  const { resumeText, jobDescription } = state || {};

  const { overallScore, summary, categories, strengths, gaps, recommendations, analyzedAt } = result;

  const cats = [
    { label: 'Skills',     score: categories?.skills?.score },
    { label: 'Experience', score: categories?.experience?.score },
    { label: 'Education',  score: categories?.education?.score },
    { label: 'Keywords',   score: categories?.keywords?.score },
  ].filter(c => c.score != null);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 font-google-sans px-6 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 text-5xl">◈</span>
            <span className="text-5xl font-semibold tracking-tight dark:text-white">FitCheck</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xl text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white dark:hover:border-neutral-500 transition-all duration-200"
          >
            ← New Analysis
          </button>
        </header>

        {/* Score Hero */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-800 dark:border-neutral-700 rounded-xl p-8 mb-4">
          <div className="flex items-center justify-center gap-8">

            <ScoreRing score={overallScore} />

            {cats.length > 0 && (
              <div className="flex flex-col gap-3 flex-1 pt-2 min-w-[200px]">
                {cats.map(c => <CategoryBar key={c.label} label={c.label} score={c.score} />)}
              </div>
            )}

            <div className="pt-1 min-w-[220px] max-w-xs">
              <div className="text-[14px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Overall Match
              </div>
              <div
                className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked.parse(summary || '') }}
              />
              {analyzedAt && (
                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-500 mt-3">
                  {new Date(analyzedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {categories?.skills && (
            <Card>
              <div>
                <SectionTitle icon="✓" title="Matched Skills" />
                <TagList items={categories.skills.matched} variant="green" />
              </div>
              <div>
                <SectionTitle icon="✗" title="Missing Skills" />
                <TagList items={categories.skills.missing} variant="red" />
              </div>
            </Card>
          )}

          {categories?.keywords && (
            <Card>
              <div>
                <SectionTitle icon="◉" title="Matched Keywords" />
                <TagList items={categories.keywords.matched} variant="blue" />
              </div>
              <div>
                <SectionTitle icon="○" title="Missing Keywords" />
                <TagList items={categories.keywords.missing} variant="orange" />
              </div>
            </Card>
          )}

          {categories?.experience && (
            <Card wide>
              <div>
                <SectionTitle icon="⊞" title="Experience" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {categories.experience.notes}
                </p>
              </div>
              {categories?.education && (
                <div>
                  <SectionTitle icon="◎" title="Education" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {categories.education.notes}
                  </p>
                </div>
              )}
            </Card>
          )}

          {strengths?.length > 0 && (
            <Card>
              <SectionTitle icon="↑" title="Strengths" />
              <ul className="flex flex-col gap-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">↑</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {gaps?.length > 0 && (
            <Card>
              <SectionTitle icon="↓" title="Gaps" />
              <ul className="flex flex-col gap-2">
                {gaps.map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <span className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">↓</span>
                    {g}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {recommendations?.length > 0 && (
            <Card wide>
              <SectionTitle icon="→" title="Recommendations" />
              <ol className="flex flex-col gap-3">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-[10px] font-mono bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card wide>
            <SectionTitle icon="✉" title="Cover Letter" />
            {coverLetter ? (
                <>
                    <div
                        id="cover-letter-print"
                        className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: marked.parse(coverLetter) }}
                    />
                </>
            ) : (
                <button
                    onClick={handleGenerateCoverLetter}
                    disabled={clLoading}
                    className="self-start text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                    {clLoading ? 'Generating…' : 'Generate Cover Letter'}
                </button>
            )}
            {clError && <p className="text-sm text-red-500">{clError}</p>}
        </Card>

        </div>
      </div>
    </div>
  );
}
