# Jev (TypeSafe): quick reference

All facts below come from docs.typesafe.ai, **fetched 2026-10-14**. Anything the docs did not confirm is marked **UNVERIFIED**. Docs describe `jev-1.13.0` (jaggedness page last reviewed 2026-10-02).

## What it is
*Source: https://docs.typesafe.ai/introduction.md · https://docs.typesafe.ai/models.md (fetched 2026-10-14)*

Jev is TypeSafe's flagship model and its first "System One" model: built for fast, structured decisions that code consumes directly, not for generating text. You send a **state** plus typed **questions**; you get typed answers with probability distributions (and confidence for Choice/Score). All questions in one call are evaluated in parallel and independently against the same state.

- Endpoint: `POST https://api.typesafe.ai/v1/systemone`, `Authorization: Bearer <API_KEY>`.
- Current model `jev-1.13.0`; aliases `jev-latest` (stable, SDK default) and `jev-preview` (currently the same model).
- Context: 64k tokens per request; 32k for `state` + longest single question. Text only.
- Pricing: per input token ($0.042/Mtok); output tokens free. Rate limits 100K tok/s and 80 req/s, which the docs say may change without notice.

## Setup (Windows)
*Source: https://docs.typesafe.ai/introduction/quickstart.md · https://docs.typesafe.ai/sdk/python.md · https://docs.typesafe.ai/sdk/python/usage.md (fetched 2026-10-14)*

The docs give setup commands for **Bash on macOS, Linux, or Windows with WSL** only. No native Windows/PowerShell instructions exist.

**Documented path (WSL):**
1. Create an API key at https://console.typesafe.ai/keys.
2. Requires Python 3.10+.
3. In a WSL shell:
   ```bash
   mkdir typesafe-quickstart && cd typesafe-quickstart
   export TYPESAFE_API_KEY="your-api-key"
   python3 -m venv .venv
   .venv/bin/pip install typesafe-sdk      # or: uv init --bare && uv add typesafe-sdk
   ```
   Optional: `typesafe-sdk[http2]` for HTTP/2.

**Native PowerShell: UNVERIFIED** (standard Python-on-Windows equivalents, not from the docs):
```powershell
$env:TYPESAFE_API_KEY = "your-api-key"
py -m venv .venv
.venv\Scripts\pip install typesafe-sdk
.venv\Scripts\python route_ticket.py
```

SDK environment variables (documented): `TYPESAFE_API_KEY` (required), `TYPESAFE_BASE_URL` (default `https://api.typesafe.ai`), `TYPESAFE_DEFAULT_MODEL` (default `jev-latest`), `TYPESAFE_LOG_LEVEL`. Default timeout is 10.0 s per HTTP operation.

## Key concepts
*Source: https://docs.typesafe.ai/introduction.md · https://docs.typesafe.ai/concepts/state.md · https://docs.typesafe.ai/confidence.md (fetched 2026-10-14)*

- **State:** the content to evaluate. A string, a JSON object, or an array. Objects with descriptive field names are recommended for most requests.
- **Primitives (question types):**

  | Type | Asks | Returns |
  |---|---|---|
  | Choice | Pick one option from a set | `choice`, `probabilities`, `confidence` |
  | Score | Rate on ordered levels (0…n-1) | `score`, `probabilities`, `confidence` |
  | Noul | Is this statement true? | `noul` (probability 0–1) |

- **Confidence:** a 0–1 value derived from the probability distribution. It is 1 when all probability sits on one outcome and 0 when it is spread evenly. Noul has none; the docs suggest `|2p − 1|` if you need one. Recommended use: act on high confidence, confirm on medium, route to a human on low. Set thresholds by risk.
- **Atomic questions:** ask one narrow "gut-check" thing per question and combine the results in your own code.

## Minimal working example
*Source: https://docs.typesafe.ai/introduction/quickstart.md (fetched 2026-10-14)*

`route_ticket.py`:
```python
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

ticket = "Our API integration started returning 500 errors on every request about 20 minutes ago, and we can't process any customer orders until this is fixed."

with TypeSafeClient(model="jev-latest") as client:  # Reads TYPESAFE_API_KEY.
    response = client.system_one(
        state=ticket,
        questions={
            "department": Choice(
                instructions="Which team should handle this",
                criteria={
                    "billing": "Payment or subscription issues",
                    "technical": "Bugs or integration problems",
                    "sales": "Pricing or account questions",
                },
            ),
            "frustration": Score(
                instructions="How frustrated the customer appears",
                criteria=["Calm, just stating facts", "Frustrated but civil", "Very angry, strong language"],
            ),
            "is_urgent": Noul(instructions="The message conveys urgency or time-sensitivity"),
        },
    )

print(response.choices["department"].choice)
print(response.scores["frustration"].score)
print(response.nouls["is_urgent"].noul)
```
Run: `.venv/bin/python route_ticket.py`. The documented example output is `technical`, `0.67`, `0.99`; the docs note that values can change between releases.

## Common pitfalls
*Source: https://docs.typesafe.ai/model-jaggedness/jev-1.13.md · https://docs.typesafe.ai/models.md · https://docs.typesafe.ai/sdk/python/usage.md (fetched 2026-10-14)*

- **Literal reading:** Jev answers what you wrote, not what you meant. State exact conditions and put boundary cases in the criteria.
- **Math, counting, numbers:** keep arithmetic in code. Ask one Noul per item and sum the results yourself. Don't interpolate exact values from Score outputs.
- **Dates:** extract the parts with a Choice, then compare them in code.
- **Indirection:** avoid double negatives and multi-hop questions.
- **Large, noisy state:** filter in code first; irrelevant content lowers accuracy ("context rot").
- **Adversarial content:** state is not treated as hostile. Test edge cases before deploying.
- **Contradictory instructions and criteria:** align them (e.g., don't map `true` to "no").
- **Choice order bias:** Jev may lean toward the first option. Reorder the options to check that the answer stays consistent.
- **Generation:** Jev is not a text generator. Turn extraction into a Choice over candidate values.
- **Aliases move:** `jev-latest` can change under you. Pin `jev-1.13.0` if you tuned thresholds against it.
- **Rate limits:** a `429` is returned over either limit. The SDKs retry with backoff by default.
- **Logging:** at the `debug` level, request and response bodies are **not** redacted.
- **Non-English text:** it is accepted but less accurate; test it, and watch confidence.
- **Doc inconsistencies (UNVERIFIED):** the usage page shows `TypeSafeClient(model="jev")`, but `jev` isn't listed as an alias on the Models page. The Confidence page's Python example reads `response.answers["action"]`, while the Quickstart uses `response.choices[...]`. Prefer the Quickstart form.

## Links
*Source: https://docs.typesafe.ai/llms.txt (fetched 2026-10-14)*

- Docs index: https://docs.typesafe.ai/llms.txt
- Introduction: https://docs.typesafe.ai/introduction.md
- Quick start: https://docs.typesafe.ai/introduction/quickstart.md
- State: https://docs.typesafe.ai/concepts/state.md
- Primitives: https://docs.typesafe.ai/primitives.md
- Confidence: https://docs.typesafe.ai/confidence.md
- Models: https://docs.typesafe.ai/models.md
- Jev 1.13 jaggedness: https://docs.typesafe.ai/model-jaggedness/jev-1.13.md
- Python SDK: https://docs.typesafe.ai/sdk/python.md · Usage: https://docs.typesafe.ai/sdk/python/usage.md · Constants: https://docs.typesafe.ai/sdk/python/api/constants.md
- API reference: https://docs.typesafe.ai/api.md
- Python SDK source: https://github.com/typesafe-ai/typesafe-sdk-python
- Console / API keys: https://console.typesafe.ai/keys · Playground: https://console.typesafe.ai/playground
