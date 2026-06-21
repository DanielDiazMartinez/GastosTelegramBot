import { useState } from 'react';
import { Layout } from './components/Layout';
import { TransactionsPage } from './pages/TransactionsPage';
import { StatsPage } from './pages/StatsPage';
import TriagePage from './pages/TriagePage';

function App() {
  const [activePage, setActivePage] = useState('transactions');

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'transactions' && <TransactionsPage />}
      {activePage === 'stats' && <StatsPage />}
      {activePage === 'triage' && <TriagePage />}
    </Layout>
  );
}

export default App;
