import { useState } from 'react';
import { Layout } from './components/Layout';
import { TransactionsPage } from './pages/TransactionsPage';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [activePage, setActivePage] = useState('transactions');

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'transactions' && <TransactionsPage />}
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'stats' && (
        <div className="p-8 bg-white rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold">Próximamente: Análisis detallado</h2>
        </div>
      )}
    </Layout>
  );
}

export default App;