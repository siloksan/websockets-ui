import { Position } from "../types";

const DIRECTIONS = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
} as const;

type DirectionType = keyof  typeof DIRECTIONS;

type OccupiedPositions = Set<string>



interface BotState {
    opponentIsInjured: boolean;
    maxLenghtLivingShips: number;
}

// if bootState.opponentIs === true, call this function

export function getNextShoot(positionHit: Position, occupiedPosition: OccupiedPositions, botState: BotState) {
    let nextBestShoot: Position;

    Object.values(DIRECTIONS).forEach((direction) => {
        let shift = 1;
        const quantity = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.UP ? -1 : 1;
        let nextCoordinateX = positionHit.x;
        let nextCoordinateY = positionHit.y;
        let isPossibleShot = true;

        while (shift < botState.maxLenghtLivingShips && isPossibleShot) {
            if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
                nextCoordinateX = positionHit.x + (shift * quantity);
            } else {
                nextCoordinateY = positionHit.y + (shift * quantity);
            }

            const nextPosition = { x: nextCoordinateX, y: nextCoordinateY };

            if (shift === 1) {
                nextBestShoot = nextPosition;
            }

            isPossibleShot = occupiedPosition.has(JSON.stringify(nextPosition))
            shift += 1;
        }

        break;
    })

    return nextBestShoot;
}