import React, { useState, useEffect } from 'react';
import { generateAboutContent } from '../services/geminiService';
import { Form, QuestionType } from '../types';

const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none text-secondary-700 dark:text-secondary-300">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-secondary-200 dark:border-secondary-700">{line.substring(3)}</h2>;
                }
                if (line.startsWith('**Q:')) {
                    return <p key={index} className="font-bold mt-3">{line.replace(/\*\*/g, '')}</p>
                }
                if (line.startsWith('A:')) {
                    return <p key={index} className="ml-4">{line.substring(2)}</p>
                }
                 if (line.trim() === '') {
                    return <br key={index} />;
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};


const AboutPage: React.FC = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [copyButtonText, setCopyButtonText] = useState('Copy JSON');

    const sampleForm: Form = {
      id: "replace-with-unique-uuid-1",
      title: "Sample Import Form",
      department: "Examples",
      steps: [
        {
          id: "replace-with-unique-uuid-2",
          title: "All Question Types",
          description: "This step demonstrates every available question type.",
          questions: [
            { id: "q-text-uuid", text: "Text Input", type: "text" as QuestionType, required: true },
            { id: "q-textarea-uuid", text: "Text Area Input", type: "textarea" as QuestionType, required: false },
            { id: "q-number-uuid", text: "Number Input", type: "number" as QuestionType, required: false },
            { id: "q-date-uuid", text: "Date Input", type: "date" as QuestionType, required: true },
            { id: "q-select-uuid", text: "Select Dropdown", type: "select" as QuestionType, options: ["Option A", "Option B", "Option C"], required: true },
            { id: "q-radio-uuid", text: "Radio Buttons", type: "radio" as QuestionType, options: ["Choice 1", "Choice 2"], required: true },
            { id: "q-checkbox-uuid", text: "Checkboxes", type: "checkbox" as QuestionType, options: ["Selection 1", "Selection 2", "Selection 3"], required: false },
          ]
        }
      ]
    };

    const prettyJson = JSON.stringify([sampleForm], null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(prettyJson).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
        });
    };

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            const generatedContent = await generateAboutContent();
            setContent(generatedContent);
            setIsLoading(false);
        };
        fetchContent();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">About & Help</h1>
            <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <>
                        <SimpleMarkdownRenderer content={content} />
                        
                        <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
                           <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Form Import Example</h2>
                           <p className="mt-2 mb-4 text-secondary-600 dark:text-secondary-400">
                                You can import forms using a JSON file. Use the structure below as a template. You can copy this example and modify it to create your own forms. The import feature expects a JSON array containing one or more form objects.
                           </p>
                           <div className="relative bg-secondary-100 dark:bg-secondary-900 rounded-lg border dark:border-secondary-700">
                               <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors z-10">
                                   {copyButtonText}
                               </button>
                               <pre className="p-4 pt-12 overflow-x-auto text-sm text-secondary-800 dark:text-secondary-200">
                                   <code>
                                       {prettyJson}
                                   </code>
                               </pre>
                           </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AboutPage;
