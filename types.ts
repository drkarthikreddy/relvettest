
export type QuestionType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Form {
  id: string;
  title: string;
  department: string;
  steps: FormStep[];
}

export interface Submission {
  id: string;
  formId: string;
  formTitle: string;
  department: string;
  submittedAt: string;
  data: Record<string, any>;
}

export interface Settings {
    theme: 'light' | 'dark';
}
