
import { Form } from './types';
import { v4 as uuidv4 } from 'uuid';

export const PREDEFINED_FORMS: Form[] = [
  {
    id: uuidv4(),
    title: 'General Patient Intake',
    department: 'General Medicine',
    steps: [
      {
        id: uuidv4(),
        title: 'Patient Demographics',
        questions: [
          { id: uuidv4(), text: 'Full Name', type: 'text', required: true },
          { id: uuidv4(), text: 'Date of Birth', type: 'date', required: true },
          { id: uuidv4(), text: 'Contact Number', type: 'text', required: true },
        ],
      },
      {
        id: uuidv4(),
        title: 'Chief Complaint',
        questions: [
          { id: uuidv4(), text: 'What is the main reason for your visit today?', type: 'textarea', required: true },
          { id: uuidv4(), text: 'How long have you been experiencing these symptoms?', type: 'text', required: false },
        ],
      },
      {
        id: uuidv4(),
        title: 'Medical History',
        questions: [
          { id: uuidv4(), text: 'Do you have any known allergies?', type: 'textarea', required: false },
          { id: uuidv4(), text: 'List any current medications.', type: 'textarea', required: false },
          { id: uuidv4(), text: 'Past Surgeries', type: 'textarea', required: false },
        ],
      },
    ],
  },
  {
    id: uuidv4(),
    title: 'Pre-Operative Assessment',
    department: 'General Surgery',
    steps: [
      {
        id: uuidv4(),
        title: 'Procedure Information',
        questions: [
          { id: uuidv4(), text: 'Scheduled Procedure', type: 'text', required: true },
          { id: uuidv4(), text: 'Date of Procedure', type: 'date', required: true },
        ],
      },
      {
        id: uuidv4(),
        title: 'Anesthesia History',
        questions: [
          { id: uuidv4(), text: 'Have you had anesthesia before?', type: 'radio', options: ['Yes', 'No'], required: true },
          { id: uuidv4(), text: 'Any adverse reactions to anesthesia?', type: 'textarea', required: false },
        ],
      },
    ],
  },
  {
    id: uuidv4(),
    title: 'ENT Consultation',
    department: 'ENT',
    steps: [
      {
        id: uuidv4(),
        title: 'Primary Complaint',
        questions: [
          { id: uuidv4(), text: 'Which area is affected?', type: 'checkbox', options: ['Ear', 'Nose', 'Throat'], required: true },
          { id: uuidv4(), text: 'Describe your symptoms', type: 'textarea', required: true },
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: 'Ophthalmology Initial Visit',
    department: 'Ophthalmology',
    steps: [
      {
        id: uuidv4(),
        title: 'Vision History',
        questions: [
          { id: uuidv4(), text: 'Do you wear glasses or contact lenses?', type: 'radio', options: ['Yes', 'No'], required: true },
          { id: uuidv4(), text: 'Date of last eye exam', type: 'date', required: false },
        ]
      }
    ]
  }
];
