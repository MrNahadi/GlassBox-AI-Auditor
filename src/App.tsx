import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { LiveAudit } from './pages/LiveAudit';
import { BatchAudit } from './pages/BatchAudit';
import { Dashboard } from './pages/Dashboard';
import { Glossary } from './pages/Glossary';
import { History } from './pages/History';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LiveAudit />} />
            <Route path="batch" element={<BatchAudit />} />
            <Route path="history" element={<History />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="glossary" element={<Glossary />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
