import { useLocation, useNavigate } from 'react-router-dom';
import { marked } from 'marked';

function ScoreRing({ score }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#6bffb8' : score >= 50 ? '#e8ff6e' : '#ff6b6b';

  return (
    <div className="relative w-[140px] h-[140px] flex-shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e1e1e" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-mono font-semibold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-[11px] font-mono text-neutral-600">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }) {
  const color = score >= 75 ? '#6bffb8' : score >= 50 ? '#e8ff6e' : '#ff6b6b';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </span>
        <span className="text-[11px] font-mono font-medium" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
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
    green: 'bg-[#6bffb8]/10 text-[#6bffb8] border border-[#6bffb8]/20',
    red:   'bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/20',
    blue:  'bg-[#6bb8ff]/10 text-[#6bb8ff] border border-[#6bb8ff]/20',
    orange:'bg-[#ffb86b]/10 text-[#ffb86b] border border-[#ffb86b]/20',
  };

  if (!items?.length) {
    return <span className="text-sm text-neutral-600 italic">None identified</span>;
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
      <span className="text-[#e8ff6e] text-sm">{icon}</span>
      <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
        {title}
      </span>
    </div>
  );
}

function Card({ children, wide = false }) {
  return (
    <div className={`bg-[#111] border border-neutral-800 rounded-xl p-6 flex flex-col gap-6 ${wide ? 'md:col-span-2' : ''}`}>
      {children}
    </div>
  );
}

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate('/');
    return null;
  }

  const { overallScore, summary, categories, strengths, gaps, recommendations, analyzedAt } = result;

  const cats = [
    { label: 'Skills',      score: categories?.skills?.score },
    { label: 'Experience',  score: categories?.experience?.score },
    { label: 'Education',   score: categories?.education?.score },
    { label: 'Keywords',    score: categories?.keywords?.score },
  ].filter(c => c.score != null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="text-[#e8ff6e] text-xl">◈</span>
            <span className="text-xl font-semibold tracking-tight">FitCheck</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-neutral-500 border border-neutral-800 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-white transition-all duration-200"
          >
            ← New Analysis
          </button>
        </header>

        {/* Score Hero */}
        <div className="bg-[#111] border border-neutral-800 rounded-xl p-8 mb-4">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Left — ring + summary */}
            <div className="flex items-start gap-6">
              <ScoreRing score={overallScore} />
              <div className="pt-1">
                <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 mb-2">
                  Overall Match
                </div>
                <div
                  className="text-sm text-neutral-400 leading-relaxed max-w-sm"
                  dangerouslySetInnerHTML={{ __html: marked.parse(summary || '') }}
                />
                {analyzedAt && (
                  <div className="text-[11px] font-mono text-neutral-600 mt-3">
                    {new Date(analyzedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Right — category bars */}
            {cats.length > 0 && (
              <div className="flex flex-col gap-3 flex-1 md:pt-2 min-w-[200px]">
                {cats.map(c => <CategoryBar key={c.label} label={c.label} score={c.score} />)}
              </div>
            )}
          </div>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Skills */}
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

          {/* Keywords */}
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

          {/* Experience + Education */}
          {categories?.experience && (
            <Card wide>
              <div>
                <SectionTitle icon="⊞" title="Experience" />
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {categories.experience.notes}
                </p>
              </div>
              {categories?.education && (
                <div>
                  <SectionTitle icon="◎" title="Education" />
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {categories.education.notes}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Strengths */}
          {strengths?.length > 0 && (
            <Card>
              <SectionTitle icon="↑" title="Strengths" />
              <ul className="flex flex-col gap-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-400 leading-relaxed">
                    <span className="text-[#6bffb8] mt-0.5 flex-shrink-0">↑</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Gaps */}
          {gaps?.length > 0 && (
            <Card>
              <SectionTitle icon="↓" title="Gaps" />
              <ul className="flex flex-col gap-2">
                {gaps.map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-400 leading-relaxed">
                    <span className="text-[#ff6b6b] mt-0.5 flex-shrink-0">↓</span>
                    {g}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations?.length > 0 && (
            <Card wide>
              <SectionTitle icon="→" title="Recommendations" />
              <ol className="flex flex-col gap-3">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-[10px] font-mono bg-[#e8ff6e]/10 text-[#e8ff6e] px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-neutral-400 leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}