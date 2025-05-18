export const DIRECTIONS = {
	LEFT: 'LEFT',
	RIGHT: 'RIGHT',
	UP: 'UP',
	DOWN: 'DOWN',
} as const;

export type DirectionType = keyof typeof DIRECTIONS;
