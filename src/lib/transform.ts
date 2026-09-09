import { TransformState, DEFAULT_TRANSFORM } from '../../types';

/** A fresh, untransformed state. Always returns a new object. */
export function createTransformState(): TransformState {
  return { ...DEFAULT_TRANSFORM };
}

/**
 * Normalise a rotation to 0..359.
 * The raw modulo operator returns negatives for negative input, which would
 * make the dial jump when rotating anticlockwise past zero.
 */
export function normaliseRotation(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/** Apply a rotation, either relative to the current angle or absolute. */
export function nextRotation(current: number, degrees: number, relative: boolean): number {
  return normaliseRotation(relative ? current + degrees : degrees);
}

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;

export function clampZoom(zoom: number): number {
  if (Number.isNaN(zoom)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/**
 * Compose the CSS transform string.
 *
 * Order is fixed as rotate, then scaleX/scaleY, then scale. Applying scale
 * before rotate reverses the apparent direction of the rotation dial, which
 * makes the control feel broken. See DECISIONS.md.
 */
export function buildTransformString(state: TransformState): string {
  const rotate = `rotate(${state.rotation}deg)`;
  const scaleX = `scaleX(${state.flipX ? -1 : 1})`;
  const scaleY = `scaleY(${state.flipY ? -1 : 1})`;
  const zoom = `scale(${state.zoom})`;
  return `${rotate} ${scaleX} ${scaleY} ${zoom}`;
}

/** True when the state differs from the identity transform. */
export function hasTransform(state: TransformState): boolean {
  return state.flipX || state.flipY || state.rotation !== 0 || state.zoom !== 1;
}
