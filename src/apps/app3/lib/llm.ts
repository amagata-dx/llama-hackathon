import type { Alert, Student } from './types';
import { MOCK_STUDENT_B } from './mockData';

const SYSTEM_PROMPT = `
You are an expert educational AI assistant designed to analyze student data and identify potential risks such as bullying, academic struggles, mental health issues, family problems, or social isolation.

Your task is to analyze the provided information about a student and generate a risk assessment alert in JSON format.

Input Data will include:
1. Teacher's observations
2. Student Agent's report (from conversations with other students)
3. Student Profile

Output Format:
You must return ONLY a valid JSON object matching the following structure:

\`\`\`json
{
    "level": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        "category": "bullying" | "academic" | "mental" | "family" | "social",
            "title": "Short, descriptive title of the alert",
                "summary": "One sentence summary of the situation",
                    "explanation": "Detailed explanation of why this risk was identified, citing specific evidence",
                        "evidences": ["List of specific quotes or observations used as evidence"],
                            "actions": [
                                {
                                    "text": "Specific recommended action",
                                    "type": "interview" | "contact_parents" | "counseling" | "observation" | "other",
                                    "priority": "high" | "medium" | "low"
                                }
                            ]
}
\`\`\`

Rules:
- "level" should be based on the severity and urgency.
- "evidences" should directly reference the input data.
- "actions" should be concrete and actionable for a teacher.
- Do not include any text outside the JSON block.
- All text should be in Japanese
`;

export async function analyzeRiskWithLlama(
    teacherInput: string,
    studentAgentReport: string,
    student: Student = MOCK_STUDENT_B
): Promise<Omit<Alert, 'id' | 'studentId' | 'studentName' | 'timestamp' | 'status' | 'relatedAlerts'>> {

    const userPrompt = `
Analyze the following data for student: ${student.name} (Grade ${student.grade}, Class ${student.class}).

[Teacher's Observation]
${teacherInput}

[Student Agent Report]
${studentAgentReport}
`;

    try {
        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_LLAMA_API_KEY}`
            },
            body: JSON.stringify({
                "stream": false,
                "model": "Llama-4-Maverick-17B-128E-Instruct",
                "messages": [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                "temperature": 0.1, // Low temperature for consistent JSON output
                "response_format": { "type": "json_object" } // Enforce JSON mode if supported, or rely on prompt
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No content received from LLM");
        }

        // Parse JSON from content (handling potential markdown code blocks)
        const jsonString = content.replace(/```json\n|\n```/g, "").trim();
        const result = JSON.parse(jsonString);

        // Add IDs to actions
        const actionsWithIds = result.actions.map((action: any, index: number) => ({
            ...action,
            id: `action-${Date.now()}-${index}`,
            completed: false
        }));

        return {
            ...result,
            actions: actionsWithIds
        };

    } catch (error) {
        console.error("Error calling Llama API:", error);
        // Fallback to a generic error alert or rethrow
        throw error;
    }
}
