import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Panel, { ShortcutsModal } from './Panel';
import FullPagePanel from './FullPagePanel';
import {
  ActionType,
  TargetScope,
  ExtensionMessage,
  TransformState,
  TransformPayload,
  AppSettings,
  DEFAULT_SETTINGS,
  DEFAULT_TRANSFORM,
} from '../../types';
import {
  createTransformState,
  nextRotation,
  clampZoom,
  buildTransformString,
  hasTransform,
} from '../lib/transform';

declare const chrome: any;

/**
 * EXT-03. One instance marker per page.
 *
 * When the extension updates, the content script already running in an open tab
 * is orphaned: its chrome.runtime handle is invalidated but its DOM listeners,
 * panel and overlays are still in the page. EXT-01 will inject a fresh copy on
 * the next user gesture, so the new copy tears the old one down through this
 * marker before it does anything else.
 */
const INSTANCE_KEY = '__flipRotateUltimateInstance';

const previous = (window as any)[INSTANCE_KEY];
if (previous && typeof previous.teardown === 'function') {
  try {
    previous.teardown();
  } catch {
    // An orphaned instance may throw on cleanup. Continue regardless.
  }
}

/** Removes every DOM listener this instance registered, in one call. */
const listeners = new AbortController();
const { signal } = listeners;

// --- State ---

let lastClickedElement: HTMLElement | null = null;
let selectedElements = new Set<HTMLElement>();
let currentHighlightedElement: HTMLElement | null = null;
let settings: AppSettings = { ...DEFAULT_SETTINGS };

// WeakMap so nodes destroyed by a single page application are garbage
// collected rather than pinned for the lifetime of the tab. See DECISIONS.md D2.
const elementStates = new WeakMap<HTMLElement, TransformState>();

const pageState: TransformState = createTransformState();

let isPanelOpen = false;
let isSelectionMode = false;
let shadowHost: HTMLElement | null = null;
let reactRoot: Root | null = null;

let hoverOverlay: HTMLElement | null = null;
const selectionOverlays = new Map<HTMLElement, HTMLElement>();

/** True while this instance's chrome.runtime handle is still valid. */
function runtimeAlive(): boolean {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
  } catch {
    return false;
  }
}

// --- Settings ---

if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
  chrome.storage.sync.get(['settings'], (result: any) => {
    if (result.settings) {
      // Merge rather than replace: a profile synced from an older version still
      // carries the removed whitelistRegex key, which we simply ignore.
      settings = { ...DEFAULT_SETTINGS, animationsEnabled: result.settings.animationsEnabled !== false };
    }
  });
}

if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
    if (namespace === 'sync' && changes.settings) {
      const next = changes.settings.newValue || {};
      settings = { ...DEFAULT_SETTINGS, animationsEnabled: next.animationsEnabled !== false };
      renderPanel();
    }
  });
}

function persistSettings(): void {
  if (!runtimeAlive() || !chrome.storage?.sync) return;
  chrome.storage.sync.set({ settings });
}

// --- Injected styles ---

const styleSheet = document.createElement('style');
styleSheet.setAttribute('data-flip-ext', 'true');
styleSheet.textContent = `
  .flip-ext-transition {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  }
  .flip-ext-highlight {
    outline: 2px dashed #f43f5e !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.3) !important;
    cursor: crosshair !important;
  }
  .flip-ext-selected {
    outline: 4px dotted #f43f5e !important;
    outline-offset: 2px !important;
  }
`;
document.head.appendChild(styleSheet);

// --- Overlays ---

function createOverlay(id: string, color: string): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.position = 'absolute';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '2147483646'; // one below the panel
  overlay.style.backgroundColor = color;
  overlay.style.transition = 'all 0.1s ease-out';
  overlay.style.display = 'none';
  document.documentElement.appendChild(overlay);
  return overlay;
}

function addSelectionOverlay(element: HTMLElement) {
  if (selectionOverlays.has(element)) return;
  const overlay = createOverlay(`flip-ext-selection-${Date.now()}-${Math.random()}`, 'rgba(244, 63, 94, 0.2)');
  selectionOverlays.set(element, overlay);
  updateOverlayPosition(overlay, element);
}

function removeSelectionOverlay(element: HTMLElement) {
  const overlay = selectionOverlays.get(element);
  if (overlay) {
    overlay.remove();
    selectionOverlays.delete(element);
  }
}

function clearSelection() {
  selectedElements.forEach((el) => {
    el.classList.remove('flip-ext-selected');
    removeSelectionOverlay(el);
  });
  selectedElements.clear();
}

function updateOverlayPosition(overlay: HTMLElement | null, target: HTMLElement | null) {
  if (!overlay || !target) {
    if (overlay) overlay.style.display = 'none';
    return;
  }

  const rect = target.getBoundingClientRect();
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.display = 'block';
}

function refreshSelectionOverlays() {
  selectedElements.forEach((el) => updateOverlayPosition(selectionOverlays.get(el) || null, el));
}

if (typeof document !== 'undefined') {
  hoverOverlay = createOverlay('flip-ext-hover-overlay', 'rgba(59, 130, 246, 0.4)');
}

// --- Smart selection ---

function getSmartTarget(x: number, y: number): HTMLElement | null {
  const elements = document.elementsFromPoint(x, y);

  const isOverPanel = elements.some((el) => el === shadowHost || shadowHost?.contains(el));
  if (isOverPanel) return null;

  const validElements = elements.filter((el) => {
    if (el === hoverOverlay) return false;
    for (const overlay of selectionOverlays.values()) {
      if (el === overlay) return false;
    }
    return true;
  });

  if (validElements.length === 0) return null;

  // Prefer media over the wrapper containers that usually sit on top of it.
  const mediaElement = validElements.find((el) =>
    ['VIDEO', 'IMG', 'SVG', 'CANVAS'].includes(el.tagName.toUpperCase()),
  );

  return (mediaElement as HTMLElement) || (validElements[0] as HTMLElement);
}

// --- DOM listeners ---

document.addEventListener(
  'contextmenu',
  (e) => {
    if (isSelectionMode) {
      const target = getSmartTarget(e.clientX, e.clientY);
      if (!target) return;
      e.preventDefault();
      handleSelection(target, e.shiftKey || e.ctrlKey || e.metaKey);
      return;
    }
    lastClickedElement = getSmartTarget(e.clientX, e.clientY) || (e.target as HTMLElement);
  },
  { capture: true, signal },
);

window.addEventListener('scroll', () => { if (selectedElements.size > 0) refreshSelectionOverlays(); }, { passive: true, signal });
window.addEventListener('resize', () => { if (selectedElements.size > 0) refreshSelectionOverlays(); }, { passive: true, signal });

document.addEventListener(
  'mouseover',
  (e) => {
    if (!isSelectionMode) return;
    const target = getSmartTarget(e.clientX, e.clientY);
    if (!target) return;

    if (currentHighlightedElement && currentHighlightedElement !== target) {
      currentHighlightedElement.classList.remove('flip-ext-highlight');
    }
    currentHighlightedElement = target;
    target.classList.add('flip-ext-highlight');
    updateOverlayPosition(hoverOverlay, target);
  },
  { signal },
);

document.addEventListener(
  'mouseout',
  () => {
    if (!isSelectionMode) return;
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('flip-ext-highlight');
      currentHighlightedElement = null;
    }
    if (hoverOverlay) hoverOverlay.style.display = 'none';
  },
  { signal },
);

document.addEventListener(
  'click',
  (e) => {
    if (!isSelectionMode) return;
    const target = getSmartTarget(e.clientX, e.clientY);
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    handleSelection(target, e.shiftKey || e.ctrlKey || e.metaKey);
  },
  { capture: true, signal },
);

function handleSelection(element: HTMLElement, isMultiSelect: boolean = false) {
  if (shadowHost?.contains(element)) return;

  if (isMultiSelect) {
    if (selectedElements.has(element)) {
      selectedElements.delete(element);
      element.classList.remove('flip-ext-selected');
      removeSelectionOverlay(element);
    } else {
      selectedElements.add(element);
      element.classList.add('flip-ext-selected');
      addSelectionOverlay(element);
    }
  } else {
    clearSelection();
    selectedElements.add(element);
    element.classList.add('flip-ext-selected');
    addSelectionOverlay(element);
  }

  element.classList.remove('flip-ext-highlight');
  if (hoverOverlay) hoverOverlay.style.display = 'none';

  renderPanel();
}

// --- Message handling ---

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender: any, sendResponse: (r?: any) => void) => {
      // EXT-01. Liveness probe. Answer synchronously so the worker's decision to
      // inject is fast.
      if (message.type === ActionType.PING) {
        sendResponse({ alive: true });
        return;
      }

      if (message.type === ActionType.OPEN_PANEL) {
        if (message.scope === TargetScope.ELEMENT && lastClickedElement) {
          handleSelection(lastClickedElement);
        }
        openPanel();
        return;
      }

      // EXT-10. Reads must not have side effects. GET_STATE previously fell
      // through to applyTransform and re-applied the current transform.
      if (message.type === ActionType.GET_STATE) {
        sendResponse(pageState);
        return;
      }

      const target = message.scope === TargetScope.PAGE ? document.body : lastClickedElement;

      if (!target) {
        console.warn('Flip and Rotate: no element selected.');
        return;
      }

      applyTransform(target, message.scope, message.type, message.payload);
    },
  );
}

// --- Panel lifecycle ---

function openPanel() {
  if (isPanelOpen) return;
  isPanelOpen = true;
  isSelectionMode = true;
  mountPanel();
}

function closePanel() {
  isPanelOpen = false;
  unmountPanel();
}

function mountPanel() {
  if (shadowHost) return;

  shadowHost = document.createElement('div');
  shadowHost.id = 'flip-rotate-interactive-root';

  // documentElement, not body: page scope transforms target body, and a panel
  // inside body would rotate along with the page it controls. DECISIONS.md D1.
  document.documentElement.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  reactRoot = createRoot(container);
  reactRoot.render(<PanelContainer />);
}

function unmountPanel() {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
  }

  clearSelection();
  if (hoverOverlay) hoverOverlay.style.display = 'none';
  isSelectionMode = false;
}

/**
 * EXT-07. Bare letter shortcuts must not fire while the user is typing into the
 * page. Previously typing "rhubarb" into a search box reset their transforms.
 */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== 'string') return false;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName.toUpperCase())) return true;
  return el.isContentEditable === true;
}

const PanelContainer = () => {
  const [showFullPage, setShowFullPage] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: window.innerWidth - 340, y: 20 });
  const [, forceUpdate] = useState({});

  useEffect(() => {
    (window as any).__flip_render_panel = () => forceUpdate({});
    return () => {
      (window as any).__flip_render_panel = null;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (showShortcuts) setShowShortcuts(false);
        else closePanel();
        return;
      }

      if (showShortcuts) return;

      // EXT-07 guards.
      if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key.toLowerCase() === 'r') {
        updateTransform(ActionType.RESET, undefined, TargetScope.ELEMENT);
      }

      if (e.key.toLowerCase() === 'h') {
        setShowFullPage((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showShortcuts]);

  const lastSelected = Array.from(selectedElements).pop();
  const target = lastSelected || document.body;
  const elementState = getElementState(target, lastSelected ? TargetScope.ELEMENT : TargetScope.PAGE);

  const FULL_PAGE_OFFSET_Y = 180;

  return (
    <>
      <Panel
        onClose={closePanel}
        onFlipX={() => updateTransform(ActionType.FLIP_X, undefined, TargetScope.ELEMENT)}
        onFlipY={() => updateTransform(ActionType.FLIP_Y, undefined, TargetScope.ELEMENT)}
        onRotate={(deg) => updateTransform(ActionType.ROTATE, { degrees: deg, relative: false }, TargetScope.ELEMENT)}
        onZoom={(scale) => updateTransform(ActionType.ZOOM, { zoom: scale }, TargetScope.ELEMENT)}
        onReset={() => updateTransform(ActionType.RESET, undefined, TargetScope.ELEMENT)}
        onToggleSelectionMode={() => {
          if (isSelectionMode) clearSelection();
          isSelectionMode = !isSelectionMode;
          renderPanel();
        }}
        onEnableIncognito={() => {
          if (runtimeAlive()) {
            chrome.runtime.sendMessage({ type: ActionType.OPEN_EXT_MANAGEMENT });
          }
        }}
        onToggleFullPage={() => setShowFullPage(!showFullPage)}
        showFullPage={showFullPage}
        onShowShortcuts={() => setShowShortcuts(true)}
        animationsEnabled={settings.animationsEnabled}
        onToggleAnimations={() => {
          settings = { ...settings, animationsEnabled: !settings.animationsEnabled };
          persistSettings();
          renderPanel();
        }}
        isSelectionMode={isSelectionMode}
        currentRotation={elementState.rotation}
        currentZoom={elementState.zoom}
        statusText={selectedElements.size > 0 ? `${selectedElements.size} Selected` : 'Select Element'}
        position={panelPosition}
        onPositionChange={setPanelPosition}
      />

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {showFullPage && (
        <FullPagePanel
          onClose={() => setShowFullPage(false)}
          onFlipX={() => updateTransform(ActionType.FLIP_X, undefined, TargetScope.PAGE)}
          onFlipY={() => updateTransform(ActionType.FLIP_Y, undefined, TargetScope.PAGE)}
          onRotate={(deg) => updateTransform(ActionType.ROTATE, { degrees: deg, relative: false }, TargetScope.PAGE)}
          onReset={() => updateTransform(ActionType.RESET, undefined, TargetScope.PAGE)}
          currentRotation={pageState.rotation}
          position={{ x: panelPosition.x, y: panelPosition.y + FULL_PAGE_OFFSET_Y }}
        />
      )}
    </>
  );
};

function renderPanel() {
  if (!reactRoot) return;
  const rerender = (window as any).__flip_render_panel;
  if (rerender) rerender();
  else reactRoot.render(<PanelContainer />);
}

function updateTransform(action: ActionType, payload?: TransformPayload, forcedScope?: TargetScope) {
  let targets: HTMLElement[];
  let scope: TargetScope;

  if (forcedScope === TargetScope.PAGE) {
    targets = [document.body];
    scope = TargetScope.PAGE;
  } else if (selectedElements.size > 0) {
    targets = Array.from(selectedElements);
    scope = TargetScope.ELEMENT;
  } else {
    targets = [document.body];
    scope = TargetScope.PAGE;
  }

  targets.forEach((target) => applyTransform(target, scope, action, payload));

  // RESET clears the selection and returns to picking a new element.
  if (action === ActionType.RESET && scope === TargetScope.ELEMENT) {
    clearSelection();
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    isSelectionMode = true;
    renderPanel();
    return;
  }

  if (scope === TargetScope.ELEMENT) refreshSelectionOverlays();
  renderPanel();
}

// --- Transform engine ---

function getElementState(element: HTMLElement, scope: TargetScope): TransformState {
  if (scope === TargetScope.PAGE) return pageState;

  let state = elementStates.get(element);
  if (!state) {
    state = createTransformState();
    elementStates.set(element, state);
  }
  return state;
}

/**
 * EXT-06. Invert scroll position so the viewport stays over the content the user
 * was reading. This runs only on the transition, not on every apply. Running it
 * on every apply meant rotating or zooming an already flipped page re-inverted
 * the scroll each time and the view jumped.
 */
function correctScrollAfterFlip(axis: 'x' | 'y') {
  const doc = document.documentElement;
  if (axis === 'y') {
    window.scrollTo(window.scrollX, doc.scrollHeight - window.scrollY - doc.clientHeight);
  } else {
    window.scrollTo(doc.scrollWidth - window.scrollX - doc.clientWidth, window.scrollY);
  }
}

function applyTransform(
  element: HTMLElement,
  scope: TargetScope,
  action: ActionType,
  payload?: TransformPayload,
) {
  const state = getElementState(element, scope);
  let flippedAxis: 'x' | 'y' | null = null;

  switch (action) {
    case ActionType.FLIP_X:
      state.flipX = !state.flipX;
      flippedAxis = 'x';
      break;
    case ActionType.FLIP_Y:
      state.flipY = !state.flipY;
      flippedAxis = 'y';
      break;
    case ActionType.ROTATE:
      state.rotation = nextRotation(state.rotation, payload?.degrees ?? 0, payload?.relative === true);
      break;
    case ActionType.ZOOM:
      state.zoom = clampZoom(payload?.zoom ?? 1);
      break;
    case ActionType.RESET:
      Object.assign(state, DEFAULT_TRANSFORM);
      break;
    default:
      return;
  }

  applyTransformToElement(element, state, scope);

  if (scope === TargetScope.PAGE && flippedAxis) {
    correctScrollAfterFlip(flippedAxis);
  }
}

function applyTransformToElement(element: HTMLElement, state: TransformState, scope: TargetScope) {
  if (settings.animationsEnabled) element.classList.add('flip-ext-transition');
  else element.classList.remove('flip-ext-transition');

  element.style.transform = buildTransformString(state);

  // CSS transforms have no effect on inline boxes.
  if (window.getComputedStyle(element).display === 'inline') {
    element.style.display = 'inline-block';
  }

  if (scope !== TargetScope.PAGE) return;

  if (hasTransform(state)) {
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
    document.body.style.transformOrigin = 'center center';
  } else {
    document.body.style.minHeight = '';
    document.body.style.overflow = '';
    document.body.style.transformOrigin = '';
  }
}

// --- Teardown ---

function teardown() {
  listeners.abort();
  unmountPanel();
  selectionOverlays.forEach((overlay) => overlay.remove());
  selectionOverlays.clear();
  hoverOverlay?.remove();
  hoverOverlay = null;
  styleSheet.remove();
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('flip-ext-highlight');
    currentHighlightedElement = null;
  }
  (window as any)[INSTANCE_KEY] = null;
}

(window as any)[INSTANCE_KEY] = { teardown };
