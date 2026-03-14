
import { GoogleGenAI } from "@google/genai";

export const generateAboutContent = async (): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(`
## About Clinical History Navigator

**This is placeholder content.** An API key is required to generate dynamic content.

This application is a powerful tool for medical professionals to create, manage, and track patient history forms.

### Privacy Policy
Your data is stored locally in your browser and is not transmitted to any server.

### Terms and Conditions
Use of this application is at your own risk.

### FAQ
**Q: How is my data stored?**
A: All forms and submissions are stored directly in your web browser's local storage.
    `);
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            Based on an application named "Clinical History Navigator", please generate content for its "About" page.
            The app has the following features:
            - A "Home" screen with statistics on forms and submissions.
            - "My History" section where users can create, edit, delete, and import medical history form templates. Forms can be multi-step.
            - "My Submissions" section to view, sort, and filter completed form submissions.
            - A "Settings" section for theme control (light/dark) and data import/export.
            - All data is stored locally in the user's browser using local storage for privacy.

            Please generate the following sections in Markdown format:
            1.  **About the App**: A brief, engaging introduction.
            2.  **Privacy Policy**: Emphasize the local storage aspect and data privacy.
            3.  **Terms and Conditions**: A standard, brief set of terms.
            4.  **FAQ**: Create 3-4 frequently asked questions with answers, for example, about data storage, form creation, and data export.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating content with Gemini API:", error);
        return "Failed to load content. Please check your API key and network connection.";
    }
};
