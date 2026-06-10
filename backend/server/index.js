const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Simple in-memory memory store:
 * {
 *   sessionId: [{role, content}, ...]
 * }
 */
const memory = {};

// helper: limit memory so it doesn't grow forever
function trimHistory(messages, max = 12) {
    if (messages.length <= max) return messages;
    return messages.slice(messages.length - max);
}

app.post("/api/chat", async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                error: "sessionId is required"
            });
        }

        // create session if it doesn't exist
        if (!memory[sessionId]) {
            memory[sessionId] = [
                {
                    role: "system",
                    content:
                        "You are a friendly digital literacy tutor. Keep answers simple and beginner-friendly."
                }
            ];
        }

        // add user message
        memory[sessionId].push({
            role: "user",
            content: message
        });

        // trim old messages
        memory[sessionId] = trimHistory(memory[sessionId]);

        // call Ollama
        const ollamaResponse = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3.2:1b",
                    messages: memory[sessionId],
                    stream: false
                })
            }
        );

        const data = await ollamaResponse.json();

        const reply = data.message.content;

        // store assistant reply in memory
        memory[sessionId].push({
            role: "assistant",
            content: reply
        });

        // trim again
        memory[sessionId] = trimHistory(memory[sessionId]);

        res.json({
            reply,
            sessionId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(3000, () => {
    console.log("AI server running on http://localhost:3000");
});