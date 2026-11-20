# Remotion: Getting Started Notes

> Compiled from the official Remotion docs only. All pages fetched **2026-10-14**.
> Anything the pages did not state is marked **UNVERIFIED**.

---

## What it is

*Source: https://www.remotion.dev/docs/ (fetched 2026-10-14)*

- Remotion is a tool for creating videos with code; projects can be edited, run and rendered locally.
- A new project can be created three ways: with the ChatGPT desktop app (via the Remotion plugin), by prompting a coding agent (Claude Code, Codex, OpenCode), or from the command line.
- Remotion can also be added to an existing project (see "Installation in existing projects" in Links).

---

## Setup (Windows)

*Sources: https://www.remotion.dev/docs/ and https://www.remotion.dev/docs/ai/coding-agents (fetched 2026-10-14)*

**What the docs state (platform-independent):**

1. Install **Node.js 16 or later**, or **Bun 1.0.3 or later**.
2. Create a project with your package manager of choice:

   | Package manager | Command |
   |---|---|
   | npm | `npx create-video@latest` |
   | pnpm | `pnpm create video` |
   | yarn | `yarn create video` |
   | bun | `bun create video` |
   | nub | `nubx create-video@latest` |

3. The wizard lets you pick a package manager, a template, and whether to install Agent Skills.
4. Open the project in your editor and start the dev server with `npm run dev`.

**Windows specifics:** **UNVERIFIED.** None of the fetched pages mention Windows. The system-requirements section lists only macOS (15 Sequoia or later) and Linux (glibc ≥ 2.35, extra packages; Alpine and nixOS unsupported). Whether Windows is supported, which minimum Windows version applies, and whether any extra dependencies are needed is not confirmed by these pages. Running the commands above in PowerShell or Command Prompt is likewise **UNVERIFIED**.

---

## Key concepts

*Sources: https://www.remotion.dev/docs/, https://www.remotion.dev/docs/studio, https://www.remotion.dev/docs/ai/coding-agents (fetched 2026-10-14)*

- **Templates:** starting points for a project. *Hello World* is recommended for a first project; *Blank* is used by the `--blank` flag.
- **Remotion Studio:** a local preview tool. It starts a server on port 3000 (or a higher port if 3000 is taken) and opens in the browser. If a server is connected, it can also render the video. Under the hood it is the CLI's `npx remotion studio` command.
- **Remotion CLI (`@remotion/cli`):** required for the Studio. Most templates include it; otherwise install it, e.g. `npm i @remotion/cli`.
- **Agent Skills:** an add-on installed with `npx remotion skills add` (per project) or `npx -y skills@latest add remotion-dev/skills -g -y` (global), used so coding agents can create videos by prompting.
- **ESLint config:** templates ship a recommended ESLint setup via `@remotion/eslint-config`.

---

## Minimal working example

*Sources: https://www.remotion.dev/docs/ and https://www.remotion.dev/docs/ai/coding-agents (fetched 2026-10-14)*

```sh
npx create-video@latest --yes --blank my-video
cd my-video
npx remotion skills add
npm run dev
```

This creates a project in `my-video` from the Blank template with Agent Skills and without TailwindCSS, then starts the local dev server / Studio.

Optional (prompting with an agent): open a second terminal, `cd my-video`, and start your agent (e.g. `claude`, `codex`, `kimi`, `opencode`).

A code-level example (a React component that defines a video) is **not** on these pages, so none is given here (**UNVERIFIED** beyond the CLI steps).

---

## Common pitfalls

*Sources: https://www.remotion.dev/docs/, https://www.remotion.dev/docs/studio, https://www.remotion.dev/docs/ai/coding-agents (fetched 2026-10-14)*

- **Next.js / React Router 7 templates behave differently:** `npm run dev` starts the *app*; the Studio is started with `npm run remotion`.
- **Conflicting Studio command for regular templates:** the installation page says `npm run dev`, while the Studio page says `npm start`. Which one a given template uses is **UNVERIFIED**; check the project's `package.json` scripts.
- **Port 3000 in use:** the Studio silently moves to a higher port, so the URL may not be `localhost:3000`.
- **Missing CLI:** if the Studio won't start, `@remotion/cli` may not be installed.
- **Bun is only "mostly supported"** as a runtime.
- **OS limits:** macOS older than 15 is unsupported; Linux needs glibc ≥ 2.35 plus extra packages; Alpine Linux and nixOS are unsupported. Windows status: **UNVERIFIED**.
- **Coding agents:** most require a paid subscription.

---

## Links

*All fetched or listed 2026-10-14.*

- Installation (main page): https://www.remotion.dev/docs/
- Remotion Studio: https://www.remotion.dev/docs/studio
- Prompting with coding agents: https://www.remotion.dev/docs/ai/coding-agents
- Agent Skills: https://www.remotion.dev/docs/ai/skills
- ChatGPT / Codex plugin: https://www.remotion.dev/docs/ai/codex-plugin
- Templates: https://www.remotion.dev/templates (Hello World: https://www.remotion.dev/templates/hello-world)
- Bun support: https://www.remotion.dev/docs/bun
- ESLint config: https://www.remotion.dev/docs/eslint-config
- Linux dependencies: https://www.remotion.dev/docs/miscellaneous/linux-dependencies
- Existing projects: https://www.remotion.dev/docs/brownfield
- Next page in the guide, "Your first video": https://www.remotion.dev/docs/your-first-video (linked, not fetched)
