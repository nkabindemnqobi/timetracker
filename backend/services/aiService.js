import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import {getTimesheetForWeek} from "./jiraService.js";
import dotenv from "dotenv";
dotenv.config();


const token = "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";
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o";

const client = new ModelClient(endpoint, new AzureKeyCredential(token));

export const getTimesheetSummary = async (assignee, weekStart, weekEnd) => {
    const timesheet = await getTimesheetForWeek(assignee, weekStart, weekEnd);

    const prompt = `
You are an assistant that summarizes developer timesheet data.

Here is the JSON data for ${assignee}'s timesheet from ${weekStart} to ${weekEnd}:

${JSON.stringify(timesheet, null, 2)}

Write a concise weekly summary (NOT per ticket) with a maximum of 910 characters.
Your summary must include:
- Total hours worked
- Hours per project (if multiple projects exist)
- Daily breakdown (at a high level)
- The most time-consuming day or pattern
- Notable trends (like weekend-heavy, multitasking, or long streaks)

Do NOT list every issue or ticket individually. Focus only on the overall weekly picture.
`;

    const response = await client.path("/chat/completions").post({
        body: {
            messages: [{ role: "user", content: prompt }],
            model,
            temperature: 0.4,
            max_tokens: 300 // helps enforce ~910 chars
        }
    });

    if (isUnexpected(response)) {
        throw new Error("Failed to generate summary");
    }

    const aiSummary = response.body.choices[0].message.content.trim();

    return {
        ...timesheet,
        summary: aiSummary
    };
};