---
name: codex-qq2010-skin
description: Apply, launch, update, repair, verify, migrate, or restore the full QQ 2010-style skin for the Windows Codex desktop app. Use when the user asks to install or maintain the Codex QQ2010 interface, reapply it after a Codex update, move it to another PC, or safely return to the official interface without modifying WindowsApps or app.asar.
---

# Codex QQ2010 Skin

Apply the QQ2010 renderer skin to the official Microsoft Store Codex app through a local CDP session. Keep all native Codex controls functional.

## Deploy in order

1. Install Node.js 22 or newer and the official Codex Windows app.
2. Put this complete folder at `%USERPROFILE%\.codex\skills\Codex-QQ2010-Skin`.
3. Double-click `skin_install.cmd`. Approve the one-time Codex restart when prompted.
4. After installation, always open Codex with the desktop shortcut `Codex 2010 Skin`.

The installer launches Codex, applies the skin, verifies the live injection, and creates both launch and restore shortcuts. Do not run it on every startup.

## Maintain

- After a Codex update or when the skin is missing, close Codex and run `skin_install.cmd` again.
- To restore the official interface, use `Codex 2010 Skin - Restore` on the desktop.
- To verify manually, run `scripts\verify-dream-skin.ps1`.
- Keep `assets`, `scripts`, `agents`, `SKILL.md`, `skin_install.cmd`, `skin_install.ps1`, `LICENSE`, and `NOTICE.md` together when copying the project.

## Guardrails

- Never modify `WindowsApps`, `app.asar`, the official signature, accounts, tasks, or chat data.
- Use only the loopback CDP endpoint created by these scripts.
- Preserve native file, image, dictation, access-permission, model, send, stop, and continue actions.
- Keep runtime state under `%LOCALAPPDATA%\CodexDreamSkin` for compatibility with existing installations.
![](界面效果图.png)
