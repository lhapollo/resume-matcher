import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
        <span className="text-6xl font-mono font-semibold leading-none" style={{ color }}>{score}</span>
        <span className="text-[18px] font-mono text-neutral-500 dark:text-neutral-400">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[15px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-[15px] font-mono font-medium" style={{ color }}>{score}</span>
      </div>
      <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: color }} />
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
  if (!items?.length) return <span className="text-base text-neutral-500 italic">None identified</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`text-[15px] font-mono px-2.5 py-1 rounded-full ${styles[variant]}`}>{item}</span>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-yellow-600 dark:text-yellow-400 text-base">{icon}</span>
      <span className="text-[16px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{title}</span>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-800 dark:border-neutral-700 rounded-xl p-10 flex flex-col gap-6">
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState('translate-x-0 opacity-100');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [fading, setFading] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setPageVisible(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  function switchMode(toShowAll) {
    setFading(true);
    setTimeout(() => {
      setShowAll(toShowAll);
      setFading(false);
    }, 250);
  }

  if (!result) { navigate('/'); return null; }

  const { resumeText, jobDescription } = state || {};
  const { overallScore, summary, categories, strengths, gaps, recommendations, analyzedAt } = result;

  const cats = [
    { label: 'Skills',     score: categories?.skills?.score },
    { label: 'Experience', score: categories?.experience?.score },
    { label: 'Education',  score: categories?.education?.score },
    { label: 'Keywords',   score: categories?.keywords?.score },
  ].filter(c => c.score != null);

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

  const slides = [
    // Score hero
    <Card key="hero">
      <div className="flex items-center gap-8">
        <ScoreRing score={overallScore} />
        {cats.length > 0 && (
          <div className="flex flex-col gap-3 flex-1 pt-2">
            {cats.map(c => <CategoryBar key={c.label} label={c.label} score={c.score} />)}
          </div>
        )}
        <div className="pt-1 flex-1">
          <div className="text-[16px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">Overall Match</div>
          <div className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: marked.parse(summary || '') }} />
          {analyzedAt && (
            <div className="text-[13px] font-mono text-neutral-500 dark:text-neutral-500 mt-3">{new Date(analyzedAt).toLocaleString()}</div>
          )}
        </div>
      </div>
    </Card>,

    categories?.skills && (
      <Card key="skills">
        <div>
          <SectionTitle icon="✓" title="Matched Skills" />
          <TagList items={categories.skills.matched} variant="green" />
        </div>
        <div>
          <SectionTitle icon="✗" title="Missing Skills" />
          <TagList items={categories.skills.missing} variant="red" />
        </div>
      </Card>
    ),

    categories?.keywords && (
      <Card key="keywords">
        <div>
          <SectionTitle icon="◉" title="Matched Keywords" />
          <TagList items={categories.keywords.matched} variant="blue" />
        </div>
        <div>
          <SectionTitle icon="○" title="Missing Keywords" />
          <TagList items={categories.keywords.missing} variant="orange" />
        </div>
      </Card>
    ),

    categories?.experience && (
      <Card key="experience">
        <div>
          <SectionTitle icon="⊞" title="Experience" />
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">{categories.experience.notes}</p>
        </div>
        {categories?.education && (
          <div>
            <SectionTitle icon="◎" title="Education" />
            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">{categories.education.notes}</p>
          </div>
        )}
      </Card>
    ),

    strengths?.length > 0 && (
      <Card key="strengths">
        <SectionTitle icon="↑" title="Strengths" />
        <ul className="flex flex-col gap-2">
          {strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">↑</span>{s}
            </li>
          ))}
        </ul>
      </Card>
    ),

    gaps?.length > 0 && (
      <Card key="gaps">
        <SectionTitle icon="↓" title="Gaps" />
        <ul className="flex flex-col gap-2">
          {gaps.map((g, i) => (
            <li key={i} className="flex gap-2 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <span className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">↓</span>{g}
            </li>
          ))}
        </ul>
      </Card>
    ),

    recommendations?.length > 0 && (
      <Card key="recommendations">
        <SectionTitle icon="→" title="Recommendations" />
        <ol className="flex flex-col gap-3">
          {recommendations.map((r, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-[12px] font-mono bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">{r}</span>
            </li>
          ))}
        </ol>
      </Card>
    ),

    <Card key="cover-letter">
      <SectionTitle icon="✉" title="Cover Letter" />
      {coverLetter ? (
        <div
          id="cover-letter-print"
          className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: marked.parse(coverLetter) }}
        />
      ) : (
        <button
          onClick={handleGenerateCoverLetter}
          disabled={clLoading}
          className="self-start text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {clLoading ? 'Generating…' : 'Generate Cover Letter'}
        </button>
      )}
      {clError && <p className="text-sm text-red-500">{clError}</p>}
    </Card>,
  ].filter(Boolean);

  function goTo(nextIndex, dir) {
    if (isAnimating) return;
    setIsAnimating(true);
    // Exit current card
    setAnimClass(`transition-all duration-300 ease-in-out ${dir === 'forward' ? '-translate-x-full' : 'translate-x-full'} opacity-0`);
    setTimeout(() => {
      // Snap new card to the opposite off-screen side (no transition)
      setAnimClass(dir === 'forward' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0');
      setCurrentIndex(nextIndex);
      // Two rAFs to ensure the DOM paints the off-screen position before transitioning in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimClass('transition-all duration-300 ease-in-out translate-x-0 opacity-100');
        setTimeout(() => setIsAnimating(false), 300);
      }));
    }, 300);
  }

  const goNext = () => {
    if (currentIndex < slides.length - 1) goTo(currentIndex + 1, 'forward');
    else switchMode(true);
  };
  const goPrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1, 'backward');
  };

  // "View All" mode: normal scrollable layout showing every card
  if (showAll) {
    return (
      <div className={`min-h-screen bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] font-google-sans px-6 py-12 transition-all duration-[400ms] ${fading || !pageVisible ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between pr-14 mb-10">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
              <span className="text-yellow-600 dark:text-yellow-400 text-5xl">◈</span>
              <span className="text-5xl font-semibold tracking-tight dark:text-white">FitCheck</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => switchMode(false)}
                className="text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer"
              >
                ← Slideshow
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer"
              >
                New Analysis
              </button>
            </div>
          </header>
          <div className="flex flex-col gap-4">
            {slides}
          </div>
        </div>
      </div>
    );
  }

  const isLast = currentIndex === slides.length - 1;

  return (
    <div className={`h-screen flex flex-col bg-white dark:bg-neutral-950 font-google-sans transition-all duration-[400ms] overflow-hidden ${fading || !pageVisible ? 'opacity-0' : 'opacity-100'}`}>

      {/* Header — right-padded so "New Analysis" doesn't hide under the fixed dark-mode toggle */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 pr-20 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          <span className="text-yellow-600 dark:text-yellow-400 text-3xl">◈</span>
          <span className="text-3xl font-semibold tracking-tight dark:text-white">FitCheck</span>
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => switchMode(true)}
            className="text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer"
          >
            View All
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer"
          >
            ← New Analysis
          </button>
        </div>
      </header>

      {/* Card stage with side navigation zones */}
      <div className="flex-1 flex items-center overflow-hidden min-h-0 relative">

        {/* Left click zone */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0 || isAnimating}
          className="absolute left-0 top-0 h-full w-50 z-10 flex items-center justify-center group disabled:opacity-0 disabled:cursor-default transition-all duration-200 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 rounded-r-xl"
          aria-label="Previous"
        >
          <span className="text-5xl text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors duration-200 select-none">‹</span>
        </button>

        {/* Right click zone */}
        <button
          onClick={goNext}
          disabled={isAnimating}
          className="absolute right-0 top-0 h-full w-50 z-10 flex items-center justify-center group transition-all duration-200 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 rounded-l-xl"
          aria-label="Next"
        >
          <span className="text-5xl text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors duration-200 select-none">›</span>
        </button>

        <div className="flex-1 flex items-center justify-center px-32 overflow-hidden">
          <div className={`w-full max-w-4xl ${animClass}`}>
            {slides[currentIndex]}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-t border-neutral-100 dark:border-neutral-800">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0 || isAnimating}
          className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => !isAnimating && i !== currentIndex && goTo(i, i > currentIndex ? 'forward' : 'backward')}
              className={`rounded-full transition-all duration-200 cursor-pointer ${
                i === currentIndex
                  ? 'w-4 h-2 bg-yellow-500'
                  : 'w-2 h-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={isAnimating}
          className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

    </div>
  );
}
