import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import { useDarkMode } from './hooks/useDarkMode';
import HistoryPage from './pages/HistoryPage';

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

export default function App() {
  const [dark, toggleDark] = useDarkMode();

  return (
    <BrowserRouter>
      <button
        onClick={toggleDark}
        className="fixed top-4 right-6 z-50 text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-white dark:bg-neutral-900 transition-all duration-200"
      >
        {dark ? '☀' : '🌙'}
      </button>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export const sessionId = getOrCreateSessionId();