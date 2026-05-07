import { useEffect, useState } from 'react';
import { fetchHistory } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageVisible, setPageVisible] = useState(false);

    useEffect(() => {
        fetchHistory().then(setHistory).finally(() => setLoading(false));
        const id = requestAnimationFrame(() => requestAnimationFrame(() => setPageVisible(true)));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div className={`min-h-screen bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] font-google-sans px-6 py-12 transition-all duration-[400ms] ${pageVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between pr-14 mb-10">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
                    <span className="text-yellow-600 dark:text-yellow-400 text-5xl">◈</span>
                    <span className="text-5xl font-semibold tracking-tight dark:text-white">FitCheck</span>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-800 dark:border-neutral-700 px-4 py-2 rounded-lg hover:border-neutral-600 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer"
                >
                    ← New Analysis
                </button>
                </header>

                <h2 className="text-[16px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-6">Past Analyses</h2>

                {loading && <p className="text-neutral-500 dark:text-neutral-400">Loading…</p>}

                {!loading && history.length === 0 && (
                <p className="text-neutral-500 dark:text-neutral-400">No past analyses found.</p>
                )}

                <div className="flex flex-col gap-3">
                {history.map(row => {
                    const color = row.score >= 75 ? '#16a34a' : row.score >= 50 ? '#ca8a04' : '#dc2626';
                    return (
                    <button
                        key={row.id}
                        onClick={() => navigate('/results', {
                        state: {
                            result: row.result_json,
                            resumeText: row.result_json.resumeText,
                            jobDescription: row.result_json.jobDescription,
                        }
                        })}
                        className="bg-white dark:bg-neutral-900 border-2 border-neutral-800 dark:border-neutral-700 rounded-xl px-8 py-5 flex items-center justify-between hover:border-neutral-500 dark:hover:border-neutral-500 transition-all duration-200 cursor-pointer text-left"
                    >
                        <span className="text-[13px] font-mono text-neutral-500 dark:text-neutral-400">
                        {new Date(row.created_at).toLocaleString()}
                        </span>
                        <span className="text-2xl font-mono font-semibold" style={{ color }}>{row.score}</span>
                    </button>
                    );
                })}
                </div>
            </div>
        </div>
    );
}