Product Requirements Document (PRD): "Project Council"
Version: 1.0 Status: Draft Target Model: Gemini 2.5 Flash-Lite

1. Executive Summary
Project Council is a chat application that simulates a "roundtable" discussion. Unlike standard 1-on-1 AI chats, this app allows a user to assemble a team of distinct AI Personas (e.g., CEO, CFO, Creative Director) into a single chat room. These personas answer the user's questions, but importantly, they also debate and converse with one another, providing diverse perspectives on a single topic.

2. Core Value Proposition
Cognitive Diversity: Users get multiple viewpoints instantly (Risk vs. Opportunity, Logical vs. Emotional).

Simulation: Users can "war game" scenarios by watching archetypes interact.

Speed & Efficiency: Leveraging Gemini 2.5 Flash-Lite allows for multi-agent concurrency with low latency and low cost.

3. Functional Requirements
3.1. The "Persona" Engine

The user must be able to configure distinct agents that behave consistently.

Persona Creation: User creates a persona with the following fields:

Name: (e.g., "Marcus the CFO")

Avatar/Color: Visual identifier in chat.

System Instructions (The Archetype): A multiline text field where the user defines the behavior.

Example: "You are a cynical CFO. You always ask about ROI. You use short sentences. You are skeptical of the CEO's ideas."

Active Roster: User can toggle personas "On" or "Off" (Join/Leave) inside an active chat session.

Default Archetypes: The app should ship with 3-5 presets (e.g., "The Optimist," "The Skeptic," "The Analyst").

3.2. Interaction Logic (The "Orchestrator")

This is the core logic that differentiates this app from a standard chatbot.

Trigger Event: The User sends a message.

Response Flow:

User Message: Sent to context.

Primary Round: All "Active" personas generate a response to the user.

Inter-Agent Round (Auto-Discussion): If Persona A says something, Persona B can "read" it and respond.

The "Turn Cap" (Guardrail): To prevent infinite loops and cost overruns, the system must enforce a Max Auto-Reply Depth.

Standard: User -> Personas Respond -> Personas React to Personas -> STOP (Wait for User).

3.3. Chat Interface

Multi-View: Messages must be clearly attributed to the specific Persona (Name + Avatar).

Typing Indicators: UI must show "Marcus (CFO) is typing..." to indicate processing.

Session State:

The conversation persists as long as the user is present.

Termination: If the user "Leaves" (closes tab/clicks End Session), the context is cleared or archived. No background processing occurs.

4. Technical Architecture
4.1. AI Model Strategy

Model: gemini-2.5-flash-lite

Why: High token throughput is required because every user message triggers N API calls (where N = number of active personas).

Context Window: 1 Million tokens (Flash-Lite standard).

Temperature: Set slightly higher (e.g., 0.7 - 0.9) to ensure personas sound distinct and not generic.

4.2. Backend Logic (Orchestration Layer)

Context Management: The backend must maintain a "Global Chat History."

Prompt Construction: When Persona A is asked to generate a response, the prompt payload must look like this:

JSON
{
  "system_instruction": "You are Marcus the CFO...",
  "history": [
    {"role": "user", "text": "Should we buy this company?"},
    {"role": "model", "name": "CEO", "text": "Yes! We need growth!"}
  ],
  "task": "Respond to the conversation above from your perspective."
}
4.3. Latency Optimization

Parallel Processing: When the user sends a message, requests for Persona A, B, and C should be sent to the Gemini API concurrently (in parallel), not sequentially.

Streaming: Responses should stream to the frontend token-by-token so the interface feels alive.

5. Non-Functional Requirements
Latency: Time to first token (TTFT) should be under 800ms per persona.

Cost Control: Admin dashboard to set token limits per user per day.

Scalability: The backend must handle WebSocket connections for real-time pushing of messages from multiple agents.

6. User Stories (Acceptance Criteria)
ID	User Story	Acceptance Criteria
US-1	Create Persona	User can enter a name and a 5-line description ("You are a grumpy lawyer...") and save it.
US-2	Multi-Agent Reply	When User sends "Hello", both active personas (e.g., CEO and CFO) generate unique responses based on their prompts.
US-3	Context Awareness	Persona B references what Persona A just said (e.g., "I disagree with the CEO...").
US-4	Leave Chat	When User clicks "Leave", the session ends immediately, and no further API calls are made.
7. Edge Cases & Risks
"Everyone talks at once": If 5 agents are active, the UI becomes a wall of text.

Mitigation: Implement a "Speaking Order" or limit active personas to 3 max.

Hallucinated Interactions: An agent claims "As the CEO just said..." when the CEO hasn't spoken yet.

Mitigation: Strict injection of chat history in the prompt.

Cost Spikes: A user creates a "loop" where agents argue indefinitely.

Mitigation: Hard limit of 2 "Auto-Responses" per user input.

Developer Note: The "System Prompt" Variable

To make this work, the developers must dynamically inject the user's defined "Persona Description" into the system_instruction field of the Gemini API call.

Example System Prompt Injection:

"You are participating in a group chat. Your name is [NAME]. Your personality is: [USER_DEFINED_DESCRIPTION]. The other participants are [LIST_OF_OTHER_PERSONAS]. Keep your responses concise."