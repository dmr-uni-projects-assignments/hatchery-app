const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Memory structure:
 * {
 *   sessionId: {
 *      messages: [...],
 *      lastActive: timestamp
 *   }
 * }
 */
const memory = {};

// 1 hour expiry
const SESSION_TTL = 60 * 60 * 1000;

// cleanup function
function cleanupSessions() {
    const now = Date.now();

    for (const sessionId in memory) {
        if (now - memory[sessionId].lastActive > SESSION_TTL) {
            delete memory[sessionId];
        }
    }
}

// helper: trim history
function trimHistory(messages, max = 12) {
    if (messages.length <= max) return messages;
    return messages.slice(messages.length - max);
}

app.post("/api/chat", async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }

        // 🧹 cleanup expired sessions every request
        cleanupSessions();

        // create session if needed
        if (!memory[sessionId]) {
            memory[sessionId] = {
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a friendly digital literacy tutor. Keep answers simple and beginner-friendly. Additionally, do not use markdown for your answers. Keep it notepad-friendly."
                    }
                ],
                lastActive: Date.now()
            };
        }

        const session = memory[sessionId];

        // update activity timestamp
        session.lastActive = Date.now();

        // add user message
        session.messages.push({
            role: "user",
            content: message
        });

        // trim memory
        session.messages = trimHistory(session.messages);

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
                    messages: session.messages,
                    stream: false
                })
            }
        );

        const data = await ollamaResponse.json();
        const reply = data.message.content;

        // store assistant reply
        session.messages.push({
            role: "assistant",
            content: reply
        });

        session.messages = trimHistory(session.messages);

        session.lastActive = Date.now();

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