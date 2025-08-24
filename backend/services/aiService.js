import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.REACT_APP_SERVICE_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "xai/grok-3";

const client = ModelClient(endpoint, new AzureKeyCredential(token));

export async function enrichResponse() {
    try {
        if (!token) {
            throw new Error("Missing Azure Inference token in environment variables.");
        }

        const client = ModelClient(endpoint, new AzureKeyCredential(token));

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "" },
                    { role: "user", content: "What is the capital of France?" },
                ],
                temperature: 1,
                top_p: 1,
                model,
            },
        });

        console.log(JSON.stringify(response.body, null, 2));
        if (isUnexpected(response)) {
            throw response.body.error;
        }

        const result = response.body.choices[0].message.content;
        console.log("🧠 AI Response:", result);

        return result;
    } catch (error) {
        console.error("🚨 Error during inference:", error);
        throw error;
    }
}

export async function calculateTimeTaken(changelog, issueKey) {
    try {
        if (!token) {
            throw new Error("Missing Azure Inference token in environment variables.");
        }

        const client = ModelClient(endpoint, new AzureKeyCredential(token));

        const prompt = `Use Changelog JSON=` + JSON.stringify(changelog) + ` issueKey=` + issueKey;


        console.log(JSON.stringify({gptPrompt: prompt}));

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: `Given a Jira changelog in JSON format. 
                            Task: 
                            1. Parse the changelog array. 
                            2. Find the most recent changelog item where "field" = "status" and "toString" = "In Progress". 
                            3. Take the "created" timestamp of that changelog as the start time. 
                            4. If the current status is still "In Progress", calculate the time difference in hours between the current date as now and start time. 
                            5. Round the result to two decimal places. 
                            6. In the response ONLY Return the result as JSON object in the given format without information on how it was done: { "issueKey": "<issueKey>", "timeInProgress": <calculated_value> }` },
                    { role: "user", content: JSON.stringify(prompt) },
                ],
                temperature: 0.7,
                top_p: 1,
                model,
            },
        });

        console.log("!!!!! ->" + JSON.stringify(response));

        if (isUnexpected(response)) {
            throw response.body.error;
        }

        const result = response.body.choices[0].message.content;
        console.log("🧠 Enriched Timesheet JSON:", result);

        return result;
    } catch (error) {
        console.error("🚨 Error enriching response:", error);
        throw error;
    }
}
