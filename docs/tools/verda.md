# Verda — Quick Reference

All facts below come from docs.verda.com, fetched **2026-10-14**. Anything the pages did not state is marked **UNVERIFIED**.

---

## What it is

*Sources: https://docs.verda.com/ · https://docs.verda.com/storage/ · https://docs.verda.com/cli/ (fetched 2026-10-14)*

Verda is a cloud platform offering GPU compute and related services. The docs hub groups it into:

- **Instances**: dedicated CPU and GPU instances for development, training and hosted workloads.
- **Clusters (Instant Clusters)**: multi-node GPU clusters with Slurm or Kubernetes for distributed training.
- **Serverless Containers**: containerized inference with autoscaling, health checks, logs and batch jobs.
- **Storage**: block volumes, shared filesystems (SFS), S3-compatible Object Storage, and a private Container Registry (`vccr.io`).
- **Automation**: Terraform/OpenTofu provider, the Verda CLI, and integrations (dstack, SkyPilot).
- **Reference**: REST API (https://api.verda.com/v1/docs), Python SDK and Go SDK.

---

## Setup (Windows)

*Sources: https://docs.verda.com/cli/ · https://docs.verda.com/cli/getting-started/ · https://docs.verda.com/welcome-to-verda/api-credentials/ · https://docs.verda.com/cpu-and-gpu-instances/creating-an-ssh-key/ · https://docs.verda.com/cpu-and-gpu-instances/connecting-to-your-verda-server/ (fetched 2026-10-14)*

1. **Create Cloud API credentials.** Console → **Credentials** → *Cloud API credentials* → **+ Create**. Copy the Client ID and Client Secret; the secret is shown only once.
2. **Install the CLI with Scoop** (PowerShell):
   ```powershell
   scoop install git
   scoop bucket add verda https://github.com/verda-cloud/homebrew-tap
   scoop install verda-cli
   verda --version
   ```
   Alternative: download `verda_VERSION_windows_amd64.zip` (or `_arm64`) from https://github.com/verda-cloud/verda-cli/releases. How to unpack and add it to PATH on Windows is **UNVERIFIED** (the docs only show the macOS/Linux `tar`/`mv` steps).
3. **Log in:** `verda auth login`, then check with `verda auth show`. Credentials are saved to `~/.verda/credentials`; where that path lands on Windows is **UNVERIFIED**.
4. **Create an SSH key with PuTTYgen:** choose `Ed25519` → **Generate** → move the cursor over the grey area → add a passphrase → copy the *Public key* field → **save the private key somewhere safe**. Paste the public key into Console → `Keys → SSH Keys → Create` (or on the Deploy Instance page). Using Windows' built-in `ssh-keygen` instead is **UNVERIFIED** (docs show it only for Linux/macOS).
5. **Connect with PuTTY:** enter the instance IP, **Save** the session, add the private key, return to *Session* and **Save again**, then **Open** and log in as `root`.

Shell completion is documented for Bash/Zsh/Fish only; PowerShell completion is **UNVERIFIED**.

---

## Key concepts

*Sources: https://docs.verda.com/cpu-and-gpu-instances/set-up-a-gpu-instance/ · https://docs.verda.com/welcome-to-verda/pricing-and-billing/ · https://docs.verda.com/cli/getting-started/ · https://docs.verda.com/welcome-to-verda/api-credentials/ (fetched 2026-10-14)*

- **Contract types.** *On-demand* = Pay As You Go, billed in prepaid 10-minute increments; the unused part is refunded if you terminate early. *Spot* = cheaper Pay As You Go, but Verda can evict it at any time without warning. *Long-term* = paid fully up front, at a discount.
- **Prepaid balance.** Usage is limited to your available balance, which you top up once, automatically (charges a saved card below a threshold you set), by SEPA transfer, or by invoice (minimum 1,000 EUR/USD).
- **Location.** Usually chosen automatically by the hardware you pick; all storage attached to an instance must be in the same location. Prices differ by location.
- **Images.** Ubuntu or JupyterLab images in various configurations. An optional **startup script** (bash) runs on first deploy.
- **Two credential types.** *Cloud API credentials* (Client ID + Secret) work for the CLI, Terraform/OpenTofu, dstack and SkyPilot. *Inference API Keys* are bearer tokens for container/inference endpoints.
- **CLI credential order:** CLI flags → `~/.verda/config.yaml` → env vars `VERDA_CLIENT_ID`/`VERDA_CLIENT_SECRET` → `~/.verda/credentials`. Profiles are switched with `verda auth use <profile>`.
- **Infrastructure as code.** Provider `verda-cloud/verda` (`~> 1.0`), Terraform ≥ 1.0 or OpenTofu ≥ 1.6.

---

## Minimal working example

*Sources: https://docs.verda.com/cli/ · https://docs.verda.com/cli/getting-started/ (fetched 2026-10-14)*

Deploy one GPU VM from the CLI and SSH into it (run after the setup above):

```powershell
verda locations                         # list datacenter locations
verda instance-types --gpu              # GPU types with pricing
verda availability --location FIN-01    # what is in stock

verda vm create `
  --kind gpu `
  --instance-type 1V100.6V `
  --location FIN-01 `
  --os ubuntu-24.04-cuda-13.0-open-docker `
  --os-volume-size 100 `
  --hostname gpu-runner

verda ssh gpu-runner
verda status                            # running instances, volumes, costs
```

The flags and values are the docs' own example, written there in bash with `\` line breaks. The PowerShell backtick (`` ` ``) continuations are my adaptation (**UNVERIFIED**); you can also put the command on one line. Whether `1V100.6V` in `FIN-01` is in stock today is **UNVERIFIED**, so check `verda availability` first. Running `verda vm create` with no flags starts an interactive wizard instead.

**Clean up:** delete the instance from the console action menu and select its volumes for deletion. The exact CLI delete syntax is **UNVERIFIED**; the CLI overview lists "delete" as supported, but the command form is on the CLI Instances page, which I did not fetch. If something fails, run `verda doctor`.

---

## Common pitfalls

*Sources: https://docs.verda.com/welcome-to-verda/pricing-and-billing/ · https://docs.verda.com/cpu-and-gpu-instances/shutdown-hibernate-and-delete/ · https://docs.verda.com/storage/deleting-storage/ · https://docs.verda.com/cpu-and-gpu-instances/set-up-a-gpu-instance/ · https://docs.verda.com/welcome-to-verda/api-credentials/ · https://docs.verda.com/containers/tutorials/deploy-with-vllm-quick/ (fetched 2026-10-14)*

- **Zero balance deletes data.** Instances are discontinued and volumes deleted; volumes can be restored for up to 96 h. Use auto top-up with a trigger of at least about 12 h of usage. The low-balance warning appears by default at under 48 h of runtime.
- **Shutdown is not free.** Shut-down instances keep charging. Only *Delete* stops instance billing. (Hibernate has been removed.)
- **Delete keeps storage by default.** No volume is selected for deletion unless you tick it, and unselected storage keeps charging.
- **Trash costs and quota.** Deleted storage sits in trash for 96 h. Restoring it costs the Pay As You Go price for the time it was deleted. To free quota you must **Permanently delete** it, which cannot be undone.
- **Hostname is fixed** after deployment.
- **Block volumes must be detached** before attaching to a new instance, and they must be in the same location.
- **Spot instances** can be evicted without warning.
- **Client Secret is shown once.** If you lose it, create a new pair. Credentials are tied to the team member who made them and are deleted if that person leaves the project.
- **PuTTY:** if you don't save the *Session* again after adding the key, the key isn't kept.
- **Containers (vLLM):** pin an explicit stable image tag rather than `latest`/nightly, and check its CUDA needs against Verda's documented driver. Use private or authenticated registries in production to avoid public-registry rate limits.

---

## Links

*Fetched 2026-10-14*

| Page | URL |
|---|---|
| Docs hub | https://docs.verda.com/ |
| Create an instance | https://docs.verda.com/cpu-and-gpu-instances/set-up-a-gpu-instance/ |
| Manage SSH keys | https://docs.verda.com/cpu-and-gpu-instances/creating-an-ssh-key/ |
| Connect to your server | https://docs.verda.com/cpu-and-gpu-instances/connecting-to-your-verda-server/ |
| Shutdown and delete | https://docs.verda.com/cpu-and-gpu-instances/shutdown-hibernate-and-delete/ |
| Storage overview | https://docs.verda.com/storage/ |
| Deleting storage | https://docs.verda.com/storage/deleting-storage/ |
| Pricing and billing | https://docs.verda.com/welcome-to-verda/pricing-and-billing/ |
| API credentials | https://docs.verda.com/welcome-to-verda/api-credentials/ |
| Verda CLI | https://docs.verda.com/cli/ |
| CLI getting started | https://docs.verda.com/cli/getting-started/ |
| Infrastructure as code | https://docs.verda.com/infrastructure-as-code/overview/ |
| Quickstart: vLLM container | https://docs.verda.com/containers/tutorials/deploy-with-vllm-quick/ |
| Verda API reference | https://api.verda.com/v1/docs |
| CLI releases (GitHub) | https://github.com/verda-cloud/verda-cli/releases |
| Console | https://console.verda.com/ |
