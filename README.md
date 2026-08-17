![](界面效果图.png)

# Codex QQ2010 Skin

## 按以下顺序部署

1. 安装 Node.js 22 或更高版本，以及官方 Windows 版 Codex 应用。
2. 将整个文件夹放置到：
   `~\.codex\skills\Codex-QQ2010-Skin`
3. 双击运行 `skin_install.cmd`。当提示时，允许执行一次 Codex 重启。
4. 安装完成后，今后始终通过 `skin_install.cmd` 启动 Codex。

安装程序会启动 Codex、应用皮肤、验证实时注入是否成功，并创建“启动”和“恢复官方界面”两个快捷方式。

不需要每次启动 Codex 时都重新运行安装程序。

## 维护

- Codex 更新后，或者发现皮肤失效时，先关闭 Codex，然后重新运行 `skin_install.cmd`。
- 如果需要恢复官方界面，使用桌面上的 `Codex 2010 Skin - Restore` 快捷方式。
- 如果需要手动验证皮肤状态，运行：
  `scripts\verify-dream-skin.ps1`
- 在复制或迁移该项目时，必须确保以下内容始终放在一起：
  `assets`、`scripts`、`agents`、`SKILL.md`、`skin_install.cmd`、`skin_install.ps1`、`LICENSE` 和 `NOTICE.md`。

## 安全限制

- 绝对不要修改 `WindowsApps`、`app.asar`、官方数字签名、账号、任务或聊天数据。
- 只能使用这些脚本所创建的本机回环 CDP 端点。
- 必须保留 Codex 原生的文件、图片、语音听写、权限访问、模型选择、发送、停止和继续等操作功能。
- 运行时状态必须保存在：
  `%LOCALAPPDATA%\CodexDreamSkin`
  
  以保证与已有安装版本兼容。
