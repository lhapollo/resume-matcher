import { useLocation, useNavigate } from 'react-router-dom';
import { marked } from 'marked';

function ScoreRing({ score }) {
  const radius = 96;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <div className="relative w-[240px] h-[240px] flex-shrink-0">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <circle cx="120" cy="120" r={radius} fill="none" stroke="#e5e5e5" strokeWidth="14" />
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
        <span className="text-[15px] font-mono text-neutral-600">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';
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
      <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
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
    green: 'bg-green-50 text-green-700 border border-green-200',
    red:   'bg-red-50 text-red-700 border border-red-200',
    blue:  'bg-blue-50 text-blue-700 border border-blue-200',
    orange:'bg-orange-50 text-orange-700 border border-orange-200',
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
      <span className="text-yellow-600 text-sm">{icon}</span>
      <span className="text-[14px] font-medium uppercase tracking-widest text-neutral-500">
        {title}
      </span>
    </div>
  );
}

function Card({ children, wide = false }) {
  return (
    <div className={`bg-white border border-neutral-800 rounded-xl p-6 flex flex-col gap-6 ${wide ? 'md:col-span-2' : ''}`}>
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
    <div className="min-h-screen bg-white font-google-sans px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-google-sans">
            <span className="text-yellow-600 text-5xl">◈</span>
            <span className="text-5xl font-semibold tracking-tight">FitCheck</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xl text-neutral-500 border border-neutral-800 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black transition-all duration-200"
          >
            ← New Analysis
          </button>
        </header>

        {/* Score Hero */}
        <div className="bg-white border border-neutral-800 rounded-xl p-8 mb-4">
          <div className="flex items-center justify-center gap-8">

            {/* Ring */}
            <ScoreRing score={overallScore} />

            {/* Category bars — middle */}
            {cats.length > 0 && (
              <div className="flex flex-col gap-3 flex-1 pt-2 min-w-[200px]">
                {cats.map(c => <CategoryBar key={c.label} label={c.label} score={c.score} />)}
              </div>
            )}

            {/* Summary — right edge */}
            <div className="pt-1 min-w-[220px] max-w-xs">
              <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 mb-2">
                Overall Match
              </div>
              <div
                className="text-sm text-neutral-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked.parse(summary || '') }}
              />
              {analyzedAt && (
                <div className="text-[11px] font-mono text-neutral-600 mt-3">
                  {new Date(analyzedAt).toLocaleString()}
                </div>
              )}
            </div>
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
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {categories.experience.notes}
                </p>
              </div>
              {categories?.education && (
                <div>
                  <SectionTitle icon="◎" title="Education" />
                  <p className="text-sm text-neutral-600 leading-relaxed">
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
                  <li key={i} className="flex gap-2 text-sm text-neutral-600 leading-relaxed">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">↑</span>
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
                  <li key={i} className="flex gap-2 text-sm text-neutral-600 leading-relaxed">
                    <span className="text-red-600 mt-0.5 flex-shrink-0">↓</span>
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
                    <span className="text-[10px] font-mono bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-neutral-600 leading-relaxed">{r}</span>
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