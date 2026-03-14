import React from 'react';
import { Form, Submission } from '../types';

interface HomePageProps {
  forms: Form[];
  submissions: Submission[];
}

// FIX: Replaced JSX.Element with React.ReactElement to avoid global namespace issues.
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full text-primary-600 dark:text-primary-300">
            {icon}
        </div>
        <div>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">{title}</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ forms, submissions }) => {
    const submissionsByDept: Record<string, number> = submissions.reduce((acc, sub) => {
        acc[sub.department] = (acc[sub.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const latestSubmission = submissions.length > 0 ? 
        submissions.reduce((latest, current) => new Date(latest.submittedAt) > new Date(current.submittedAt) ? latest : current)
        : null;

    return (
        <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Analysis</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Forms" value={forms.length} icon={<FormIcon />} />
                <StatCard title="Total Submissions" value={submissions.length} icon={<SubmissionIcon />} />
                <StatCard title="Departments with Forms" value={new Set(forms.map(f => f.department)).size} icon={<DepartmentIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Submissions by Department</h2>
                    {Object.keys(submissionsByDept).length > 0 ? (
                        <ul className="space-y-3">
                            {Object.entries(submissionsByDept).sort(([, a], [, b]) => b - a).map(([dept, count]) => (
                                <li key={dept} className="flex justify-between items-center">
                                    <span className="font-medium">{dept}</span>
                                    <span className="px-3 py-1 text-sm font-semibold bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded-full">{count}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-secondary-500 dark:text-secondary-400">No submissions yet.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    {latestSubmission ? (
                         <div>
                            <h3 className="font-medium">Latest Submission</h3>
                            <p className="text-secondary-600 dark:text-secondary-300">{latestSubmission.formTitle}</p>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                {new Date(latestSubmission.submittedAt).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-secondary-500 dark:text-secondary-400">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const FormIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const SubmissionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DepartmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;


export default HomePage;