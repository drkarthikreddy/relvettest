import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MyHistoryPage from './pages/MyHistoryPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import { Form, Submission, Settings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PREDEFINED_FORMS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Home');
  const [forms, setForms] = useLocalStorage<Form[]>('forms', []);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>('submissions', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', { theme: 'light' });

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Seed initial data if none exists
  useEffect(() => {
    const isSeeded = localStorage.getItem('isSeeded');
    if (!isSeeded) {
      setForms(PREDEFINED_FORMS);
      localStorage.setItem('isSeeded', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderView = useCallback(() => {
    switch (activeView) {
      case 'Home':
        return <HomePage forms={forms} submissions={submissions} />;
      case 'My History':
        return <MyHistoryPage forms={forms} setForms={setForms} submissions={submissions} setSubmissions={setSubmissions} />;
      case 'My Submissions':
        return <MySubmissionsPage forms={forms} submissions={submissions} setSubmissions={setSubmissions} />;
      case 'About':
        return <AboutPage />;
      case 'Settings':
        return <SettingsPage forms={forms} setForms={setForms} submissions={submissions} setSubmissions={setSubmissions} settings={settings} setSettings={setSettings} />;
      default:
        return <HomePage forms={forms} submissions={submissions} />;
    }
  }, [activeView, forms, submissions, settings, setForms, setSubmissions, setSettings]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-secondary-800 dark:text-secondary-200">
      <main className="flex-grow pb-20">
        <div className="container mx-auto px-4 py-6">
          {renderView()}
        </div>
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;