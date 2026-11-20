Following are the details of a linux laptop that I own for tinkering and testing purposes:

Manufacturer: Lenovo
Model: Thinkpad T480S 20L8S09L00

CPU: Intel Core i5-8350U 1.7 GHz x 4
GPU: Integrated graphics

Storage: 380 GB SSD
Installed RAM: 8 GB DDR4 SODIMM 2666 Mhz
RAM details: Single channel, one stick

OS: Linux Mint. Commands on this laptop are bash, not PowerShell (`source .venv/bin/activate`, `python3`).
Role: runs the finished app as a backup or demo machine (`git pull`, venv, `streamlit run app.py`, browser full screen on `localhost:8501`). Building, rendering and anything Node-based stay on the main laptop.
Local models, if a project uses them: llama.cpp built for the CPU, Gemma 3 270M and 1B downloaded. Measured 2026-11-02 (4 threads): 270M Q8_0 about 93 ms per short decision, 482 MiB RAM; 1B Q4_K_M about 419 ms, 1.08 GiB. Speed only: decision quality is unproven.