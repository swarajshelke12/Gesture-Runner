import { describe, it, expect } from 'vitest';
import { DIFFICULTY_SPEEDS } from './constants';

describe('Game Constants', () => {
  it('defines correct speed progression for difficulties', () => {
    // Ensure speeds increase with difficulty
    expect(DIFFICULTY_SPEEDS.slow).toBeLessThan(DIFFICULTY_SPEEDS.fast);
    expect(DIFFICULTY_SPEEDS.fast).toBeLessThan(DIFFICULTY_SPEEDS.ultrafast);
  });

  it('has valid speed values', () => {
    expect(DIFFICULTY_SPEEDS.slow).toBeGreaterThan(0);
    expect(DIFFICULTY_SPEEDS.ultrafast).toBeLessThan(100); // Sanity check
  });
});