((cssText, artDataUrl, qqIconsDataUrl, qqProfileAvatarDataUrl, qqProfileVipDataUrl, qqProfileCrownDataUrl) => {
  const STATE_KEY = "__CODEX_DREAM_SKIN_STATE__";
  const STYLE_ID = "codex-dream-skin-style";
  const CHROME_ID = "codex-dream-skin-chrome";
  const MODEL_POPOVER_PROPERTIES = ["position", "z-index", "left", "top", "right", "bottom", "transform", "width", "min-width", "max-width"];
  window.__CODEX_DREAM_SKIN_DISABLED__ = false;

  const restoreModelPopoverPositions = (scope = document) => {
    scope.querySelectorAll?.(".qq-model-popover-above, .qq-model-submenu-right").forEach((node) => {
      node.__qqModelSubmenuObserver?.disconnect();
      if (node.__qqModelSubmenuHandler) {
        node.removeEventListener("pointerover", node.__qqModelSubmenuHandler, true);
        node.removeEventListener("click", node.__qqModelSubmenuHandler, true);
      }
      const original = node.__qqModelPopoverPosition;
      for (const property of MODEL_POPOVER_PROPERTIES) {
        const saved = original?.[property];
        if (saved?.value) node.style.setProperty(property, saved.value, saved.priority || "");
        else node.style.removeProperty(property);
      }
      node.classList.remove("qq-model-popover-above", "qq-model-submenu-right", "qq-model-list-submenu");
      delete node.__qqModelPopoverPosition;
      delete node.__qqModelSubmenuObserver;
      delete node.__qqModelSubmenuHandler;
      delete node.__qqModelSubmenuBaseline;
    });
  };

  const hideNativeToolbarTooltips = () => {
    for (const tooltip of document.querySelectorAll("[role='tooltip']")) {
      const text = (tooltip.textContent || "").replace(/\s+/g, " ").trim();
      if (!/^(更改权限|访问权限|选择模型|模型)(?:\s|$)/.test(text)) continue;
      (tooltip.closest("[data-radix-popper-content-wrapper]") || tooltip).classList.add("qq-hidden-native-toolbar-tooltip");
    }
  };

  const restoreNativeTools = (scope = document) => {
    scope.querySelectorAll?.("[data-qq-native-tool], [data-qq-native-proxy]").forEach((node) => {
      node.__qqModelPopoverObserver?.disconnect();
      if (node.__qqModelPopoverArm) {
        node.removeEventListener("pointerdown", node.__qqModelPopoverArm, true);
        node.removeEventListener("click", node.__qqModelPopoverArm, true);
      }
      delete node.__qqModelPopoverObserver;
      delete node.__qqModelPopoverArm;
      delete node.__qqPositionModelPopover;
      delete node.__qqModelPopoverPending;
      delete node.__qqModelPopoverExisting;
      if (node.__qqTooltipBlocker) {
        for (const type of ["pointerover", "pointermove", "pointerenter", "mouseover", "mousemove", "mouseenter", "focus", "focusin"]) {
          node.removeEventListener(type, node.__qqTooltipBlocker, true);
        }
      }
      if (node.__qqHadOriginalTitle !== undefined) {
        if (node.__qqHadOriginalTitle) node.setAttribute("title", node.__qqOriginalTitle);
        else node.removeAttribute("title");
      }
      if (node.__qqHadOriginalAriaLabel !== undefined) {
        if (node.__qqHadOriginalAriaLabel) node.setAttribute("aria-label", node.__qqOriginalAriaLabel);
        else node.removeAttribute("aria-label");
      }
      const parent = node.__qqOriginalParent;
      const next = node.__qqOriginalNext;
      if (parent?.isConnected) parent.insertBefore(node, next?.parentNode === parent ? next : null);
      node.classList.remove("qq-tool", "qq-tool-access", "qq-tool-model", "qq-native-tool", "qq-proxied-control", "qq-proxied-action", "qq-proxy-interactive");
      delete node.dataset.qqNativeTool;
      delete node.dataset.qqNativeProxy;
      for (const property of ["--qq-proxy-left", "--qq-proxy-top", "--qq-proxy-width", "--qq-proxy-height"]) {
        node.style.removeProperty(property);
      }
      delete node.__qqOriginalParent;
      delete node.__qqOriginalNext;
      delete node.__qqTooltipBlocker;
      delete node.__qqHadOriginalTitle;
      delete node.__qqOriginalTitle;
      delete node.__qqHadOriginalAriaLabel;
      delete node.__qqOriginalAriaLabel;
    });
  };

  const restoreTaskHeaderActions = (scope = document) => {
    scope.querySelectorAll?.(".qq-task-header-actions").forEach((node) => {
      const parent = node.__qqTaskActionsOriginalParent;
      const next = node.__qqTaskActionsOriginalNext;
      if (parent?.isConnected) parent.insertBefore(node, next?.parentNode === parent ? next : null);
      node.classList.remove("qq-task-header-actions");
      delete node.__qqTaskActionsOriginalParent;
      delete node.__qqTaskActionsOriginalNext;
    });
  };

  const cutOutConnectedLightBackground = (image) => {
    if (!image || image.dataset.qqCutout) return;
    image.dataset.qqCutout = "processing";
    const apply = () => {
      try {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        if (!width || !height) return;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, width, height);
        const data = pixels.data;
        const visited = new Uint8Array(width * height);
        const stack = [];
        const isLightNeutral = (index) => {
          const offset = index * 4;
          const red = data[offset];
          const green = data[offset + 1];
          const blue = data[offset + 2];
          return Math.min(red, green, blue) >= 218 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 16;
        };
        const queue = (x, y) => {
          const index = y * width + x;
          if (!visited[index] && isLightNeutral(index)) {
            visited[index] = 1;
            stack.push(index);
          }
        };
        for (let x = 0; x < width; x += 1) {
          queue(x, 0);
          queue(x, height - 1);
        }
        for (let y = 0; y < height; y += 1) {
          queue(0, y);
          queue(width - 1, y);
        }
        while (stack.length) {
          const index = stack.pop();
          data[index * 4 + 3] = 0;
          const x = index % width;
          const y = Math.floor(index / width);
          if (x > 0) queue(x - 1, y);
          if (x + 1 < width) queue(x + 1, y);
          if (y > 0) queue(x, y - 1);
          if (y + 1 < height) queue(x, y + 1);
        }
        context.putImageData(pixels, 0, 0);
        image.dataset.qqCutout = "ready";
        image.src = canvas.toDataURL("image/png");
      } catch {
        image.dataset.qqCutout = "failed";
      }
    };
    if (image.complete) apply();
    else image.addEventListener("load", apply, { once: true });
  };

  const previous = window[STATE_KEY];
  if (previous?.observer) previous.observer.disconnect();
  if (previous?.timer) clearInterval(previous.timer);
  if (previous?.scheduler?.timeout) clearTimeout(previous.scheduler.timeout);
  restoreModelPopoverPositions();
  restoreNativeTools();
  document.querySelectorAll(".qq-composer-toolbar, .qq-message-history, .qq-history-panel, .qq-send-group, .qq-send-menu-popover, .qq-task-profile").forEach((node) => {
    node.__qqCleanup?.();
    node.remove();
  });
  const objectUrlFromDataUrl = (dataUrl, mimeType) => {
    const comma = dataUrl.indexOf(",");
    const binary = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  };
  const artUrl = previous?.artUrl || objectUrlFromDataUrl(artDataUrl, "image/png");
  if (previous?.qqIconsUrl) URL.revokeObjectURL(previous.qqIconsUrl);
  const qqIconsUrl = objectUrlFromDataUrl(qqIconsDataUrl, "image/png");
  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    existingStyle.textContent = cssText;
    existingStyle.dataset.dreamVersion = "5";
  }

  const clearSkinDom = () => {
    document.documentElement?.classList.remove("codex-dream-skin");
    document.documentElement?.style.removeProperty("--dream-art");
    document.documentElement?.style.removeProperty("--qq-icons-art");
    document.querySelectorAll(".dream-home, .qq-new-conversation").forEach((node) => {
      node.classList.remove("dream-home", "qq-new-conversation");
    });
    document.querySelectorAll(".dream-home-shell, .qq-new-conversation-shell").forEach((node) => {
      node.classList.remove("dream-home-shell", "qq-new-conversation-shell");
    });
    document.querySelectorAll(".qq-message-meta").forEach((node) => node.remove());
    restoreModelPopoverPositions();
    restoreNativeTools();
    restoreTaskHeaderActions();
    document.querySelectorAll(".qq-composer-toolbar, .qq-message-history, .qq-history-panel, .qq-send-group, .qq-send-menu-popover, .qq-task-profile").forEach((node) => {
      node.__qqCleanup?.();
      node.remove();
    });
    document.querySelectorAll(".qq-history-match").forEach((node) => node.classList.remove("qq-history-match"));
    document.querySelectorAll(".qq-hidden-native-toolbar-tooltip").forEach((node) => node.classList.remove("qq-hidden-native-toolbar-tooltip"));
    document.querySelectorAll(".qq-dictation-native-add").forEach((node) => node.classList.remove("qq-dictation-native-add"));
    document.querySelectorAll(".qq-proxied-control, .qq-proxied-action, .qq-proxy-interactive").forEach((node) => {
      node.classList.remove("qq-proxied-control", "qq-proxied-action", "qq-proxy-interactive");
      for (const property of ["--qq-proxy-left", "--qq-proxy-top", "--qq-proxy-width", "--qq-proxy-height"]) {
        node.style.removeProperty(property);
      }
    });
    document.querySelectorAll(".qq-user-record, .qq-assistant-record").forEach((node) => {
      node.classList.remove("qq-user-record", "qq-assistant-record");
    });
    document.querySelectorAll(".qq-task-native-title").forEach((node) => node.classList.remove("qq-task-native-title"));
    document.querySelectorAll("[data-qq-original-codex-name]").forEach((node) => {
      node.textContent = node.dataset.qqOriginalCodexName;
      delete node.dataset.qqOriginalCodexName;
    });
    document.querySelectorAll("[data-qq-original-codex-label]").forEach((node) => {
      node.setAttribute("aria-label", node.dataset.qqOriginalCodexLabel);
      delete node.dataset.qqOriginalCodexLabel;
    });
    document.querySelectorAll(".dream-skin-main-compat").forEach((node) => {
      node.classList.remove("dream-skin-main-compat", "main-surface");
    });
    document.querySelectorAll(".dream-skin-composer-compat").forEach((node) => {
      node.classList.remove("dream-skin-composer-compat", "composer-surface-chrome");
    });
    document.querySelectorAll(".dream-skin-header-compat").forEach((node) => {
      node.classList.remove("dream-skin-header-compat", "app-header-tint");
    });
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CHROME_ID)?.remove();
  };

  const ensure = () => {
    if (window.__CODEX_DREAM_SKIN_DISABLED__) return;
    const root = document.documentElement;
    if (!root || !document.body) return;

    const legacyShellMain = document.querySelector("main.main-surface");
    const shellMain = legacyShellMain || document.querySelector("main[class*='_MainContentSurface_']");
    const shellSidebar = document.querySelector("aside.app-shell-left-panel");
    if (!shellMain || !shellSidebar) {
      clearSkinDom();
      return;
    }

    root.classList.add("codex-dream-skin");
    root.style.setProperty("--dream-art", `url("${artUrl}")`);
    root.style.setProperty("--qq-icons-art", `url("${qqIconsUrl}")`);
    for (const button of document.querySelectorAll("button[aria-label^='切换模式，当前模式：']")) {
      const nameNode = [...button.querySelectorAll("span")].find((node) =>
        node.dataset.qqOriginalCodexName || (node.textContent || "").trim() === "Codex"
      );
      if (!nameNode) continue;
      if (!nameNode.dataset.qqOriginalCodexName) nameNode.dataset.qqOriginalCodexName = "Codex";
      nameNode.textContent = "从訫乄嗳你";
      if (!button.dataset.qqOriginalCodexLabel) button.dataset.qqOriginalCodexLabel = button.getAttribute("aria-label") || "";
      button.setAttribute("aria-label", "切换模式，当前模式：从訫乄嗳你");
    }

    if (!legacyShellMain) {
      shellMain.classList.add("main-surface", "dream-skin-main-compat");
    }
    const legacyComposer = document.querySelector(".composer-surface-chrome");
    const composer = legacyComposer || document.querySelector("[class*='_ComposerLayoutRoot_']");
    if (composer && !legacyComposer) {
      composer.classList.add("composer-surface-chrome", "dream-skin-composer-compat");
    }
    const legacyTitlebar = document.querySelector("header.app-header-tint");
    const titlebar = legacyTitlebar || document.querySelector("header.fixed.h-toolbar, header[class*='h-toolbar'][class*='fixed']");
    if (titlebar && !legacyTitlebar) {
      titlebar.classList.add("app-header-tint", "dream-skin-header-compat");
    }

    const headerSurface = titlebar?.querySelector("[data-testid='app-shell-header-context-menu-surface']");
    const headerGrid = headerSurface?.querySelector(":scope > div > .grid") || headerSurface?.querySelector(".grid");
    const headerCell = headerGrid?.firstElementChild;
    let nativeTaskTitle = headerCell?.querySelector(":scope > .qq-task-native-title");
    if (!nativeTaskTitle && headerCell) {
      nativeTaskTitle = [...headerCell.children].find((node) => {
        const button = node.querySelector?.("button");
        return button && button.getAttribute("aria-label") !== "聊天操作";
      });
      nativeTaskTitle?.classList.add("qq-task-native-title");
    }
    if (headerCell) {
      let profile = headerCell.querySelector(":scope > .qq-task-profile");
      if (!profile) {
        profile = document.createElement("div");
        profile.className = "qq-task-profile";
        profile.setAttribute("role", "group");
        profile.setAttribute("aria-label", "QQ联系人：从訫乄嗳你，QQ号2447654662，签名〆連嶶笑嘟奢侈ゝ");
        profile.innerHTML = `
          <img class="qq-task-avatar" src="${qqProfileAvatarDataUrl}" alt="">
          <span class="qq-task-profile-lines">
            <span class="qq-task-profile-primary">
              <img class="qq-task-vip" src="${qqProfileVipDataUrl}" alt="VIP">
              <span class="qq-task-name">从訫乄嗳你</span>
              <span class="qq-task-number">(2447654662)</span>
            </span>
            <span class="qq-task-profile-signature">
              <img class="qq-task-crown" src="${qqProfileCrownDataUrl}" alt="">
              <span>〆連嶶笑嘟奢侈ゝ</span>
            </span>
          </span>`;
        headerCell.insertBefore(profile, nativeTaskTitle || headerCell.firstChild);
        cutOutConnectedLightBackground(profile.querySelector(".qq-task-vip"));
        cutOutConnectedLightBackground(profile.querySelector(".qq-task-crown"));
      }
    }
    const taskHeaderActions = document.querySelector(".qq-task-header-actions") ||
      [...(headerCell?.children || [])].find((node) => node.querySelector?.("button[aria-label='聊天操作']"));
    const rightHeaderActions = headerSurface?.querySelector(":scope > .ms-auto");
    if (taskHeaderActions && rightHeaderActions && taskHeaderActions.parentElement !== rightHeaderActions) {
      if (!taskHeaderActions.__qqTaskActionsOriginalParent) {
        taskHeaderActions.__qqTaskActionsOriginalParent = taskHeaderActions.parentNode;
        taskHeaderActions.__qqTaskActionsOriginalNext = taskHeaderActions.nextSibling;
      }
      taskHeaderActions.classList.add("qq-task-header-actions");
      rightHeaderActions.insertBefore(taskHeaderActions, rightHeaderActions.firstChild);
    }

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || root).appendChild(style);
    }
    if (style.dataset.dreamVersion !== "5") {
      style.textContent = cssText;
      style.dataset.dreamVersion = "5";
    }

    const timeFromUuidV7 = (value) => {
      const match = String(value || "").match(/([0-9a-f]{8})-([0-9a-f]{4})-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (!match) return null;
      const millis = Number.parseInt(`${match[1]}${match[2]}`, 16);
      const date = new Date(millis);
      if (!Number.isFinite(date.getTime())) return null;
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    };
    const messageTime = (node) => {
      const turn = node.closest?.("[data-turn-key]");
      const uuidTime = timeFromUuidV7(node.getAttribute?.("data-content-search-unit-key")) ||
        timeFromUuidV7(turn?.getAttribute("data-turn-key"));
      if (uuidTime) return uuidTime;
      const nativeTime = node.querySelector?.("[data-assistant-message-sent-time]")?.textContent?.trim();
      if (nativeTime) return /^\d{1,2}:\d{2}$/.test(nativeTime) ? `${nativeTime}:00` : nativeTime;
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    };
    const resolveAccountName = () => {
      const profileButton = document.querySelector([
        "aside.app-shell-left-panel button[aria-label='打开个人资料菜单']",
        "aside.app-shell-left-panel [role='button'][aria-label='打开个人资料菜单']",
        "aside.app-shell-left-panel button[aria-label*='个人资料菜单']",
      ].join(","));
      const value = (profileButton?.innerText || profileButton?.textContent || "").replace(/\\s+/g, " ").trim();
      return value || "我";
    };
    const addMessageMeta = (container, body, kind, name) => {
      if (!container || !body) return;
      let meta = container.querySelector(".qq-message-meta");
      if (!meta) {
        meta = document.createElement("div");
        meta.className = `qq-message-meta qq-message-meta-${kind}`;
        meta.setAttribute("aria-hidden", "true");
        meta.innerHTML = `<span class="qq-message-name"></span><span class="qq-message-time"></span>`;
        let branch = body;
        while (branch.parentElement && branch.parentElement !== container) branch = branch.parentElement;
        if (branch.parentElement !== container) return;
        container.insertBefore(meta, branch);
      }
      const className = `qq-message-meta qq-message-meta-${kind}`;
      if (meta.className !== className) meta.className = className;
      const nameNode = meta.querySelector(".qq-message-name");
      if (nameNode?.textContent !== name) nameNode.textContent = name;
      const timeNode = meta.querySelector(".qq-message-time");
      if (timeNode && !timeNode.dataset.qqTimeInitialized) {
        timeNode.textContent = messageTime(container);
        timeNode.dataset.qqTimeInitialized = "true";
      }
      container.classList.add(kind === "user" ? "qq-user-record" : "qq-assistant-record");
    };
    for (const anchor of document.querySelectorAll("[data-local-conversation-user-anchor]")) {
      addMessageMeta(anchor, anchor.querySelector("[data-user-message-bubble]"), "user", resolveAccountName());
    }
    for (const answer of document.querySelectorAll("[data-local-conversation-final-assistant]")) {
      addMessageMeta(answer, answer.firstElementChild, "assistant", "从訫乄嗳你");
    }

    const closeHistoryPanel = () => {
      const panel = document.querySelector(".qq-history-panel");
      panel?.__qqCleanup?.();
      panel?.remove();
    };
    const historyEntries = (position = 0) => {
      const recordText = (node) => {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const parts = [];
        while (walker.nextNode()) {
          const textNode = walker.currentNode;
          if (!textNode.parentElement?.closest(".qq-message-meta, button, script, style")) parts.push(textNode.data);
        }
        return parts.join(" ").replace(/\s+/g, " ").trim();
      };
      const records = [
        ...[...document.querySelectorAll("[data-local-conversation-user-anchor]")].map((node) => ({
          node, name: resolveAccountName(), role: "user",
        })),
        ...[...document.querySelectorAll("[data-local-conversation-final-assistant]")].map((node) => ({
          node, name: "从訫乄嗳你", role: "assistant",
        })),
      ];
      return records
        .filter(({ node }) => node)
        .map(({ node, name, role }) => {
          const turn = node.closest?.("[data-turn-key]");
          const unitKey = node.getAttribute?.("data-content-search-unit-key") ||
            node.querySelector?.("[data-content-search-unit-key]")?.getAttribute("data-content-search-unit-key");
          const turnKey = turn?.getAttribute("data-turn-key") || node.getAttribute?.("data-turn-key");
          return {
            node,
            name,
            role,
            key: unitKey || turnKey || "",
            position,
            time: node.querySelector(".qq-message-time")?.textContent?.trim() || messageTime(node),
            text: recordText(node),
          };
        })
        .filter(({ text }) => text);
    };
    const conversationHistoryEntries = () => {
      const scroller = document.querySelector(".thread-scroll-container");
      const fiberProperty = scroller && Object.getOwnPropertyNames(scroller).find((name) => name.startsWith("__reactFiber$"));
      let fiber = fiberProperty ? scroller[fiberProperty] : null;
      let manager = null;
      const candidateIds = [];
      for (let depth = 0; fiber && depth < 80 && !manager; depth += 1, fiber = fiber.return) {
        let hook = fiber.memoizedState;
        for (let hookIndex = 0; hook && hookIndex < 240; hookIndex += 1, hook = hook.next) {
          const value = hook.memoizedState;
          if (typeof value === "string") candidateIds.push(value);
          if (value?.manager?.conversations instanceof Map) manager = value.manager;
          else if (value?.conversations instanceof Map && value?.requestClient) manager = value;
        }
      }
      if (!manager?.conversations?.size) return [];
      const currentId = candidateIds.find((value) => manager.conversations.has(value));
      const conversations = [...manager.conversations.values()];
      const normalizeTitle = (value) => String(value || "").replace(/\s+/g, " ").trim();
      const viewedTitle = normalizeTitle(document.querySelector(".qq-task-native-title")?.textContent);
      const conversation = (viewedTitle && conversations.find((value) => normalizeTitle(value?.title) === viewedTitle)) ||
        manager.conversations.get(currentId) || null;
      if (!conversation) return [];
      const entities = conversation?.turnHistory?.history?.entitiesByKey;
      const values = entities instanceof Map ? [...entities.values()] : Object.values(entities || {});
      const turns = new Map();
      for (const entity of values) {
        const turn = entity?.turn || entity;
        const turnId = turn?.turnId || entity?.turnId || entity?.id;
        if (!turnId || (!turn?.params && !turn?.items)) continue;
        const previous = turns.get(turnId);
        const itemCount = Array.isArray(turn.items) ? turn.items.length : 0;
        if (!previous || itemCount >= (Array.isArray(previous.items) ? previous.items.length : 0)) turns.set(turnId, turn);
      }
      const formatTime = (value) => {
        const date = new Date(Number(value));
        return Number.isFinite(date.getTime())
          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      };
      const textFromInput = (input) => (Array.isArray(input) ? input : [])
        .map((item) => typeof item === "string" ? item : item?.text || item?.content || item?.name || "")
        .join(" ").replace(/\s+/g, " ").trim();
      const entries = [];
      for (const turn of [...turns.values()].sort((left, right) => Number(left.turnStartedAtMs || 0) - Number(right.turnStartedAtMs || 0))) {
        const turnId = turn.turnId || "";
        const userText = textFromInput(turn.params?.input);
        if (userText) entries.push({
          name: resolveAccountName(), role: "user", key: turnId, position: null,
          time: formatTime(turn.turnStartedAtMs), text: userText,
        });
        const agentMessages = (Array.isArray(turn.items) ? turn.items : [])
          .filter((item) => item?.type === "agentMessage" && typeof item.text === "string" && item.text.trim());
        const finalMessages = agentMessages.filter((item) => item.phase === "final_answer");
        const assistantText = (finalMessages.length ? finalMessages : agentMessages)
          .map((item) => item.text.trim()).join(" ").replace(/\s+/g, " ").trim();
        if (assistantText) entries.push({
          name: "从訫乄嗳你", role: "assistant", key: turnId, position: null,
          time: formatTime(turn.finalAssistantStartedAtMs || turn.turnStartedAtMs), text: assistantText,
        });
      }
      return entries;
    };
    const scanAllHistoryEntries = async () => {
      const canonicalEntries = conversationHistoryEntries();
      const entries = canonicalEntries.length ? canonicalEntries : historyEntries();
      return entries.map((entry, ordinal) => ({ ...entry, ordinal, total: entries.length }));
    };
    const appendHighlightedText = (container, text, query) => {
      if (!query) {
        container.textContent = text;
        return;
      }
      const lowerText = text.toLocaleLowerCase();
      const lowerQuery = query.toLocaleLowerCase();
      let cursor = 0;
      while (cursor < text.length) {
        const index = lowerText.indexOf(lowerQuery, cursor);
        if (index < 0) {
          container.append(document.createTextNode(text.slice(cursor)));
          break;
        }
        if (index > cursor) container.append(document.createTextNode(text.slice(cursor, index)));
        const mark = document.createElement("mark");
        mark.className = "qq-history-keyword";
        mark.textContent = text.slice(index, index + query.length);
        container.append(mark);
        cursor = index + query.length;
      }
    };
    const highlightKeywordsInMessage = (node, query) => {
      if (!node || !query) return;
      const lowerQuery = query.toLocaleLowerCase();
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (!textNode.parentElement?.closest(".qq-message-meta, button, script, style") &&
            textNode.data.toLocaleLowerCase().includes(lowerQuery)) textNodes.push(textNode);
      }
      const marks = [];
      for (const textNode of textNodes) {
        const fragment = document.createDocumentFragment();
        appendHighlightedText(fragment, textNode.data, query);
        marks.push(...fragment.querySelectorAll?.(".qq-history-keyword") || []);
        textNode.replaceWith(fragment);
      }
      setTimeout(() => {
        for (const mark of node.querySelectorAll(".qq-history-keyword")) mark.replaceWith(document.createTextNode(mark.textContent || ""));
        node.normalize();
      }, 3200);
    };
    const locateHistoryEntry = async (entry, query) => {
      const scroller = document.querySelector(".thread-scroll-container");
      if (scroller && Number.isFinite(entry.position)) {
        scroller.scrollTop = entry.position;
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
      const selector = entry.role === "user"
        ? "[data-local-conversation-user-anchor]"
        : "[data-local-conversation-final-assistant]";
      const keyForNode = (node) => {
        const turn = node.closest?.("[data-turn-key]");
        const key = node.getAttribute?.("data-content-search-unit-key") ||
          node.querySelector?.("[data-content-search-unit-key]")?.getAttribute("data-content-search-unit-key") ||
          turn?.getAttribute("data-turn-key") || node.getAttribute?.("data-turn-key") || "";
        const turnKey = turn?.getAttribute("data-turn-key") || node.getAttribute?.("data-turn-key") || "";
        return { key, turnKey };
      };
      const findTarget = () => {
        const candidates = [...document.querySelectorAll(selector)];
        return candidates.find((node) => {
          const { key, turnKey } = keyForNode(node);
          return entry.key && (key === entry.key || turnKey === entry.key || turnKey.endsWith(entry.key));
        }) || candidates.find((node) => (node.textContent || "").replace(/\s+/g, " ").includes(entry.text.slice(0, 60)));
      };
      let target = findTarget();

      /* The thread virtualizes old turns: canonical history can contain a
         message whose DOM node is not mounted yet. Move the reverse scroller
         near the entry's chronological position, then refine against the
         UUIDv7 range of the turns that become mounted. */
      if (!target && scroller && Number.isFinite(entry.ordinal) && entry.total > 1) {
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/ig;
        const lastUuid = (value) => [...String(value || "").matchAll(uuidPattern)].at(-1)?.[0]?.toLowerCase() || "";
        const targetUuid = lastUuid(entry.key);
        let newestBound = 0;
        let oldestBound = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const distanceFromNewest = (entry.total - 1 - entry.ordinal) / (entry.total - 1);
        let magnitude = oldestBound * Math.max(0, Math.min(1, distanceFromNewest));

        for (let attempt = 0; attempt < 14 && !target; attempt += 1) {
          scroller.scrollTop = -magnitude;
          await new Promise((resolve) => setTimeout(resolve, attempt ? 180 : 260));
          target = findTarget();
          if (target) break;

          const currentMagnitude = Math.abs(scroller.scrollTop);
          const currentOldest = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
          oldestBound = Math.max(oldestBound, currentOldest);
          const renderedUuids = [...document.querySelectorAll(selector)]
            .map((node) => {
              const { key, turnKey } = keyForNode(node);
              return lastUuid(turnKey || key);
            })
            .filter(Boolean)
            .sort();

          if (targetUuid && renderedUuids.length) {
            const oldestRendered = renderedUuids[0];
            const newestRendered = renderedUuids.at(-1);
            if (targetUuid < oldestRendered) newestBound = Math.max(newestBound, currentMagnitude);
            else if (targetUuid > newestRendered) oldestBound = Math.min(oldestBound, currentMagnitude);
            else {
              /* The desired turn falls inside the mounted time range; allow
                 one neighbouring viewport for variable-height message cards. */
              magnitude = Math.min(currentOldest, currentMagnitude + scroller.clientHeight * (attempt % 2 ? -1 : 1));
              magnitude = Math.max(0, magnitude);
              continue;
            }
            magnitude = (newestBound + oldestBound) / 2;
          } else {
            const direction = attempt % 2 ? -1 : 1;
            magnitude = Math.max(0, Math.min(currentOldest,
              magnitude + direction * scroller.clientHeight * Math.ceil((attempt + 1) / 2)));
          }
        }
      }
      if (!target) return;
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      target.classList.add("qq-history-match");
      highlightKeywordsInMessage(target, query);
      setTimeout(() => target.classList.remove("qq-history-match"), 3200);
    };
    const openHistoryPanel = (anchor) => {
      if (document.querySelector(".qq-history-panel")) {
        closeHistoryPanel();
        return;
      }
      const panel = document.createElement("section");
      panel.className = "qq-history-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "查找消息记录");
      panel.innerHTML = `
        <div class="qq-history-panel-title"><span class="qq-history-icon" aria-hidden="true"></span><b>消息记录</b><button type="button" class="qq-history-close" aria-label="关闭消息记录">×</button></div>
        <label class="qq-history-search"><span aria-hidden="true"></span><input type="search" placeholder="在当前任务中查找消息" aria-label="查找消息记录"></label>
        <div class="qq-history-count" aria-live="polite"></div>
        <div class="qq-history-results"></div>`;
      document.body.appendChild(panel);
      const anchorBox = anchor.getBoundingClientRect();
      const width = Math.min(380, window.innerWidth - 24);
      panel.style.width = `${width}px`;
      panel.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, anchorBox.right - width))}px`;
      panel.style.bottom = `${Math.max(12, window.innerHeight - anchorBox.top + 7)}px`;
      const input = panel.querySelector("input");
      const count = panel.querySelector(".qq-history-count");
      const results = panel.querySelector(".qq-history-results");
      let all = [];
      const render = () => {
        const rawQuery = input.value.trim();
        const query = rawQuery.toLocaleLowerCase();
        const matches = (query ? all.filter(({ text }) => text.toLocaleLowerCase().includes(query)) : all).toReversed();
        count.textContent = query ? `全部 ${all.length} 条 · 找到 ${matches.length} 条` : `此次聊天共 ${all.length} 条`;
        results.replaceChildren();
        if (!matches.length) {
          const empty = document.createElement("div");
          empty.className = "qq-history-empty";
          empty.textContent = "没有找到对应消息";
          results.appendChild(empty);
          return;
        }
        for (const entry of matches) {
          const result = document.createElement("button");
          result.type = "button";
          result.className = "qq-history-result";
          const meta = document.createElement("span");
          meta.className = "qq-history-result-meta";
          meta.textContent = `${entry.name}  ${entry.time}`;
          const excerpt = document.createElement("span");
          excerpt.className = "qq-history-result-text";
          const excerptText = entry.text.length > 150 ? `${entry.text.slice(0, 150)}…` : entry.text;
          appendHighlightedText(excerpt, excerptText, rawQuery);
          result.append(meta, excerpt);
          result.addEventListener("click", async () => {
            closeHistoryPanel();
            await locateHistoryEntry(entry, rawQuery);
          });
          results.appendChild(result);
        }
      };
      const controller = new AbortController();
      panel.__qqCleanup = () => controller.abort();
      input.disabled = true;
      count.textContent = "正在读取此次聊天的全部记录…";
      input.addEventListener("input", render, { signal: controller.signal });
      panel.querySelector(".qq-history-close").addEventListener("click", closeHistoryPanel, { signal: controller.signal });
      document.addEventListener("pointerdown", (event) => {
        if (!panel.contains(event.target) && !anchor.contains(event.target)) closeHistoryPanel();
      }, { capture: true, signal: controller.signal });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeHistoryPanel();
      }, { signal: controller.signal });
      (async () => {
        all = await scanAllHistoryEntries();
        if (!panel.isConnected) return;
        input.disabled = false;
        render();
        input.focus();
      })();
    };

    const composerFooter = composer?.querySelector("[class*='_ComposerLayoutFooter_']");
    if (composer && composerFooter) {
      const modelSources = [...composer.querySelectorAll("button")].filter((node) =>
        !node.classList.contains("qq-tool") &&
        !node.getAttribute("aria-label") &&
        node.querySelector("[class*='_ComposerDropdownLabel_']")
      );
      const sources = {
        file: composer.querySelector("button[data-composer-navigation-target='add-context'], button[aria-label^='添加文件']"),
        image: composer.querySelector("button[data-composer-navigation-target='add-context'], button[aria-label^='添加文件']"),
        voice: composer.querySelector("button[aria-label='听写'], button[aria-label='重试听写']"),
        access: composer.querySelector("button[data-composer-navigation-target='permissions'], button[aria-label='更改权限']"),
        model: composer.querySelector("button[data-codex-intelligence-trigger='true'], button[data-composer-navigation-target='reasoning']") || modelSources.at(-1),
      };
      [...new Set([sources.file, sources.voice])].forEach((node) => node?.classList.add("qq-proxied-control"));
      const placeSourceAt = (source, tool) => {
        if (!source || !tool) return;
        const box = tool.getBoundingClientRect();
        source.style.setProperty("--qq-proxy-width", `${box.width}px`);
        source.style.setProperty("--qq-proxy-height", `${box.height}px`);
        source.style.setProperty("--qq-proxy-left", "0px");
        source.style.setProperty("--qq-proxy-top", "0px");
        const origin = source.getBoundingClientRect();
        source.style.setProperty("--qq-proxy-left", `${box.left - origin.left}px`);
        source.style.setProperty("--qq-proxy-top", `${box.top - origin.top}px`);
      };
      const activateNativeSource = (source, pointerDownOnly = false) => {
        if (!source) return;
        const pointer = { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 1, pointerId: 9876, pointerType: "mouse", isPrimary: true };
        source.dispatchEvent(new PointerEvent("pointerdown", pointer));
        if (pointerDownOnly) return;
        source.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 1 }));
        source.dispatchEvent(new PointerEvent("pointerup", { ...pointer, buttons: 0 }));
        source.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 0 }));
        source.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 0 }));
      };
      let toolbar = composer.querySelector(".qq-composer-toolbar");
      if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.className = "qq-composer-toolbar";
        const toolNames = { file: "文件", image: "图片", voice: "语音", access: "访问权限", model: "选择模型" };
        for (const kind of ["file", "image", "voice", "access", "model"]) {
          const tool = document.createElement("button");
          tool.type = "button";
          tool.className = `qq-tool qq-tool-${kind}`;
          tool.setAttribute("aria-label", toolNames[kind]);
          tool.title = toolNames[kind];
          tool.addEventListener("click", () => {
            const currentComposer = tool.closest(".composer-surface-chrome");
            const source = kind === "file" || kind === "image"
              ? currentComposer?.querySelector("button[data-composer-navigation-target='add-context'], button[aria-label^='添加文件']")
              : kind === "voice"
                ? currentComposer?.querySelector("button[aria-label='听写'], button[aria-label='重试听写']")
                : kind === "access"
                  ? currentComposer?.querySelector("button[data-composer-navigation-target='permissions'], button[aria-label='更改权限']")
                  : currentComposer?.querySelector("button[data-codex-intelligence-trigger='true'], button[data-composer-navigation-target='reasoning']") ||
                    [...(currentComposer?.querySelectorAll("button") || [])].find((node) =>
                      !node.classList.contains("qq-tool") && !node.getAttribute("aria-label") &&
                      node.querySelector("[class*='_ComposerDropdownLabel_']")
                    );
            placeSourceAt(source, tool);
            if (kind === "model") setTimeout(() => activateNativeSource(source, true), 0);
            else if (kind === "access") activateNativeSource(source);
            else source?.click();
            if (kind === "image") {
              setTimeout(() => placeSourceAt(source, currentComposer?.querySelector(".qq-tool-file")), 600);
            }
          });
          toolbar.appendChild(tool);
        }
      }
      if (toolbar.parentElement !== composer) composer.appendChild(toolbar);
      const mountNativeTool = (kind, source) => {
        const placeholder = toolbar.querySelector(`.qq-tool-${kind}`);
        if (!source || !placeholder) return placeholder;
        if (!source.__qqOriginalParent) {
          source.__qqOriginalParent = source.parentNode;
          source.__qqOriginalNext = source.nextSibling;
        }
        source.classList.remove("qq-proxied-control", "qq-proxied-action", "qq-proxy-interactive");
        source.classList.add("qq-tool", `qq-tool-${kind}`, "qq-native-tool");
        source.dataset.qqNativeTool = kind;
        if (source.__qqHadOriginalTitle === undefined) {
          source.__qqHadOriginalTitle = source.hasAttribute("title");
          source.__qqOriginalTitle = source.getAttribute("title") || "";
          source.__qqHadOriginalAriaLabel = source.hasAttribute("aria-label");
          source.__qqOriginalAriaLabel = source.getAttribute("aria-label") || "";
        }
        const toolLabel = kind === "access" ? "访问权限" : "选择模型";
        source.title = toolLabel;
        source.setAttribute("aria-label", toolLabel);
        if (!source.__qqTooltipBlocker) {
          source.__qqTooltipBlocker = (event) => {
            event.stopImmediatePropagation();
            hideNativeToolbarTooltips();
            requestAnimationFrame(hideNativeToolbarTooltips);
            setTimeout(hideNativeToolbarTooltips, 60);
          };
          for (const type of ["pointerover", "pointermove", "pointerenter", "mouseover", "mousemove", "mouseenter", "focus", "focusin"]) {
            source.addEventListener(type, source.__qqTooltipBlocker, true);
          }
        }
        for (const property of ["--qq-proxy-left", "--qq-proxy-top", "--qq-proxy-width", "--qq-proxy-height"]) {
          source.style.removeProperty(property);
        }
        if (placeholder !== source) placeholder.replaceWith(source);
        return source;
      };
      mountNativeTool("access", sources.access);
      mountNativeTool("model", sources.model);
      for (const kind of ["file", "voice"]) {
        placeSourceAt(sources[kind], toolbar.querySelector(`.qq-tool-${kind}`));
      }
      for (const kind of ["file", "image", "voice", "access", "model"]) {
        const tool = toolbar.querySelector(`.qq-tool-${kind}`);
        const source = sources[kind];
        if (tool) tool.disabled = !source || Boolean(source.disabled);
      }
      const modelLabel = sources.model?.querySelector("[class*='_ComposerDropdownLabelValue_']")?.textContent?.trim() ||
        sources.model?.textContent?.trim();
      const modelTool = toolbar.querySelector(".qq-tool-model");
      if (modelTool) {
        modelTool.setAttribute("aria-label", "选择模型");
        modelTool.title = "选择模型";
      }
      hideNativeToolbarTooltips();
      const positionModelSubmenusRight = (root) => {
        if (!root?.isConnected) return;
        const rootRect = root.getBoundingClientRect();
        const openTrigger = [...root.querySelectorAll("[role='menuitem'][data-state='open'], [aria-expanded='true'], [data-state='open']")]
          .find((node) => /^(模型|推理强度|速度)/.test((node.textContent || "").trim()) && node.getBoundingClientRect().height > 0);
        const triggerRect = openTrigger?.getBoundingClientRect();
        const candidates = [...new Set([...document.querySelectorAll("[data-radix-popper-content-wrapper], [role='menu'], [role='listbox']")]
          .map((node) => node.closest("[data-radix-popper-content-wrapper]") || node))]
          .filter((node) => {
            if (node === root || root.contains(node) || composer.contains(node) || node.classList.contains("qq-model-popover-above")) return false;
            if (root.__qqModelSubmenuBaseline?.has(node)) return false;
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return rect.width >= 100 && rect.height >= 30 && rect.width < innerWidth - 8 && rect.height < innerHeight - 8 &&
              style.display !== "none" && style.visibility === "visible";
          });
        for (const submenu of candidates) {
          if (!submenu.__qqModelPopoverPosition) {
            submenu.__qqModelPopoverPosition = Object.fromEntries(MODEL_POPOVER_PROPERTIES.map((property) => [property, {
              value: submenu.style.getPropertyValue(property),
              priority: submenu.style.getPropertyPriority(property),
            }]));
          }
          let rect = submenu.getBoundingClientRect();
          const isModelList = /^模型/.test((openTrigger?.textContent || "").trim());
          if (isModelList) {
            const availableWidth = Math.max(180, innerWidth - rootRect.right - 14);
            if (rect.width > availableWidth) {
              submenu.classList.add("qq-model-list-submenu");
              submenu.style.setProperty("width", `${availableWidth}px`, "important");
              submenu.style.setProperty("min-width", "0", "important");
              submenu.style.setProperty("max-width", `${availableWidth}px`, "important");
              rect = submenu.getBoundingClientRect();
            }
          }
          const left = isModelList ? rootRect.right + 6 : Math.max(8, Math.min(innerWidth - rect.width - 8, rootRect.right + 6));
          const top = Math.max(8, Math.min(innerHeight - rect.height - 8, triggerRect?.top ?? rootRect.top));
          submenu.classList.add("qq-model-submenu-right");
          submenu.style.setProperty("position", "fixed", "important");
          submenu.style.setProperty("z-index", "10060", "important");
          submenu.style.setProperty("left", `${left}px`, "important");
          submenu.style.setProperty("top", `${top}px`, "important");
          submenu.style.setProperty("right", "auto", "important");
          submenu.style.setProperty("bottom", "auto", "important");
          submenu.style.setProperty("transform", "none", "important");
        }
      };
      const positionModelPopoverAbove = () => {
        const open = modelTool?.getAttribute("data-state") === "open" || modelTool?.getAttribute("aria-expanded") === "true" || modelTool?.__qqModelPopoverPending === true;
        if (!open) {
          restoreModelPopoverPositions();
          return;
        }
        const visible = [...document.querySelectorAll("[data-radix-popper-content-wrapper], [role='menu'], [role='listbox'], [role='dialog']")]
          .filter((node) => {
            if (composer.contains(node)) return false;
            if (modelTool.__qqModelPopoverPending && modelTool.__qqModelPopoverExisting?.has(node)) return false;
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return rect.width >= 120 && rect.height >= 60 && rect.width < innerWidth - 8 && rect.height < innerHeight - 8 &&
              style.display !== "none" && style.visibility === "visible";
          })
          .map((node) => node.closest("[data-radix-popper-content-wrapper]") || node);
        const wrappers = [...new Set(visible)];
        const popover = document.querySelector(".qq-model-popover-above") || wrappers.sort((left, right) => {
          const leftRect = left.getBoundingClientRect();
          const rightRect = right.getBoundingClientRect();
          return (leftRect.width * leftRect.height) - (rightRect.width * rightRect.height);
        })[0];
        if (!popover) return;
        if (!popover.__qqModelPopoverPosition) {
          popover.__qqModelPopoverPosition = Object.fromEntries(MODEL_POPOVER_PROPERTIES.map((property) => [property, {
            value: popover.style.getPropertyValue(property),
            priority: popover.style.getPropertyPriority(property),
          }]));
        }
        const triggerRect = modelTool.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const left = Math.max(8, Math.min(innerWidth - popoverRect.width - 8, triggerRect.left));
        const top = Math.max(8, triggerRect.top - popoverRect.height - 6);
        popover.classList.add("qq-model-popover-above");
        popover.style.setProperty("position", "fixed", "important");
        popover.style.setProperty("z-index", "10050", "important");
        popover.style.setProperty("left", `${left}px`, "important");
        popover.style.setProperty("top", `${top}px`, "important");
        popover.style.setProperty("right", "auto", "important");
        popover.style.setProperty("bottom", "auto", "important");
        popover.style.setProperty("transform", "none", "important");
        if (!popover.__qqModelSubmenuBaseline) {
          popover.__qqModelSubmenuBaseline = new Set(modelTool.__qqModelPopoverExisting || []);
        }
        if (!popover.__qqModelSubmenuHandler) {
          const handleSubmenu = () => {
            queueMicrotask(() => positionModelSubmenusRight(popover));
            setTimeout(() => positionModelSubmenusRight(popover), 40);
          };
          const submenuObserver = new MutationObserver(handleSubmenu);
          submenuObserver.observe(document.body, { childList: true, subtree: true });
          popover.addEventListener("pointerover", handleSubmenu, true);
          popover.addEventListener("click", handleSubmenu, true);
          popover.__qqModelSubmenuObserver = submenuObserver;
          popover.__qqModelSubmenuHandler = handleSubmenu;
        }
        positionModelSubmenusRight(popover);
        modelTool.__qqModelPopoverPending = false;
        delete modelTool.__qqModelPopoverExisting;
      };
      if (modelTool) modelTool.__qqPositionModelPopover = positionModelPopoverAbove;
      if (modelTool && !modelTool.__qqModelPopoverArm) {
        const armModelPopover = () => {
          modelTool.__qqModelPopoverPending = true;
          modelTool.__qqModelPopoverExisting = new Set(document.querySelectorAll("[data-radix-popper-content-wrapper], [role='menu'], [role='listbox'], [role='dialog']"));
          modelTool.__qqModelPopoverObserver?.disconnect();
          const popoverObserver = new MutationObserver(() => {
            modelTool.__qqPositionModelPopover?.();
            if (!modelTool.__qqModelPopoverPending) {
              popoverObserver.disconnect();
              if (modelTool.__qqModelPopoverObserver === popoverObserver) delete modelTool.__qqModelPopoverObserver;
            }
          });
          popoverObserver.observe(document.body, { childList: true, subtree: true });
          modelTool.__qqModelPopoverObserver = popoverObserver;
          queueMicrotask(() => modelTool.__qqPositionModelPopover?.());
          setTimeout(() => {
            modelTool.__qqModelPopoverPending = false;
            modelTool.__qqPositionModelPopover?.();
            popoverObserver.disconnect();
            if (modelTool.__qqModelPopoverObserver === popoverObserver) delete modelTool.__qqModelPopoverObserver;
          }, 500);
        };
        modelTool.addEventListener("pointerdown", armModelPopover, true);
        modelTool.addEventListener("click", armModelPopover, true);
        modelTool.__qqModelPopoverArm = armModelPopover;
      }
      positionModelPopoverAbove();
      if (modelTool?.getAttribute("data-state") === "open" || modelTool?.getAttribute("aria-expanded") === "true") {
        requestAnimationFrame(positionModelPopoverAbove);
        setTimeout(positionModelPopoverAbove, 80);
      }
      let history = composer.querySelector(".qq-message-history");
      if (!history) {
        history = document.createElement("button");
        history.type = "button";
        history.className = "qq-message-history";
        history.setAttribute("aria-label", "消息记录");
        history.title = "查找当前任务的消息记录";
        history.innerHTML = `<span class="qq-history-icon" aria-hidden="true"></span><span class="qq-history-label">消息记录</span><span class="qq-history-caret" aria-hidden="true"></span>`;
        history.addEventListener("click", () => openHistoryPanel(history));
      }
      if (history.parentElement !== composer) composer.appendChild(history);

      const nativeActionButtons = [...composer.querySelectorAll("button")].filter((node) =>
        !node.classList.contains("qq-tool") &&
        !node.classList.contains("qq-message-history") &&
        !node.closest(".qq-send-group")
      );
      for (const node of nativeActionButtons) {
        if (!node.classList.contains("qq-proxied-action")) continue;
        node.classList.remove("qq-proxied-control", "qq-proxied-action");
        for (const property of ["--qq-proxy-left", "--qq-proxy-top", "--qq-proxy-width", "--qq-proxy-height"]) {
          node.style.removeProperty(property);
        }
      }
      const actionLabel = (node) => node?.getAttribute("aria-label")?.trim() || "";
      const isVoiceAction = (label) => /语音.*(聊天|对话|模式)|开始.*语音|voice/i.test(label || "");
      const actionRegion = composerFooter.querySelector(".col-start-3.row-start-2") || composerFooter.lastElementChild;
      const findPrimarySource = () => [...(actionRegion?.querySelectorAll("button") || [])]
        .filter((node) => !node.closest(".qq-send-group") && !node.classList.contains("qq-tool"))
        .at(-1) || null;
      const findVoiceSource = () => [...document.querySelectorAll("button")].find((node) =>
        node !== sources.voice && node.getAttribute("aria-label") !== "听写" &&
        /语音.*(聊天|对话|模式)|开始.*语音|voice/i.test(actionLabel(node))
      ) || null;
      const primarySource = findPrimarySource();
      const voiceChatSource = findVoiceSource();
      const dictationControl = composer.querySelector([
        "button[aria-label*='停止听写']",
        "button[aria-label*='结束听写']",
        "button[aria-label*='取消听写']",
        "[data-dictation-state='recording']",
        "[data-recording='true']",
        "[data-voice-input-state='recording']",
      ].join(","));
      const dictationPressed = sources.voice?.getAttribute("aria-pressed") === "true" ||
        ["on", "active", "recording"].includes(sources.voice?.dataset?.state || "");
      const dictationTimer = [...composerFooter.querySelectorAll("*")].some((node) => {
        const text = (node.textContent || "").replace(/\s+/g, "").trim();
        return text.length <= 8 && /^\d{1,2}:\d{2}$/.test(text);
      });
      const dictationWaveform = [...composerFooter.querySelectorAll("canvas, svg, [class*='wave'], [class*='meter'], [data-waveform]")].some((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width >= 80 && rect.height >= 8;
      });
      const composerBox = composer.getBoundingClientRect();
      const nativeBottomLeftButtons = [...composer.querySelectorAll("button")].filter((node) => {
        if (node.closest(".qq-composer-toolbar, .qq-send-group") || node.classList.contains("qq-message-history")) return false;
        const rect = node.getBoundingClientRect();
        return rect.width >= 20 && rect.height >= 20 &&
          rect.left >= composerBox.left - 2 && rect.left <= composerBox.left + 62 &&
          rect.top >= composerBox.bottom - 48 && rect.bottom <= composerBox.bottom + 2;
      });
      for (const node of composer.querySelectorAll(".qq-dictation-native-add")) {
        if (!nativeBottomLeftButtons.includes(node)) node.classList.remove("qq-dictation-native-add");
      }
      for (const node of nativeBottomLeftButtons) node.classList.add("qq-dictation-native-add");
      const dictationActive = Boolean(dictationControl || dictationPressed || dictationTimer || dictationWaveform || nativeBottomLeftButtons.length);
      composer.toggleAttribute("data-qq-dictation-active", dictationActive);
      if (primarySource) primarySource.classList.add("qq-proxied-control", "qq-proxied-action");
      let sendGroup = composer.querySelector(".qq-send-group");
      if (!sendGroup) {
        sendGroup = document.createElement("div");
        sendGroup.className = "qq-send-group";
        sendGroup.innerHTML = `
          <button type="button" class="qq-send-main" aria-label="QQ操作：发送">发送</button>
          <button type="button" class="qq-send-caret" aria-label="选择发送方式" aria-haspopup="menu" aria-expanded="false">▾</button>`;
        const mainButton = sendGroup.querySelector(".qq-send-main");
        const caretButton = sendGroup.querySelector(".qq-send-caret");
        mainButton.addEventListener("click", () => {
          const currentComposer = mainButton.closest(".composer-surface-chrome");
          const currentFooter = currentComposer?.querySelector("[class*='_ComposerLayoutFooter_']");
          const currentRegion = currentFooter?.querySelector(".col-start-3.row-start-2") || currentFooter?.lastElementChild;
          const source = [...(currentRegion?.querySelectorAll("button") || [])]
            .filter((node) => !node.closest(".qq-send-group") && !node.classList.contains("qq-tool"))
            .at(-1);
          if (!isVoiceAction(actionLabel(source))) source?.click();
        });
        caretButton.addEventListener("click", () => {
          const oldMenu = document.querySelector(".qq-send-menu-popover");
          if (oldMenu) {
            oldMenu.__qqCleanup?.();
            oldMenu.remove();
            caretButton.setAttribute("aria-expanded", "false");
            return;
          }
          const menu = document.createElement("div");
          menu.className = "qq-send-menu-popover";
          menu.setAttribute("role", "menu");
          const voiceItem = document.createElement("button");
          voiceItem.type = "button";
          voiceItem.className = "qq-send-voice-item";
          voiceItem.setAttribute("role", "menuitem");
          voiceItem.innerHTML = `<span class="qq-send-voice-icon" aria-hidden="true"></span><span>语音聊天</span>`;
          const findCurrentVoiceSource = () => [...document.querySelectorAll("button")].find((node) =>
            !node.closest(".qq-send-group") && node.getAttribute("aria-label") !== "听写" &&
            /语音.*(聊天|对话|模式)|开始.*语音|voice/i.test(node.getAttribute("aria-label") || "")
          );
          voiceItem.disabled = !findCurrentVoiceSource();
          voiceItem.addEventListener("click", () => {
            const source = findCurrentVoiceSource();
            menu.__qqCleanup?.();
            menu.remove();
            caretButton.setAttribute("aria-expanded", "false");
            source?.click();
          });
          menu.appendChild(voiceItem);
          document.body.appendChild(menu);
          const box = caretButton.getBoundingClientRect();
          menu.style.right = `${Math.max(8, window.innerWidth - box.right)}px`;
          menu.style.bottom = `${Math.max(8, window.innerHeight - box.top + 5)}px`;
          caretButton.setAttribute("aria-expanded", "true");
          const controller = new AbortController();
          menu.__qqCleanup = () => controller.abort();
          document.addEventListener("pointerdown", (event) => {
            if (!menu.contains(event.target) && !caretButton.contains(event.target)) {
              menu.__qqCleanup?.();
              menu.remove();
              caretButton.setAttribute("aria-expanded", "false");
            }
          }, { capture: true, signal: controller.signal });
          document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
              menu.__qqCleanup?.();
              menu.remove();
              caretButton.setAttribute("aria-expanded", "false");
            }
          }, { signal: controller.signal });
        });
      }
      if (sendGroup.parentElement !== composer) composer.appendChild(sendGroup);
      const mainButton = sendGroup.querySelector(".qq-send-main");
      const caretButton = sendGroup.querySelector(".qq-send-caret");
      const primaryLabel = actionLabel(primarySource);
      const primaryIsVoice = isVoiceAction(primaryLabel);
      const displayLabel = primaryIsVoice ? "发送" : ({
        "发送": "发送",
        "发送消息": "发送",
        "加入队列": "继续引导",
        "继续运行": "继续",
      })[primaryLabel] || primaryLabel || "发送";
      sendGroup.hidden = dictationActive;
      sendGroup.dataset.action = primaryLabel || "idle";
      const visualAction = primaryIsVoice ? "idle" : (primaryLabel || "idle");
      if (mainButton.dataset.visualAction !== visualAction) {
        mainButton.replaceChildren();
        mainButton.textContent = !primarySource || primaryIsVoice || /^(发送|发送消息)$/.test(primaryLabel)
          ? "发送"
          : displayLabel;
        mainButton.dataset.visualAction = visualAction;
      }
      mainButton.setAttribute("aria-label", `QQ操作：${displayLabel}`);
      mainButton.title = displayLabel;
      mainButton.disabled = !primarySource || primaryIsVoice || Boolean(primarySource.disabled);
      caretButton.disabled = !voiceChatSource;
    }

    const home = document.querySelector('[role="main"]:has([data-testid="home-icon"])');
    for (const candidate of document.querySelectorAll('.dream-home, .qq-new-conversation')) {
      candidate.classList.remove("dream-home", "qq-new-conversation");
    }
    if (home) home.classList.add("qq-new-conversation");

    shellMain.classList.remove("dream-home", "dream-home-shell");
    shellMain.classList.toggle("qq-new-conversation-shell", Boolean(home));
    let chrome = document.getElementById(CHROME_ID);
    if (!chrome || chrome.parentElement !== document.body) {
      chrome?.remove();
      chrome = document.createElement("div");
      chrome.id = CHROME_ID;
      chrome.setAttribute("aria-hidden", "true");
      chrome.innerHTML = `
        <div class="dream-brand"><span class="dream-note">●</span><span><b>从訫乄嗳你</b><small>QQv2 · 在线</small></span></div>
        <div class="dream-signature">轻松编码，快乐在线</div>
        <div class="dream-sparkles"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="dream-ribbon"><span>●</span>消息 · 项目 · 灵感<span>✦</span></div>
        <div class="dream-polaroid"></div>`;
      document.body.appendChild(chrome);
    }
    const brandName = chrome.querySelector?.(".dream-brand b");
    if (brandName && brandName.textContent !== "从訫乄嗳你") brandName.textContent = "从訫乄嗳你";
    const shellBox = shellMain.getBoundingClientRect();
    chrome.style.left = `${Math.round(shellBox.left)}px`;
    chrome.style.top = `${Math.round(shellBox.top)}px`;
    chrome.style.width = `${Math.round(shellBox.width)}px`;
    chrome.style.height = `${Math.round(shellBox.height)}px`;
    chrome.classList.remove("dream-home-shell");
  };

  const cleanup = () => {
    window.__CODEX_DREAM_SKIN_DISABLED__ = true;
    clearSkinDom();
    const state = window[STATE_KEY];
    state?.observer?.disconnect();
    if (state?.timer) clearInterval(state.timer);
    if (state?.scheduler?.timeout) clearTimeout(state.scheduler.timeout);
    if (state?.artUrl) URL.revokeObjectURL(state.artUrl);
    if (state?.qqIconsUrl) URL.revokeObjectURL(state.qqIconsUrl);
    delete window[STATE_KEY];
    return true;
  };

  const scheduler = { timeout: null };
  const scheduleEnsure = () => {
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.timeout = setTimeout(() => {
      scheduler.timeout = null;
      ensure();
    }, 180);
  };
  const observer = new MutationObserver(scheduleEnsure);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const timer = setInterval(ensure, 5000);
  window[STATE_KEY] = { ensure, cleanup, observer, timer, scheduler, artUrl, qqIconsUrl, version: "2.0.0" };
  ensure();
  return { installed: true, version: "2.0.0" };
})(__DREAM_CSS_JSON__, __DREAM_ART_JSON__, __QQ_ICONS_ART_JSON__, __QQ_PROFILE_AVATAR_JSON__, __QQ_PROFILE_VIP_JSON__, __QQ_PROFILE_CROWN_JSON__)
