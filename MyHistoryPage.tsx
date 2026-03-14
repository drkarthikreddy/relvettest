import React, { useState, useMemo, useRef } from 'react';
import { Form, Submission } from '../types';
import Modal from '../components/Modal';
import FormFiller from '../components/FormFiller';

interface MyHistoryPageProps {
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

const MyHistoryPage: React.FC<MyHistoryPageProps> = ({ forms, setForms, submissions, setSubmissions }) => {
  const [formToFill, setFormToFill] = useState<Form | null>(null);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(new Set());
  const importFormsRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    if (formToDelete) {
      setForms(forms.filter(f => f.id !== formToDelete.id));
      setSubmissions(subs => subs.filter(s => s.formId !== formToDelete.id));
      setFormToDelete(null);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>, setData: React.Dispatch<React.SetStateAction<Form[]>>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          const dataArray = Array.isArray(importedData) ? importedData : [importedData];

          let importedCount = 0;
          let skippedCount = 0;

          setData((prevData: Form[]) => {
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

          let alertMessage = `Import finished. ${importedCount} form(s) imported.`;
          if (skippedCount > 0) {
            alertMessage += ` ${skippedCount} form(s) were skipped due to duplicate IDs.`;
          }
          alert(alertMessage);

        } catch (error) {
          alert('Failed to parse file. Please ensure it is a valid JSON file.');
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExportSelected = () => {
    if (selectedFormIds.size === 0) {
        alert("No forms selected to export.");
        return;
    }
    const selectedData = forms.filter(f => selectedFormIds.has(f.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `forms_selected_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleSelectForm = (formId: string) => {
    setSelectedFormIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(formId)) {
            newSet.delete(formId);
        } else {
            newSet.add(formId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const allFormIds = new Set(forms.map(f => f.id));
        setSelectedFormIds(allFormIds);
    } else {
        setSelectedFormIds(new Set());
    }
  };


  const handleFormSubmit = (submission: Submission) => {
    setSubmissions([...submissions, submission]);
  };
  
  const groupedForms = useMemo(() => {
    return forms.reduce((acc, form) => {
        (acc[form.department] = acc[form.department] || []).push(form);
        return acc;
    }, {} as Record<string, Form[]>);
  }, [forms]);

  const sortedDepartments = Object.keys(groupedForms).sort();

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">My History Forms</h1>

      <div className="mb-6 p-4 bg-white dark:bg-secondary-800 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="select-all-forms" 
                    onChange={handleSelectAll} 
                    checked={forms.length > 0 && selectedFormIds.size === forms.length}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    aria-label="Select all forms"
                />
                <label htmlFor="select-all-forms" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Select All</label>
            </div>
            <div className="flex flex-wrap gap-2">
                <input type="file" accept=".json" ref={importFormsRef} onChange={(e) => handleImport(e, setForms)} className="hidden" />
                <button onClick={() => importFormsRef.current?.click()} className="px-4 py-2 text-sm bg-secondary-600 text-white rounded-md hover:bg-secondary-700">Import Forms</button>
                <button onClick={handleExportSelected} disabled={selectedFormIds.size === 0} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 disabled:cursor-not-allowed">
                    Export Selected ({selectedFormIds.size})
                </button>
            </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {sortedDepartments.length > 0 ? sortedDepartments.map(department => (
          <div key={department}>
            <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3 pb-2 border-b-2 border-primary-200 dark:border-primary-800">{department}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedForms[department].map(form => (
                <div key={form.id} className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                  <div className="flex items-start space-x-3">
                     <input 
                      type="checkbox" 
                      checked={selectedFormIds.has(form.id)}
                      onChange={() => handleSelectForm(form.id)}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
                      aria-labelledby={`form-title-${form.id}`}
                    />
                    <div className="flex-1">
                      <h3 id={`form-title-${form.id}`} className="font-bold text-lg text-secondary-900 dark:text-secondary-100">{form.title}</h3>
                      <p className="text-sm text-secondary-500">{form.steps.length} step(s)</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => setFormToDelete(form)} className="p-2 text-secondary-500 hover:text-red-500"><DeleteIcon/></button>
                    <button onClick={() => setFormToFill(form)} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">Submit Form</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
            <p className="text-secondary-500 dark:text-secondary-400">No forms found. Import or create a new form to get started.</p>
          </div>
        )}
      </div>

      {formToFill && (
        <Modal isOpen={!!formToFill} onClose={() => setFormToFill(null)} title={`Filling: ${formToFill.title}`}>
          <FormFiller form={formToFill} onClose={() => setFormToFill(null)} onFormSubmit={handleFormSubmit} />
        </Modal>
      )}

      {formToDelete && (
        <Modal isOpen={!!formToDelete} onClose={() => setFormToDelete(null)} title="Confirm Deletion">
          <p>Are you sure you want to delete the form "{formToDelete.title}"? This will also delete all associated submissions. This action cannot be undone.</p>
          <div className="flex justify-end space-x-4 mt-6">
            <button onClick={() => setFormToDelete(null)} className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 rounded-md">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default MyHistoryPage;