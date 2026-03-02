export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface ControlState {
  lane: number;
  jump: boolean;
}

// These were missing, causing the crash!
export const LANE_WIDTH = 3.0;
export const PLAYER_SPEED_INITIAL = 15.0;
export const PLAYER_SPEED_MAX = 35.0;
export const GRAVITY = 40.0;
export const SPAWN_DISTANCE = 60.0;

export type Difficulty = 'slow' | 'fast' | 'ultrafast';

export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  slow: 15.0,
  fast: 20.0,
  ultrafast: 30.0
};
