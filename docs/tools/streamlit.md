# Streamlit — Quick Reference

All facts below come from the official docs at docs.streamlit.io, fetched **2026-10-14**. Items the docs did not confirm are marked **UNVERIFIED**.

---

## 1. What it is

*Source: https://docs.streamlit.io/ (fetched 2026-10-14)*

- An open-source Python framework, aimed at data scientists and AI/ML engineers, for building interactive data apps in a few lines of code.
- The docs are organised into four areas: **Get started** (installation, fundamentals), **Develop** (concepts, API reference, tutorials), **Deploy** (Community Cloud, Snowflake, other platforms) and **Knowledge base** (FAQ, dependencies, deployment issues).
- Deployment options named on the home page: Streamlit Community Cloud (free) and Streamlit in Snowflake (enterprise).

## 2. Setup (Windows)

*Source: https://docs.streamlit.io/get-started/installation/command-line (fetched 2026-10-14)*

**Prerequisites:** Python **3.10–3.14**; `venv` and `pip` (both ship with Python); a code editor (the docs use VS Code). Xcode tools are macOS-only and not needed on Windows.

```bat
cd myproject
python -m venv .venv

:: Activate — Command Prompt
.venv\Scripts\activate.bat
:: Activate — PowerShell
.venv\Scripts\Activate.ps1

pip install streamlit
streamlit hello              :: or: python -m streamlit hello
```

When the environment is active, `(.venv)` appears before the prompt. `streamlit hello` should open a demo app in a new browser tab.

**Daily use:** go to the project folder, activate `.venv`, then `streamlit run app.py` (or `python -m streamlit run app.py`). Stop the server with **Ctrl+C**; leave the environment with `deactivate`.

## 3. Key concepts

*Sources: https://docs.streamlit.io/get-started/fundamentals/main-concepts and https://docs.streamlit.io/get-started/fundamentals/advanced-concepts (fetched 2026-10-14)*

- **Running:** `streamlit run your_script.py` starts a local server and opens the app in your default browser. Script arguments go after `--`, e.g. `streamlit run app.py -- arg1`. `streamlit run` also accepts a URL.
- **Data flow:** whenever the source file is saved or a user interacts with a widget, Streamlit **reruns the whole script top to bottom**. Widget callbacks (`on_change`, `on_click`) run before the rest of the script.
- **Dev loop:** on save, Streamlit offers to rerun; choose "Always rerun" for automatic refresh.
- **Display:** `st.write()` renders almost anything (text, DataFrames, charts). "Magic": a bare variable or literal on its own line is written automatically. Specific commands (`st.dataframe`, `st.table`, `st.line_chart`, `st.map`) give more control.
- **Widgets as variables:** `x = st.slider('x')` returns the widget's current value on each rerun. Giving a widget a `key` adds it to Session State.
- **Layout:** `st.sidebar.*`, `st.columns`, `st.expander`; `st.progress` for long tasks.
- **Caching:** `@st.cache_data` for functions returning serialisable data (returns a fresh copy each call; the default choice). `@st.cache_resource` for global, unserialisable objects such as ML models or DB connections (returns the shared object itself).
- **Session State:** `st.session_state` is a per-session, dict-like store that survives reruns. Each browser tab is its own session; a page refresh starts a new one. Cached values, by contrast, are shared by all users.
- **Connections & secrets:** `st.connection("name")` handles caching for common connections and reads credentials from `.streamlit/secrets.toml` (keep it out of Git).

## 4. Minimal working example

*Built only from APIs shown at https://docs.streamlit.io/get-started/fundamentals/main-concepts and https://docs.streamlit.io/get-started/fundamentals/advanced-concepts (fetched 2026-10-14)*

```python
# app.py  —  run with:  streamlit run app.py
import streamlit as st
import pandas as pd

st.write("Hello world")

x = st.slider("x")                      # widget value updates on every rerun
st.write(x, "squared is", x * x)

@st.cache_data                           # skip recomputation on reruns
def make_table():
    return pd.DataFrame({"first column": [1, 2, 3, 4],
                         "second column": [10, 20, 30, 40]})

st.dataframe(make_table())

if "counter" not in st.session_state:   # persists across reruns
    st.session_state.counter = 0
st.session_state.counter += 1
st.write(f"This page has run {st.session_state.counter} times.")
st.button("Run it again")
```

## 5. Common pitfalls

*Sources: https://docs.streamlit.io/knowledge-base/using-streamlit/sanity-checks, https://docs.streamlit.io/develop/concepts/design/buttons, https://docs.streamlit.io/develop/concepts/architecture/caching, https://docs.streamlit.io/get-started/fundamentals/main-concepts (fetched 2026-10-14)*

1. **"'streamlit' is not recognized" (Windows).** Python from python.org is not added to PATH automatically. Add Python to PATH, or use `python -m streamlit ...`.
2. **pip fails with "Microsoft Visual C++ 14.0 is required" (Windows).** Python is trying to compile a dependency (pyarrow); install *Build Tools for Visual Studio*.
3. **Unsupported Python version.** Use 3.10–3.14.
4. **Buttons don't remember being clicked.** `st.button` returns `True` for one rerun only, so content nested under `if st.button(...)` disappears on the next interaction. Buttons or widgets nested inside a button never work. Store state in `st.session_state`, ideally via an `on_click` callback.
5. **Changing a widget's value after it has rendered** in the same run raises an error. Set the value before the widget, or in a callback.
6. **Duplicate widget keys** when adding widgets dynamically cause `DuplicateWidgetID`; include an index in each key.
7. **Mutating `st.cache_resource` results** changes the shared cached object for every user (risk of errors or corrupted data). Prefer `st.cache_data` for data.
8. **Unhashable arguments to cached functions** raise `UnhashableParamError`. Prefix the parameter with `_` to skip hashing it, or pass `hash_funcs`.
9. **`st.cache_data` uses pickle**, so only cache data you trust.
10. **`st.cache` was removed in 1.62.0.** Use `st.cache_data` or `st.cache_resource` instead.
11. **Stale results:** set `ttl=` on cached database or API calls.
12. **Version mismatch:** confirm with `st.write(st.__version__)` that the app runs the Streamlit you installed. If the browser caches too aggressively, hard-refresh with Ctrl+Shift+R or try `--server.port=9876`.

**UNVERIFIED (not stated on the pages read):**
- PowerShell may block `Activate.ps1` because of its script execution policy.
- The default local URL and port (commonly cited as `http://localhost:8501`).
- Behaviour when running an app with plain `python app.py` instead of `streamlit run`.

## Maps (pydeck): seen in one project, not from the docs

- **Browser graphics acceleration off:** the map is cut off while the page scrolls. Demo and record with it on, in Edge or Chrome. `[data-testid='stDeckGlJsonChart'] {opacity: 0.999;}` only makes it recover faster. A browser with WebGL off (LibreWolf in that test) may not show the map, so give another way to reach the content.
- **Mouse wheel:** it zooms the map instead of scrolling the page. Set `scrollZoom: False` in the controller settings and keep the map's buttons.
- **A new widget key distorted the map.** To clear Streamlit's fade after a click, change the layer ids instead.
- **Grey fade during reruns:** `[data-stale='true'] {opacity: 1;}` turns it off.
- **Small features at region zoom** are only a few pixels wide, so mark the important ones with a ring of fixed screen size.

## Loading spinners: seen in a template test, not from the docs

- **A cached function's spinner names the function:** while it runs, the app shows e.g. "Running load_summary()." Give every cached function `show_spinner=False` or a plain-language text, e.g. `@st.cache_data(show_spinner="Writing the summary…")`. No function names on screen.

## 6. Links

*All fetched 2026-10-14*

| Topic | URL |
|---|---|
| Docs home | https://docs.streamlit.io/ |
| Install via command line | https://docs.streamlit.io/get-started/installation/command-line |
| Basic concepts | https://docs.streamlit.io/get-started/fundamentals/main-concepts |
| Advanced concepts | https://docs.streamlit.io/get-started/fundamentals/advanced-concepts |
| Running your app | https://docs.streamlit.io/develop/concepts/architecture/run-your-app |
| Caching | https://docs.streamlit.io/develop/concepts/architecture/caching |
| Button behaviour | https://docs.streamlit.io/develop/concepts/design/buttons |
| Sanity checks (incl. Windows) | https://docs.streamlit.io/knowledge-base/using-streamlit/sanity-checks |
| FAQ | https://docs.streamlit.io/knowledge-base/using-streamlit |
| API reference | https://docs.streamlit.io/develop/api-reference |
