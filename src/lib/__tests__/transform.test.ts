import { describe, it, expect } from 'vitest';
import {
  createTransformState,
  normaliseRotation,
  nextRotation,
  clampZoom,
  buildTransformString,
  hasTransform,
  ZOOM_MIN,
  ZOOM_MAX,
} from '../transform';

describe('createTransformState', () => {
  it('returns the identity transform', () => {
    expect(createTransformState()).toEqual({ flipX: false, flipY: false, rotation: 0, zoom: 1 });
  });

  it('returns a new object each time so states cannot alias', () => {
    const a = createTransformState();
    const b = createTransformState();
    a.rotation = 90;
    expect(b.rotation).toBe(0);
  });
});

describe('normaliseRotation', () => {
  it('leaves in-range values alone', () => {
    expect(normaliseRotation(0)).toBe(0);
    expect(normaliseRotation(359)).toBe(359);
  });

  it('wraps at 360', () => {
    expect(normaliseRotation(360)).toBe(0);
    expect(normaliseRotation(450)).toBe(90);
  });

  // Guards the bug that raw `%` would reintroduce: -90 % 360 is -90 in JS,
  // which makes the dial jump when rotating anticlockwise past zero.
  it('returns a positive angle for negative input', () => {
    expect(normaliseRotation(-90)).toBe(270);
    expect(normaliseRotation(-450)).toBe(270);
  });
});

describe('nextRotation', () => {
  it('adds when relative', () => {
    expect(nextRotation(90, 90, true)).toBe(180);
  });

  it('wraps when relative addition passes 360', () => {
    expect(nextRotation(270, 180, true)).toBe(90);
  });

  it('replaces when absolute', () => {
    expect(nextRotation(270, 45, false)).toBe(45);
  });

  it('four relative 90 degree turns return to the start', () => {
    let r = 0;
    for (let i = 0; i < 4; i++) r = nextRotation(r, 90, true);
    expect(r).toBe(0);
  });
});

describe('clampZoom', () => {
  it('passes through in-range values', () => {
    expect(clampZoom(1.5)).toBe(1.5);
  });

  it('clamps to the slider bounds', () => {
    expect(clampZoom(0.1)).toBe(ZOOM_MIN);
    expect(clampZoom(99)).toBe(ZOOM_MAX);
  });

  it('falls back to 1 for NaN, which parseFloat can produce', () => {
    expect(clampZoom(Number.NaN)).toBe(1);
  });
});

describe('buildTransformString', () => {
  it('emits the identity transform for a fresh state', () => {
    expect(buildTransformString(createTransformState())).toBe(
      'rotate(0deg) scaleX(1) scaleY(1) scale(1)',
    );
  });

  // Order is load bearing: scaling before rotating reverses the apparent
  // direction of the dial. See DECISIONS.md.
  it('always orders rotate before scaleX, scaleY, then scale', () => {
    const out = buildTransformString({ flipX: true, flipY: true, rotation: 90, zoom: 2 });
    expect(out).toBe('rotate(90deg) scaleX(-1) scaleY(-1) scale(2)');
    expect(out.indexOf('rotate')).toBeLessThan(out.indexOf('scaleX'));
    expect(out.indexOf('scaleY')).toBeLessThan(out.lastIndexOf('scale('));
  });

  it('encodes each flip axis independently', () => {
    expect(buildTransformString({ flipX: true, flipY: false, rotation: 0, zoom: 1 })).toContain('scaleX(-1) scaleY(1)');
    expect(buildTransformString({ flipX: false, flipY: true, rotation: 0, zoom: 1 })).toContain('scaleX(1) scaleY(-1)');
  });
});

describe('hasTransform', () => {
  it('is false for the identity transform', () => {
    expect(hasTransform(createTransformState())).toBe(false);
  });

  it('is true when any single axis is engaged', () => {
    expect(hasTransform({ flipX: true, flipY: false, rotation: 0, zoom: 1 })).toBe(true);
    expect(hasTransform({ flipX: false, flipY: true, rotation: 0, zoom: 1 })).toBe(true);
    expect(hasTransform({ flipX: false, flipY: false, rotation: 90, zoom: 1 })).toBe(true);
    expect(hasTransform({ flipX: false, flipY: false, rotation: 0, zoom: 2 })).toBe(true);
  });
});
