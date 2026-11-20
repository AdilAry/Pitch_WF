# ElevenLabs: quick reference

**Source:** ElevenLabs Documentation overview page, "Text to Speech & Voice Agent APIs" (page shows *last-updated: October 16, 2026*).
**Retrieved:** 2026-10-21, from a copy attached to the request (not fetched live).
**Source URL:** https://elevenlabs.io/docs (**UNVERIFIED**: the attached copy does not state its own URL. Relative links on the page are resolved here against `https://elevenlabs.io`, the host its absolute links use.)

Only this one page was supplied. Nothing below comes from the pages it links to.

---

## 1. What it is

*Source: https://elevenlabs.io/docs, section "How does ElevenLabs work?" (retrieved 2026-10-21)*

ElevenLabs provides AI voice infrastructure: text-to-speech, speech-to-text, voice cloning, voice agents and generative audio. There are four ways to use it:

- **ElevenCreative**: a no-code web app for voiceovers, music, dubs and studio projects.
- **ElevenAgents**: a platform for building voice agents, with a visual builder or full programmatic control. It combines speech recognition, an LLM of your choice, TTS and turn-taking.
- **ElevenAPI**: every capability as a REST API, with official Python and TypeScript SDKs.
- **Reception.ai**: a ready-made AI phone receptionist for small and medium businesses.

Other listed capabilities include music, text to dialogue, image and video, voice changer, voice isolator, dubbing, sound effects, voice remixing, forced alignment, Speech Engine and private deployments.

## 2. Setup (Windows)

*Source: https://elevenlabs.io/docs, sections "Generate your first audio" and the "Get started with your coding agent" tip (retrieved 2026-10-21)*

> The page gives **no Windows-specific instructions**. These are its generic steps.
> - Whether they run unchanged in PowerShell or cmd: **UNVERIFIED**.
> - Required Python and Node.js versions: **UNVERIFIED**.

1. Create an API key at https://elevenlabs.io/app/settings/api-keys.
2. Install the SDK:
   - Python: `pip install elevenlabs python-dotenv`
   - TypeScript: `npm install @elevenlabs/elevenlabs-js dotenv`
3. Create a `.env` file in the project directory:
   ```
   ELEVENLABS_API_KEY=<your_api_key_here>
   ```

**Alternative setup with a coding agent.** Paste this into Claude Code, Cursor or Codex:
`npx -y @elevenlabs/cli@latest onboard init`
It signs you in or creates an account, creates a key, and adds the SDK to your project. You don't need an account or key beforehand.

**ElevenLabs CLI.** The page uses an `elevenlabs` command but does not say how to install it; it points to the quickstart for that. Install steps: **UNVERIFIED**.

## 3. Key concepts

*Source: https://elevenlabs.io/docs, sections "Concepts", "How does pricing work?", "Built for production" and "Which model should I use?" (retrieved 2026-10-21)*

- **Voices**: the speech persona used to generate audio.
  - Each voice has a unique ID; for example, `JBFqnCBsd6RMkjVDRZzb` is "George".
  - The library has 10,000+ voices.
  - You can also clone a voice from a recording or generate one from a text description.
- **Models**: control quality, latency and language coverage. You pass the model ID as `model_id` (see the table below).
- **Credits**: the unit of consumption for every product.
  - TTS costs 1 credit per character of input text.
  - Other operations are charged per second of audio processed.
  - Credits reset monthly, and unused credits roll over for up to two months.
- **Pay As You Go**: a prepaid balance with no subscription. It is drawn down only after any subscription credits are used up.
- **Concurrency**: your plan sets how many requests are processed at once.
  - This limit is not a cap on simultaneous conversations. As a rule of thumb, a limit of 5 supports around 100 simultaneous audio broadcasts, depending on the voices and use case.
  - Enterprise plans have higher limits.
- **Enterprise controls**:
  - Private deployments run ElevenAgents, TTS and STT inside your own cloud.
  - Data residency stores data in the EU, India or Singapore instead of the default U.S. (Enterprise only).
  - Workspaces add SSO (SAML 2.0 or OIDC) and audit logs in the OCSF schema.

| Model (ID) | Best for | Languages | Max chars per request | Latency† |
|---|---|---|---|---|
| Eleven v4 (`eleven_v4`) | Expressive and long-form narration; multilingual | 90+ | 10,000 (~10 min) | not stated |
| Eleven v4 Turbo (`eleven_v4_turbo`) | Real-time voice agents | 90+ | not stated: **UNVERIFIED** | ~100 ms median |
| Eleven Flash v2.5 (`eleven_flash_v2_5`) | Lowest cost (50% lower API price per character); lowest latency | 32 | 40,000 | ~75 ms |
| Eleven Multilingual v2 (`eleven_multilingual_v2`) | Most stable long-form output | 29 | 10,000 | not stated |
| Eleven v3 (ID **UNVERIFIED**) | Dramatic delivery | 70+ | 5,000 | not stated |
| Eleven v3 Conversational (ID **UNVERIFIED**) | Expressive real-time speech | 70+ | not stated | ~280 ms |
| Scribe v2 (`scribe_v2`) | Batch STT: diarization (up to 32 speakers), 1,000 keyterms, word timestamps | 90+ | n/a | n/a |
| Scribe v2 Realtime (`scribe_v2_realtime`) | Streaming STT | 90+ | n/a | ~150 ms |
| Scribe v2 Medical (`scribe_v2_medical`) | Clinical audio (35% fewer errors than Scribe v2) | as Scribe v2 | n/a | n/a |

† Model inference only. Excludes application and network latency.

## 4. Minimal working example

*Source: https://elevenlabs.io/docs, section "Generate your first audio" (retrieved 2026-10-21). This is the page's Python example, unchanged.*

```python
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os

load_dotenv()

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

audio = elevenlabs.text_to_speech.convert(
    text="The first move is what sets everything in motion.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",  # "George" - browse voices at elevenlabs.io/app/voice-library
    model_id="eleven_v4",
    output_format="mp3_44100_128",
)

with open("output.mp3", "wb") as f:
    for chunk in audio:
        f.write(chunk)
```

To run it, save it as `example.py`, run `python example.py`, then open `output.mp3`.

The page also gives a TypeScript version (run with `npx tsx example.mts`) and this CLI equivalent (the page splits it over several lines; it is shown here on one line):

`elevenlabs text-to-speech convert --voice-id JBFqnCBsd6RMkjVDRZzb --model-id eleven_v4 --text "The first move is what sets everything in motion." --output-format mp3_44100_128 --output output.mp3`

This example was **not executed** for this note. That it runs as-is: **UNVERIFIED**.

## 5. Common pitfalls

*Source: https://elevenlabs.io/docs, sections "Built for production", "Which model should I use?", "How does pricing work?" and "Generate your first audio" (retrieved 2026-10-21)*

- **Latency figures are inference-only.** They exclude application and network latency, so users hear audio later than ~75/100/150 ms.
- **Concurrency ≠ conversations.** A concurrency limit of 5 is not "5 users". Don't size capacity from it directly.
- **Per-request character limits differ by model.** For example, Eleven v3 allows 5,000 characters while Flash v2.5 allows 40,000. What happens when you exceed a limit: **UNVERIFIED**.
- **Language coverage differs by model.** Flash v2.5 covers 32 languages and Multilingual v2 covers 29, versus 90+ for v4. Check this before switching to the cheaper or faster model.
- **v4 is the most expressive model, not the most stable.** For the most stable long-form output, the docs point to `eleven_multilingual_v2`.
- **TTS is billed per input character.** Long texts consume credits proportionally.
- **Data residency outside the U.S. is Enterprise-only.**
- **Clinical audio needs its own model.** Use `scribe_v2_medical`, not `scribe_v2`.
- **TypeScript client and the API key.** The TS example calls `new ElevenLabsClient()` with no key argument and imports `dotenv/config`. That the client reads `ELEVENLABS_API_KEY` from the environment automatically: **UNVERIFIED** (the page doesn't say).

## 6. Links

*All taken from https://elevenlabs.io/docs (retrieved 2026-10-21). Relative links were resolved to `https://elevenlabs.io` (**UNVERIFIED** host). None of these pages were read for this note.*

- API quickstart: https://elevenlabs.io/docs/eleven-api/quickstart
- Models reference: https://elevenlabs.io/docs/overview/models
- Choosing the right model: https://elevenlabs.io/docs/eleven-api/choosing-the-right-model
- Understanding latency: https://elevenlabs.io/docs/eleven-api/concepts/latency
- Latency optimization: https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization
- Pay As You Go: https://elevenlabs.io/docs/overview/administration/pay-as-you-go
- ElevenAgents quickstart: https://elevenlabs.io/docs/eleven-agents/quickstart
- API keys: https://elevenlabs.io/app/settings/api-keys
- Voice library: https://elevenlabs.io/app/voice-library
- API pricing: https://elevenlabs.io/pricing/api
- CLI `onboard` command source: https://github.com/elevenlabs/cli/tree/main/cli/elevenlabs/workflow/onboard
