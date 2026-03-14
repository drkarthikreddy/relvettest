import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Submission, Form } from '../types';
import Modal from '../components/Modal';

interface MySubmissionsPageProps {
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  forms: Form[];
}

const SubmissionReview: React.FC<{ submission: Submission, forms: Form[] }> = ({ submission, forms }) => {
    const form = forms.find(f => f.id === submission.formId);

    if (!form) {
        return <p>Error: The original form for this submission could not be found.</p>
    }

    return (
        <div className="space-y-4">
            {form.steps.flatMap(step => step.questions).map(question => {
                const answer = submission.data[question.id];
                return (
                    <div key={question.id}>
                        <p className="font-semibold text-secondary-800 dark:text-secondary-200">{question.text}</p>
                        <p className="text-secondary-600 dark:text-secondary-400 pl-2">
                            {Array.isArray(answer) ? answer.join(', ') : (answer || 'Not answered')}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

const MySubmissionsPage: React.FC<MySubmissionsPageProps> = ({ submissions, setSubmissions, forms }) => {
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'title-asc'>('date-desc');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const importSubmissionsRef = useRef<HTMLInputElement>(null);

  const departments = useMemo(() => ['all', ...new Set(submissions.map(s => s.department))], [submissions]);

  const filteredAndSortedSubmissions = useMemo(() => {
    let result = [...submissions];
    
    if (filterDept !== 'all') {
      result = result.filter(s => s.department === filterDept);
    }

    result.sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortOption === 'date-asc') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortOption === 'title-asc') {
        return a.formTitle.localeCompare(b.formTitle);
      }
      return 0;
    });

    return result;
  }, [submissions, sortOption, filterDept]);

  // Clear selections when filters change or exiting selection mode
  useEffect(() => {
    setSelectedSubmissionIds(new Set());
  }, [sortOption, filterDept, isSelectionMode]);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>, setData: React.Dispatch<React.SetStateAction<Submission[]>>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          const dataArray = Array.isArray(importedData) ? importedData : [importedData];

          let importedCount = 0;
          let skippedCount = 0;

          setData((prevData: Submission[]) => {
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

          let alertMessage = `Import finished. ${importedCount} submission(s) imported.`;
          if (skippedCount > 0) {
            alertMessage += ` ${skippedCount} submission(s) were skipped due to duplicate IDs.`;
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


  const handleExportFiltered = () => {
    if (filteredAndSortedSubmissions.length === 0) {
        alert("No submissions to export based on the current filters.");
        return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredAndSortedSubmissions, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `submissions_filtered_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportSelected = () => {
    if (selectedSubmissionIds.size === 0) {
        alert("No submissions selected to export.");
        return;
    }
    const selectedData = submissions.filter(s => selectedSubmissionIds.has(s.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `submissions_selected_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };
  
  const handleDeleteSelected = () => {
    setSubmissions(prev => prev.filter(s => !selectedSubmissionIds.has(s.id)));
    setSelectedSubmissionIds(new Set());
    setIsDeleteModalOpen(false);
    setIsSelectionMode(false);
  };


  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissionIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(submissionId)) {
            newSet.delete(submissionId);
        } else {
            newSet.add(submissionId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const allFilteredIds = new Set(filteredAndSortedSubmissions.map(s => s.id));
        setSelectedSubmissionIds(allFilteredIds);
    } else {
        setSelectedSubmissionIds(new Set());
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">My Submissions</h1>

      <div className="mb-6 p-4 bg-white dark:bg-secondary-800 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4 w-full">
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="sort" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">Sort by</label>
              <select id="sort" value={sortOption} onChange={e => setSortOption(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Form Title</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="filter" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">Filter by Department</label>
              <select id="filter" value={filterDept} onChange={e => setFilterDept(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>)}
              </select>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full items-center border-t border-secondary-200 dark:border-secondary-700 pt-4">
            {!isSelectionMode ? (
                <>
                    <input type="file" accept=".json" ref={importSubmissionsRef} onChange={(e) => handleImport(e, setSubmissions)} className="hidden" />
                    <button onClick={() => importSubmissionsRef.current?.click()} className="px-4 py-2 text-sm bg-secondary-600 text-white rounded-md hover:bg-secondary-700">Import Submissions</button>
                    <button onClick={handleExportFiltered} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">Export Filtered ({filteredAndSortedSubmissions.length})</button>
                    <button onClick={() => setIsSelectionMode(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Select Submissions</button>
                </>
            ) : (
                <div className="w-full flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center space-x-2">
                        <input 
                            type="checkbox" 
                            id="select-all" 
                            onChange={handleSelectAll} 
                            checked={filteredAndSortedSubmissions.length > 0 && selectedSubmissionIds.size === filteredAndSortedSubmissions.length}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            aria-label="Select all submissions"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Select All</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setIsSelectionMode(false)} className="px-4 py-2 text-sm bg-secondary-500 text-white rounded-md hover:bg-secondary-600">Cancel</button>
                        <button onClick={handleExportSelected} disabled={selectedSubmissionIds.size === 0} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 disabled:cursor-not-allowed">
                            Export Selected ({selectedSubmissionIds.size})
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(true)} disabled={selectedSubmissionIds.size === 0} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 disabled:cursor-not-allowed">
                            Delete Selected ({selectedSubmissionIds.size})
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedSubmissions.length > 0 ? filteredAndSortedSubmissions.map(sub => (
          <div key={sub.id} className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow-md flex items-center gap-4 transition-shadow hover:shadow-lg">
            {isSelectionMode && (
                <input 
                    type="checkbox" 
                    checked={selectedSubmissionIds.has(sub.id)}
                    onChange={() => handleSelectSubmission(sub.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
                    aria-labelledby={`submission-title-${sub.id}`}
                />
            )}
            <div onClick={() => setSelectedSubmission(sub)} className="flex-grow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 id={`submission-title-${sub.id}`} className="font-bold text-lg text-primary-700 dark:text-primary-400">{sub.formTitle}</h3>
                    <p className="text-sm text-secondary-500">{sub.department}</p>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
            </div>
          </div>
        )) : (
            <div className="text-center py-10">
                <p className="text-secondary-500 dark:text-secondary-400">No submissions match your criteria.</p>
            </div>
        )}
      </div>

      {selectedSubmission && (
        <Modal isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} title={`Review: ${selectedSubmission.formTitle}`}>
          <SubmissionReview submission={selectedSubmission} forms={forms} />
        </Modal>
      )}
      
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
          <p>Are you sure you want to delete the {selectedSubmissionIds.size} selected submission(s)? This action cannot be undone.</p>
          <div className="flex justify-end space-x-4 mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 rounded-md">Cancel</button>
            <button onClick={handleDeleteSelected} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
          </div>
        </Modal>

    </div>
  );
};

export default MySubmissionsPage;