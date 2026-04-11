import { useState } from 'react';
import { Layout } from './components/Layout';
import { TransactionsPage } from './pages/TransactionsPage';
import { Dashboard } from './pages/Dashboard';
import { StatsPage } from './pages/StatsPage';

function App() {
  const [activePage, setActivePage] = useState('transactions');

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'transactions' && <TransactionsPage />}
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'stats' && <StatsPage />}
    </Layout>
  );
}

export default App;