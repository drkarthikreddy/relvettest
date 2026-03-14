import React, { useRef } from 'react';
import { Form, Submission, Settings } from '../types';

interface SettingsPageProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{title}</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">{description}</p>
        {children}
    </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings, forms, setForms, submissions, setSubmissions }) => {
    const importFormsRef = useRef<HTMLInputElement>(null);
    const importSubmissionsRef = useRef<HTMLInputElement>(null);

    const handleThemeToggle = () => {
        setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
    };

    const exportData = (data: any, filename: string) => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = filename;
        link.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>, setData: React.Dispatch<React.SetStateAction<any[]>>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target?.result as string);
                    const dataArray = Array.isArray(importedData) ? importedData : [importedData];

                    let importedCount = 0;
                    let skippedCount = 0;

                    setData((prevData: any[]) => {
                        const existingIds = new Set(prevData.map(item => item.id));
                        const uniqueNewData = dataArray.filter(item => {
                            if (item.id && !existingIds.has(item.id)) {
                                existingIds.add(item.id);
                                return true;
                            }
                            return false;
                        });

                        importedCount = uniqueNewData.length;
                        skippedCount = dataArray.length - importedCount;

                        return [...prevData, ...uniqueNewData];
                    });

                    let alertMessage = `Import finished. ${importedCount} item(s) imported.`;
                    if (skippedCount > 0) {
                        alertMessage += ` ${skippedCount} item(s) were skipped due to duplicate IDs.`;
                    }
                    alert(alertMessage);
                } catch (error) {
                    alert('Failed to parse file. Please ensure it is a valid JSON file.');
                    console.error("Import error:", error);
                }
            };
            reader.readAsText(file);
            if(event.target) {
                event.target.value = '';
            }
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Settings</h1>
            <div className="space-y-6">
                <SettingsCard title="Appearance" description="Customize the look and feel of the app.">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Dark Mode</span>
                        <button onClick={handleThemeToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.theme === 'dark' ? 'bg-primary-600' : 'bg-secondary-200'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard title="Export Data" description="Save your forms and submissions to a file.">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => exportData(forms, 'forms.json')} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Export All Forms</button>
                        <button onClick={() => exportData(submissions, 'submissions.json')} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Export All Submissions</button>
                    </div>
                </SettingsCard>

                <SettingsCard title="Import Data" description="Load forms and submissions from a file. This will add to your existing data. Items with duplicate IDs will be skipped.">
                     <div className="flex flex-col sm:flex-row gap-4">
                        <input type="file" accept=".json" ref={importFormsRef} onChange={(e) => handleImport(e, setForms)} className="hidden" />
                        <button onClick={() => importFormsRef.current?.click()} className="flex-1 px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700">Import Forms</button>

                        <input type="file" accept=".json" ref={importSubmissionsRef} onChange={(e) => handleImport(e, setSubmissions)} className="hidden" />
                        <button onClick={() => importSubmissionsRef.current?.click()} className="flex-1 px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700">Import Submissions</button>
                    </div>
                </SettingsCard>
            </div>
        </div>
    );
};

export default SettingsPage;