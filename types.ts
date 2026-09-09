/**
 * Shared contract between the service worker and the content script.
 *
 * Both build passes bundle their entry point, so importing from here inlines at
 * build time. Do not re-inline copies of these declarations into either side:
 * that is what EXT-08 removed, and it caused silent no-ops when only one copy
 * was edited.
 */

export enum ActionType {
  FLIP_X = 'FLIP_X',
  FLIP_Y = 'FLIP_Y',
  ROTATE = 'ROTATE',
  ZOOM = 'ZOOM',
  RESET = 'RESET',
  GET_STATE = 'GET_STATE',
  OPEN_PANEL = 'OPEN_PANEL',
  OPEN_EXT_MANAGEMENT = 'OPEN_EXT_MANAGEMENT',
  /** Liveness probe. The worker sends this to decide whether to inject. */
  PING = 'PING',
}

export enum TargetScope {
  PAGE = 'PAGE',
  ELEMENT = 'ELEMENT',
}

export interface TransformState {
  flipX: boolean;
  flipY: boolean;
  /** Degrees, always normalised to 0..359. */
  rotation: number;
  /** Scale multiplier, 0.5 to 3. */
  zoom: number;
}

export interface AppSettings {
  animationsEnabled: boolean;
}

export interface TransformPayload {
  degrees?: number;
  relative?: boolean;
  zoom?: number;
}

export interface ExtensionMessage {
  type: ActionType;
  scope: TargetScope;
  payload?: TransformPayload;
}

export const DEFAULT_SETTINGS: AppSettings = {
  animationsEnabled: true,
};

export const DEFAULT_TRANSFORM: TransformState = {
  flipX: false,
  flipY: false,
  rotation: 0,
  zoom: 1,
};

/** Why the worker could not reach a content script in a tab. */
export enum InjectionFailure {
  /** A browser page, the Web Store, or another scheme extensions cannot touch. */
  RESTRICTED = 'RESTRICTED',
  /** An ordinary page where injection was attempted and still failed. */
  UNAVAILABLE = 'UNAVAILABLE',
}
