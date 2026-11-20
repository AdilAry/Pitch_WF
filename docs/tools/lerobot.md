# LeRobot — quick reference

Compiled 2026-10-22 from three official Hugging Face doc pages only (see *Links*). Anything not stated on those pages is marked **UNVERIFIED**.

---

## What it is
*Source: LeRobot docs index (attached), https://huggingface.co/docs/lerobot/index — provided 2026-10-22*

- Hugging Face's Python library for machine learning on real robots. It gives a hardware-agnostic interface for controlling robots, from low-cost arms (SO-ARM101) to humanoids.
- Includes tools to record, store and share robot datasets in one standard format, **LeRobotDataset**, which can be streamed from the Hugging Face Hub.
- Implements trainable policies, from small imitation-learning models (ACT) to vision-language-action models (π₀, SmolVLA), all driven by the same CLI commands.
- Stated goal: lower the barrier to entry for robotics through shared datasets and pretrained models.
- Works without hardware too: train on Hub datasets, evaluate in simulation (LIBERO, Meta-World), or use the Colab notebooks.

## Setup (Windows)
*Source: https://huggingface.co/docs/lerobot/installation.md — fetched 2026-10-22*

The docs have no dedicated Windows guide; these are the Windows-relevant points they do make.

1. **Environment manager.** conda via miniforge is recommended. The page's miniforge commands are Linux/macOS shell (`wget` … `.sh`); the Windows installer route is **UNVERIFIED** (see conda-forge.org/download). With another manager (uv, venv) you need **Python ≥ 3.12** and **PyTorch ≥ 2.10**.
2. **Create and activate** (repeat activation in every new shell):
   ```
   conda create -y -n lerobot python=3.12
   conda activate lerobot
   ```
   With uv: `uv venv --python 3.12`, then on Windows PowerShell `.venv\Scripts\activate`.
3. **ffmpeg.** TorchCodec (the default video decoder) needs ffmpeg. On **Windows with PyTorch < 2.8** TorchCodec isn't available and LeRobot falls back to `pyav`, so ffmpeg can be skipped. Otherwise use `conda install ffmpeg -c conda-forge` (works on all PyTorch versions; *required* below 2.10). A system-wide ffmpeg is only supported with PyTorch ≥ 2.10; the page gives no Windows command for that (**UNVERIFIED**).
4. **Install LeRobot.** The base package is deliberately minimal; add extras for real work:
   ```
   pip install lerobot                          # core only
   pip install "lerobot[core_scripts,training]"  # record/replay/calibrate + train
   pip install "lerobot[feetech]"                # SO100/SO101 motors
   ```
   (Docs use single quotes; double quotes for cmd/PowerShell is **UNVERIFIED**.) From source: `git clone https://github.com/huggingface/lerobot.git`, `cd lerobot`, `pip install -e ".[core_scripts]"`.
5. **CUDA.** Windows installs use PyPI's default CUDA-Windows torch wheel; the CUDA-variant section is Linux-only and can be skipped.
6. **WSL.** If installing inside WSL, also run `conda install evdev -c conda-forge`.
7. **Logins.** `hf auth login` (token from huggingface.co/settings/tokens) to push datasets; `wandb login` for Weights & Biases (included in `training`).

## Key concepts
*Sources: index (attached); https://huggingface.co/docs/lerobot/en/cheat-sheet.md — fetched 2026-10-22*

- **Workflow:** Teleoperate → Record → Train → Deploy.
- **Teleoperation:** you drive the robot (leader arm, keyboard or phone). In the CLI the driven robot is `--robot.*` (e.g. `so101_follower`) and the controller is `--teleop.*` (e.g. `so101_leader`).
- **LeRobotDataset:** each demonstration is saved as synchronized camera video plus actions/state; datasets live under a Hub `repo_id`.
- **Policy:** the neural network that controls the robot, trained to imitate demonstrations. CLI policy types listed: `act`, `diffusion`, `smolvla`, `pi05`. ACT is the recommended first policy.
- **Calibration & IDs:** usually once per robot and teleop device; later commands find the calibration file by the same `--robot.id` / `--teleop.id`.
- **Extras:** feature extras (`dataset`, `training`, `hardware`, `viz`) and composites (`core_scripts`, `evaluation`, `dataset_viz`).
- **Inference:** `lerobot-rollout` runs a trained policy on the robot (v0.5.1 used `lerobot-record` instead).
- **LeLab:** a browser GUI for calibration, recording and training without the CLI.

## Minimal working example
*Source: https://huggingface.co/docs/lerobot/en/cheat-sheet.md — fetched 2026-10-22*

SO-101 follower + leader, ACT policy. Replace ports, IDs and `${HF_USER}` with your own. The docs show Linux ports (`/dev/ttyACM0`); Windows port names (e.g. `COM3`) are **UNVERIFIED** — use whatever `lerobot-find-port` prints. The commands use bash `\` line continuation and `${HF_USER}`; the PowerShell equivalents are **UNVERIFIED** (put each command on one line to be safe).

```bash
lerobot-find-port          # unplug USB when asked, press Enter; it prints the port

lerobot-calibrate --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --robot.id=my_follower_arm
# Leader-arm calibration flags: UNVERIFIED (not shown on the cheat sheet)

lerobot-record --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --robot.id=my_follower_arm \
  --robot.cameras="{ top: {type: opencv, index_or_path: 1, width: 640, height: 480, fps: 30} }" \
  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 --teleop.id=my_leader_arm \
  --dataset.repo_id=${HF_USER}/so101_dataset_test --dataset.num_episodes=30 \
  --dataset.single_task="put the red brick in a bowl" --display_data=true
#   → = save episode, ← = redo episode, Esc = stop, encode, upload

lerobot-train --dataset.repo_id=${HF_USER}/so101_dataset_test --policy.type=act \
  --output_dir=outputs/train/act_so101_test --job_name=act_so101_test \
  --policy.device=cuda --policy.repo_id=${HF_USER}/policy_test --steps=20000

lerobot-rollout --strategy.type=base --policy.path=${HF_USER}/policy_test \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --robot.cameras="{ top: {type: opencv, index_or_path: 1, width: 640, height: 480, fps: 30} }" \
  --task="put the red brick in a bowl" --duration=60
```
The cheat sheet's own examples use two cameras (top + wrist); one camera here is a simplification. No local GPU: add `--job.target=a10g-small` to `lerobot-train` to run on Hugging Face Jobs.

## Common pitfalls
*Sources: index (attached); installation.md and en/cheat-sheet.md — fetched 2026-10-22*

- **Bad camera footage:** lighting matters more than resolution (Cameras guide).
- **Build errors (cmake, ffmpeg, CUDA):** missing system deps. The docs give an apt command for Linux only; other systems → "Compiling PyAV". Windows-specific fix **UNVERIFIED**.
- **ffmpeg/TorchCodec mismatch:** if `libsvtav1` is missing (`ffmpeg -encoders`) or versions clash, pin `conda install ffmpeg=7.1.1 -c conda-forge`.
- **Base install too thin:** `pip install lerobot` alone lacks most workflow deps; add extras.
- **Mismatched IDs:** use the same `--robot.id`/`--teleop.id` as during calibration, or calibration isn't found. Calibrate with joints roughly mid-range.
- **Copy-pasted values:** change ports/names/IDs to your own. Note the cheat sheet itself uses `/dev/ttyACM0` for the follower when calibrating but `/dev/ttyACM1` when running rollout — trust `lerobot-find-port`.
- **Camera config at inference** must match what was used when recording.
- **Upload fails:** run `hf auth login` before recording.
- **`lerobot-rollout` not found:** you are on v0.5.1; use `lerobot-record` for inference there.
- **Not sure which policy fits your GPU:** see the Compute & Hardware Guide. Still stuck → Discord.

## Links
*Source: index (attached) and the two fetched pages — 2026-10-22*

- Docs home (attached page): https://huggingface.co/docs/lerobot/index — URL inferred from the page; content supplied as an attachment, not fetched by me.
- Installation: https://huggingface.co/docs/lerobot/installation.md (fetched 2026-10-22)
- Cheat sheet: https://huggingface.co/docs/lerobot/en/cheat-sheet.md (fetched 2026-10-22)
- Quickstart notebook: https://github.com/huggingface/lerobot/blob/main/examples/notebooks/quickstart.ipynb
- Source code: https://github.com/huggingface/lerobot
- Hub org (datasets & models): https://huggingface.co/lerobot
- HF tokens: https://huggingface.co/settings/tokens
- Discord: https://discord.gg/s3KuuzsPFb
- Linked from the index but not read (contents **UNVERIFIED**): Compute & Hardware Guide, Cameras, LeLab, ACT, LeRobotDataset v3, EnvHub/simulation, Colab notebooks, Contributing.
