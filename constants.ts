export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface ControlState {
  lane: number; // -1, 0, 1
  jump: boolean;
}

export type Difficulty = 'slow' | 'fast' | 'ultrafast';

export const LANE_WIDTH = 2.0;
export const LANE_CENTER = 0;
export const LANE_LEFT = -LANE_WIDTH;
export const LANE_RIGHT = LANE_WIDTH;

export const PLAYER_SPEED_INITIAL = 8.0;
export const PLAYER_SPEED_MAX = 25.0;
export const JUMP_FORCE = 9.0;
export const GRAVITY = 20.0;
export const SPAWN_DISTANCE = 50.0;

// Difficulty-based initial speeds
export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  slow: 6.0,
  fast: 8.0,
  ultrafast: 12.0,
};
