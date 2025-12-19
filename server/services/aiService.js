const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.5 Flash
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Generate AI-written resume sections
 */
const generateResumeContent = async (
  resumeType,
  personalDetails,
  currentResumeData
) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
You are an expert resume writer.

Generate professional content for a ${resumeType} resume.

Candidate Name: ${personalDetails?.fullName || "Candidate"}
Target Role: ${personalDetails?.role || "Professional"}

Provided Experience Data:
${JSON.stringify(currentResumeData?.experience || [], null, 2)}

TASKS:
1. Write a strong 2–3 sentence career objective tailored to the ${resumeType} role.
2. Write a professional declaration.
3. Improve each experience entry using action verbs and quantified impact where possible.

RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No extra text

OUTPUT FORMAT:
{
  "careerObjective": "string",
  "declaration": "string",
  "experienceSuggestions": [
    {
      "company": "string",
      "role": "string",
      "details": "enhanced professional paragraph"
    }
  ]
}
`;

    // ✅ Correct Gemini call (string input)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Clean accidental markdown if model adds it
    const cleanText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate resume content");
  }
};

/**
 * Analyze resume and suggest improvements
 */
const analyzeResumeContent = async (currentResumeData) => {
  try {
    console.log(
      "Analyzing resume for:",
      currentResumeData?.personalDetails?.fullName
    );

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
You are an expert resume critic.

Analyze the resume below for:
- grammar and spelling
- professional tone
- weak phrasing
- missing metrics and impact

Resume Data:
${JSON.stringify(currentResumeData, null, 2)}

RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No extra text

OUTPUT FORMAT:
{
  "improvements": [
    {
      "section": "experience | personalDetails | projects | objective",
      "index": 0,
      "original": "string snippet",
      "suggestion": "improved version",
      "reason": "short reason"
    }
  ],
  "overallFeedback": "overall assessment"
}
`;

    // ✅ Correct Gemini call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const cleanText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze resume");
  }
};

module.exports = {
  generateResumeContent,
  analyzeResumeContent,
};
