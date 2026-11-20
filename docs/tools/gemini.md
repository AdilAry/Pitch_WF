# Gemini API: Quick Reference

**Source:** Gemini API docs overview page, supplied as an attachment.
**Date fetched:** 2026-10-22 (read from the attachment, not fetched live).
**Source URL:** `https://ai.google.dev/gemini-api/docs` (UNVERIFIED: the attachment has no URL of its own. This is inferred from the links inside it.)

Everything below comes from that page. Anything the page does not state is marked **UNVERIFIED**.

---

## 1. What it is
*Source: https://ai.google.dev/gemini-api/docs (fetched 2026-10-22)*

- Google describes the Gemini API as the fastest path from prompt to production with Gemini, Veo, Nano Banana and other models.
- It is used to generate text and images, analyze multimodal inputs and build conversational agents.
- Official SDKs are shown for Python, JavaScript, Java and Go, plus a REST endpoint.
- **Managed Agents** give Gemini a hosted sandbox where it can plan and complete tasks itself. In a single request it can write and run code, search the web and create files. A prebuilt agent called **Antigravity** is provided.

## 2. Setup (Windows)
*Source: https://ai.google.dev/gemini-api/docs, https://aistudio.google.com/apikey (fetched 2026-10-22)*

1. **Get an API key** at https://aistudio.google.com/apikey (the page's "Create API Key" link).
2. **Store the key in an environment variable named `GEMINI_API_KEY`.** The page's REST example reads `$GEMINI_API_KEY`.
   - The Windows command for this is **UNVERIFIED** (not on the page). It is commonly `setx GEMINI_API_KEY "your-key"`, after which you open a new terminal.
3. **Install an SDK.** The page shows these import names:
   - Python: `from google import genai`
   - JavaScript: `@google/genai`
   - Go: `google.golang.org/genai`
   - Java: `com.google.genai`
   - The install commands are **UNVERIFIED** (not on the page). Examples would be `pip install google-genai` and `npm install @google/genai`.
4. That `genai.Client()` with no arguments reads the key from the environment is **UNVERIFIED**. The page calls it without arguments but does not explain how it authenticates.
5. **No Windows-specific instructions appear on the page.** For the full setup, see the "Get Started" link in Section 6.

## 3. Key concepts
*Source: https://ai.google.dev/gemini-api/docs (fetched 2026-10-22)*

**Interactions API**
- Became the default interface in June 2026. It is the recommended choice for new projects.
- `generateContent` is still supported but is now **legacy**.
- It manages conversation state, messages and output formats.
- REST endpoint: `POST https://generativelanguage.googleapis.com/v1beta/interactions`, with the key sent in the `x-goog-api-key` header.

**model vs. agent**
- A request sets `model` (for example `gemini-4-argon`) to call a model directly.
- It sets `agent` (for example `antigravity-preview-09-2026`) together with `environment: "remote"` to run a Managed Agent.

**Output**
- The response text is read from `output_text` (Python/JS), `outputText()` (Java) or `OutputText` (Go).

**Streaming**
- Supports real-time tokens, incremental thoughts and tool-call events.

**Models listed on the page**

| Model | Purpose (as stated) |
|---|---|
| Gemini 4 Argon (new) | Flagship reasoning model. Shared 1M context window, decodes up to 1M tokens. |
| Gemini 3.8 Flash (new) | Most capable Flash model, for long-horizon software engineering, agents and enterprise workflows. |
| Gemini 3.8 Flash TTS (new) | Text-to-speech, with voice design and voice replication. |
| Gemini 3.5 Flash-Lite | High-volume, low-cost, low-latency subagent tasks. |
| Gemini 3.5 Transcribe (new) | Speech-to-text, with language detection, speaker diarization and word timestamps. |
| Nano Banana | Image generation and editing. |
| Gemini Omni Flash | Video generation and editing. |
| Gemini Robotics | Vision-language model for robotics. |

**Capabilities**
- Long context, structured (JSON) output, function calling and thinking.
- Built-in tools: Google Search, URL Context, Google Maps, Code Execution and Computer Use.
- PDF understanding up to 1,000 pages.
- Live API for real-time voice agents.

## 4. Minimal working example
*Source: https://ai.google.dev/gemini-api/docs (fetched 2026-10-22)*

Python, copied from the page:

```python
from google import genai

client = genai.Client()

interaction = client.interactions.create(
    model="gemini-4-argon",
    input="Explain how AI works in a few words"
)

print(interaction.output_text)
```

REST, from the page:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model": "gemini-4-argon", "input": "Explain how AI works in a few words"}'
```

Note: this command is written for bash. The `\` line breaks and `$GEMINI_API_KEY` will not work as written in PowerShell or cmd. The workaround (Git Bash, WSL, or rewriting it for PowerShell) is **UNVERIFIED** (not on the page).

## 5. Common pitfalls
*Source: https://ai.google.dev/gemini-api/docs (fetched 2026-10-22)*

The page has no "pitfalls" section. The points below are drawn from what it does say.

- **Legacy API.** Tutorials using `generateContent` follow the legacy interface. New code should use `client.interactions.create(...)`.
- **`model` vs. `agent`.** Managed Agents use `agent=` plus `environment="remote"`, not `model=`.
- **Preview agent ID.** `antigravity-preview-09-2026` is a dated preview. Whether it will change or be retired is **UNVERIFIED**.
- **Beta endpoint.** The REST path is `v1beta`.
- **Output text can be empty.** In the Java and Go samples it is optional or nullable (`orElse("")`, a `nil` check), so handle the empty case.
- **Shell syntax on Windows.** The curl sample is bash syntax (see Section 4).
- **Video model naming is inconsistent.** The page calls Gemini Omni Flash its state-of-the-art video model, but also links "Video Generation with Veo 3.1". Which one to use is **UNVERIFIED**.

## 6. Links
*Source: https://ai.google.dev/gemini-api/docs (fetched 2026-10-22)*

- Get Started: https://ai.google.dev/gemini-api/docs/get-started
- Create API key: https://aistudio.google.com/apikey
- Models: https://ai.google.dev/gemini-api/docs/models
- Interactions overview: https://ai.google.dev/gemini-api/docs/interactions-overview
- Migration from generateContent: https://ai.google.dev/gemini-api/docs/migrate-to-interactions
- Managed Agents quickstart: https://ai.google.dev/gemini-api/docs/managed-agents-quickstart
- Streaming: https://ai.google.dev/gemini-api/docs/streaming
- Tools: https://ai.google.dev/gemini-api/docs/tools
- API reference: https://ai.google.dev/api
- Status: https://aistudio.google.com/status
- Community: https://discuss.ai.google.dev/c/gemini-api/4
