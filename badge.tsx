import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Campaigns } from '@/components/Campaigns';
import { Templates } from '@/components/Templates';
import { EmailBuilder } from '@/components/EmailBuilder';
import { DNSConfig } from '@/components/DNSConfig';
import { Contacts } from '@/components/Contacts';
import { Settings } from '@/components/Settings';
import { useAppStore } from '@/store/appStore';

function App() {
  const { currentView } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <Campaigns />;
      case 'templates':
        return <Templates />;
      case 'builder':
        return <EmailBuilder />;
      case 'contacts':
        return <Contacts />;
      case 'dns':
        return <DNSConfig />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default App;
