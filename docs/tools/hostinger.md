# Hostinger: Public API & CLI quick reference

All pages fetched **2026-10-14** from docs.hostinger.com. Anything not stated there is marked **UNVERIFIED**. Hostinger is managed in the browser (hPanel), so "Setup (Windows)" covers the developer tooling: CLI, REST API, SDKs.

## What it is

*Sources: https://docs.hostinger.com/readme.md (updated 2026-09-10), https://docs.hostinger.com/getting-started/overview.md (updated 2026-07-27), https://docs.hostinger.com/api-reference/overview.md (updated 2026-09-10). Fetched 2026-10-14.*

- Hostinger is a managed web hosting platform: domains, hosting, deployment, SSL, backups, caching and monitoring, all managed from the **hPanel** control panel at hpanel.hostinger.com.
- Hosts static sites, PHP, WordPress and Node.js apps (Web, Cloud, Agency, VPS and WordPress plans).
- The **Public API** is a mostly RESTful JSON API over HTTPS covering hosting, domains, DNS, email, VPS, WordPress, ecommerce and billing.
- The API reference, the **`hostinger` CLI**, the SDKs (PHP, Python, TypeScript) and the MCP server are all generated from one OpenAPI spec, so they cover the same operations.

## Setup (Windows)

*Sources: https://docs.hostinger.com/api-reference/cli.md (updated 2026-08-05), https://docs.hostinger.com/api-reference/cli-scripting.md (updated 2026-08-05), https://docs.hostinger.com/account/security.md (updated 2026-07-22), https://docs.hostinger.com/api-reference/sdks.md (updated 2026-08-06). Fetched 2026-10-14.*

1. **Install the CLI.** Homebrew is documented for macOS/Linux. On Windows, download your platform's archive from https://github.com/hostinger/api-cli/releases and put the `hostinger` binary on your `PATH`. Archives bundle shell completions; PowerShell is supported.
   - Exact steps for editing `PATH` on Windows: **UNVERIFIED** (not on the pages).
2. **Confirm:** `hostinger version`
3. **Authenticate (pick one):**
   - **Browser sign-in (no token needed):** run any command; the CLI opens a browser sign-in and caches/refreshes credentials at `%APPDATA%\hostinger\api-cli\credentials.json`.
   - **Token (CI/scripts):** create one in hPanel → API (**Generate new token**, name it, copy it; it is shown only once). Then set the `HOSTINGER_API_TOKEN` environment variable, or add `api_token: <token>` to `$HOME/.hostinger.yaml`.
     - PowerShell syntax, e.g. `$env:HOSTINGER_API_TOKEN = "<token>"`: **UNVERIFIED** (the docs show only bash `export`).
     - Where `$HOME/.hostinger.yaml` resolves on Windows (presumably `%USERPROFILE%`): **UNVERIFIED**.
4. **Optional SDKs:** `pip install hostinger-api` · `composer require hostinger/api-php-sdk` · `npm install hostinger-api-sdk`. You pass the token in; SDKs don't read the env var.

## Key concepts

*Sources: https://docs.hostinger.com/api-reference/overview.md (updated 2026-09-10), https://docs.hostinger.com/api-reference/pagination.md (updated 2026-09-10), https://docs.hostinger.com/api-reference/errors.md (updated 2026-09-10), https://docs.hostinger.com/api-reference/cli.md, https://docs.hostinger.com/api-reference/sdks.md. Fetched 2026-10-14.*

- **Base URL & paths:** `https://developers.hostinger.com` + `/api/<product>/<version>/…`, e.g. `/api/hosting/v1/websites` (versions are per endpoint). Send `Content-Type: application/json`; responses are always JSON.
- **Auth:** `Authorization: Bearer <token>`. Tokens inherit the creating user's permissions and can be set to expire.
- **Rate limit:** 90 requests/minute, counted per user (shared across machines using the same token). `429` includes `Retry-After`; headers `X-RateLimit-Limit` / `X-RateLimit-Remaining` help pacing.
- **Pagination:** `page` (default 1) and `per_page` (default 25, max 100). Response has `data` + `meta` (`current_page`, `per_page`, `total`); no `last_page` or `next` link. CLI and SDKs do not auto-paginate.
- **Errors:** JSON with `message` + `correlation_id` (also header `x-correlation-id`); `422` adds per-field `errors`.
- **CLI shape:** `hostinger <group> <subgroup> <verb>`; groups include `hosting`, `vps`, `mail`, `wordpress`, `domains`, `dns`, `agency-hosting`, `ecommerce`, `reach`, `billing`, `horizons`. Output: table (default), `--format json`, `--format tree`.
- **Same operation, every surface:** `GET /api/hosting/v1/websites` = `hostinger hosting websites list` = `list_websites_v1()` (Python) = `listWebsitesV1()` (PHP/TS).

## Minimal working example

*Sources: https://docs.hostinger.com/api-reference/cli.md, https://docs.hostinger.com/api-reference/overview.md, https://docs.hostinger.com/api-reference/sdks.md. Fetched 2026-10-14.*

**CLI** (list your websites):

```
hostinger hosting websites list --format json
```

**REST** (as shown in the docs, bash syntax):

```bash
curl https://developers.hostinger.com/api/hosting/v1/websites \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Same command in PowerShell: **UNVERIFIED** (docs show bash only).

**Python SDK:**

```python
import os
import hostinger_api

configuration = hostinger_api.Configuration(
    access_token=os.environ["HOSTINGER_API_TOKEN"]
)
with hostinger_api.ApiClient(configuration) as client:
    websites = hostinger_api.HostingWebsitesApi(client)
    for website in websites.list_websites_v1().data:
        print(website.domain, website.is_enabled)
```

## Common pitfalls

*Sources: https://docs.hostinger.com/api-reference/cli.md, https://docs.hostinger.com/api-reference/cli-scripting.md, https://docs.hostinger.com/api-reference/errors.md, https://docs.hostinger.com/api-reference/overview.md, https://docs.hostinger.com/api-reference/sdks.md, https://docs.hostinger.com/account/security.md. Fetched 2026-10-14.*

- **Stale token beats browser sign-in.** A configured token takes precedence; if commands suddenly fail to authorize, check `api_token` in the config file and the environment first.
- **No `logout` command.** To sign out or switch accounts, delete `%APPDATA%\hostinger\api-cli\credentials.json`.
- **PowerShell quoting.** JSON-valued flags (e.g. `--zone`) rely on bash single quotes; in PowerShell, read the JSON into a variable or escape inner double quotes. There is no `@file.json` or stdin form.
- **`dns records update` overwrites by default** (`--overwrite` defaults to `true`). Use `--overwrite=false` to append, and run `hostinger dns snapshots list <domain>` first.
- **Destructive verbs don't prompt.** Deletes, `recreate`, `reset-hostname`, `purge-lite-speed` act immediately. Stick to `list` / `get` / `info` / `show-*` while exploring.
- **Exit code is always 1 on failure** (API error, bad flag or bad JSON alike); parse the printed body. **Permission errors show as 401 or 404**, never 403.
- **Retry only 429/500/502**, with backoff; repeated 429s can get your IP blocked. On `202 Accepted`, poll; don't resend.
- **"Test it" panels hit your live account** and use your rate limit. **Python package ≠ import name:** install `hostinger-api`, import `hostinger_api`.
- **Tokens are passwords:** never commit them to Git; revoking in hPanel → API takes effect immediately.
- **Token page URL differs between pages:** `hpanel.hostinger.com/api` (CLI, SDKs, Security) vs `hpanel.hostinger.com/profile/api` (API overview, Errors). Which one is canonical: **UNVERIFIED**.

## Links

*All fetched 2026-10-14. Docs pages are under https://docs.hostinger.com/:* `readme.md` (home) · `getting-started/overview.md` · `api-reference/overview.md` · `api-reference/cli.md` · `api-reference/cli-scripting.md` · `api-reference/sdks.md` · `api-reference/pagination.md` · `api-reference/errors.md` · `account/security.md`

*Linked from those pages:* CLI releases (Windows binaries) https://github.com/hostinger/api-cli/releases · CLI command index https://github.com/hostinger/api-cli/blob/main/docs/hostinger.md · endpoint reference https://developers.hostinger.com
