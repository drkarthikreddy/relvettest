
import React, { useState } from 'react';
import { Form, Submission, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FormFillerProps {
  form: Form;
  onClose: () => void;
  onFormSubmit: (submission: Submission) => void;
}

const renderQuestion = (question: Question, value: any, onChange: (questionId: string, value: any) => void) => {
    const inputClasses = "w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-secondary-50 dark:bg-secondary-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
    
    switch (question.type) {
        case 'text':
        case 'number':
        case 'date':
            return <input type={question.type} value={value || ''} onChange={(e) => onChange(question.id, e.target.value)} className={inputClasses} required={question.required} />;
        case 'textarea':
            return <textarea value={value || ''} onChange={(e) => onChange(question.id, e.target.value)} className={inputClasses} rows={4} required={question.required} />;
        case 'select':
            return (
                <select value={value || ''} onChange={(e) => onChange(question.id, e.target.value)} className={inputClasses} required={question.required}>
                    <option value="">Select...</option>
                    {question.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        case 'radio':
            return (
                <div className="space-y-2">
                    {question.options?.map(opt => (
                        <label key={opt} className="flex items-center space-x-2">
                            <input type="radio" name={question.id} value={opt} checked={value === opt} onChange={(e) => onChange(question.id, e.target.value)} className="text-primary-600 focus:ring-primary-500" required={question.required} />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            );
        case 'checkbox':
            return (
                <div className="space-y-2">
                    {question.options?.map(opt => (
                        <label key={opt} className="flex items-center space-x-2">
                            <input type="checkbox" value={opt} checked={value?.includes(opt) ?? false} 
                                onChange={(e) => {
                                    const currentValues = value || [];
                                    const newValues = e.target.checked ? [...currentValues, opt] : currentValues.filter((v: string) => v !== opt);
                                    onChange(question.id, newValues);
                                }} className="text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            );
        default:
            return null;
    }
};


const FormFiller: React.FC<FormFillerProps> = ({ form, onClose, onFormSubmit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleDataChange = (questionId: string, value: any) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < form.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmission: Submission = {
      id: uuidv4(),
      formId: form.id,
      formTitle: form.title,
      department: form.department,
      submittedAt: new Date().toISOString(),
      data: formData,
    };
    onFormSubmit(newSubmission);
    onClose();
  };
  
  const currentStep = form.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / form.steps.length) * 100;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400 mt-2">
              Step {currentStepIndex + 1} of {form.steps.length}
          </p>
      </div>
      
      <h4 className="text-lg font-semibold mb-1 text-secondary-800 dark:text-secondary-200">{currentStep.title}</h4>
      {currentStep.description && <p className="text-sm text-secondary-500 mb-4">{currentStep.description}</p>}
      
      <div className="space-y-4">
        {currentStep.questions.map(q => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              {q.text} {q.required && <span className="text-red-500">*</span>}
            </label>
            {renderQuestion(q, formData[q.id], handleDataChange)}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button type="button" onClick={handlePrev} disabled={currentStepIndex === 0} className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 text-secondary-800 dark:text-secondary-200 rounded-md disabled:opacity-50">
          Previous
        </button>
        {currentStepIndex < form.steps.length - 1 ? (
          <button type="button" onClick={handleNext} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Next
          </button>
        ) : (
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Submit
          </button>
        )}
      </div>
    </form>
  );
};

export default FormFiller;
