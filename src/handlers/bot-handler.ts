import { isInRange } from "../validators/common";
import { ATTACK_STATUS, AttackReq, DamagedShipsStorage, DetectedCells, PlayerData, Position, Ship, SHIP_STATUS, SingleGameData } from "../types";
import { MessageManager } from "src/message-manager";

export class BotHandler {
    private readonly messageHandler = MessageManager.getInstance()

    public handleAtackRequest = (data: AttackReq, game: SingleGameData) => {
        const { gameId, indexPlayer, x, y } = data;

        // check that player shot in his turn
        if (!game.player.turn) return;

        const shotCoordinate: Position = { x, y };
        
        // make sure that the shot has not been fired yet
        if (this.checkPositionAlreadyShoot(shotCoordinate, game.player.detectedOpponentsCells)) return;

        this.addPositionToDetectedCellsStorage(shotCoordinate, game.player.detectedOpponentsCells);

        const damagedShip = this.getDamagedShip(shotCoordinate, game.player.ships);
        let shotStatus =  ATTACK_STATUS.miss

        if (!damagedShip) {
            this.writeCellToDetectedOpponentsCell(shotCoordinate, game.player.detectedOpponentsCells);

        }


    //    const [shotStatus, ship] = this.checkHit(shot, oppositePlayerData);
    //    // add cells around ships if it killed
    //    if (shotStatus === ATTACK_STATUS.killed && !isNullable(ship)) {
    //        this.addAroundShipCellsInShotsStorage(currentGame, oppositePlayerData, ship, shot, indexPlayer);
    //    }
    //    // define who shot next
    //    if (shotStatus === ATTACK_STATUS.miss || shotStatus === ATTACK_STATUS.killed) {
    //        this.turnHandler.reverseTurn(currentGame);
    //    }
    //    currentGame.forEach((player) => {
    //        const data = {
    //            position: shot,
    //            currentPlayer: indexPlayer,
    //            status: shotStatus,
    //        };
    //        const response = {
    //            type: TYPES_OF_MESSAGES.attack,
    //            data: JSON.stringify(data),
    //            id: 0,
    //        };
    //        this.messageManager.sendMessage(player.indexPlayer, JSON.stringify(response));
    //    });
    //    //after each attack send message about whose next turn
    //    this.turnHandler.sendTurnMessage(gameId);
    //    this.launchHandler.finishGame(currentGame);
    }
    
    private checkPositionAlreadyShoot(shotCoordinate: Position, detectedCells: DetectedCells) {
        return detectedCells.has(JSON.stringify(shotCoordinate));
    }

    private addPositionToDetectedCellsStorage(position: Position, detectedCells: DetectedCells) {
        detectedCells.add(JSON.stringify(position));
    }

    
    private writeCellToDetectedOpponentsCell(shotCoordinate: Position, detectedCells: DetectedCells) {
        detectedCells.add(JSON.stringify(shotCoordinate));
    }


    private getDamagedShip(shotCoordinate: Position, playerShips: Ship[]) {
        const damagedShip = playerShips.find((ship) => {
            let xMatch = false;
            let yMatch = false;

            if (ship.direction) {
                const yRange = { min: ship.position.y, max: ship.position.y + ship.length - 1 };
                xMatch = ship.position.x === shotCoordinate.x;
                yMatch = isInRange(shotCoordinate.y, yRange);
            } else {
                const xRange = { min: ship.position.x, max: ship.position.x + ship.length - 1 };
                xMatch = isInRange(shotCoordinate.x, xRange);
                yMatch = ship.position.y === shotCoordinate.y;
            }

            return xMatch && yMatch;
        });


                // // write in storage hit for the ship
                // this.writeHit(hit, opponentShips, i);
                // // return shot status and ship index
                // const shotResult: ShotResult = [this.getShipStatus(opponentShips, i), ship];
                // return shotResult;

        return damagedShip;
    }

    private writeHitToDmagedCells(hitCoordinates: Position, damageCells: Ship['damageCells']) {
        damageCells.add(JSON.stringify(hitCoordinates));
    }

    private updateShipStatus(ship: Ship) {
        if (ship.damageCells.size === 0) {
            ship.status = SHIP_STATUS.UNDAMAGED;
            return;
        } 
        
        if (ship.damageCells.size === ship.length) {
            ship.status = SHIP_STATUS.SUNKEN;
            return;
        }
            
        if (ship.damageCells.size > 0) {
            ship.status = SHIP_STATUS.DAMAGED;
            return;
        }
    }

    private getShipStatus(shotCoordinate: Position, ship: Ship) {
        const shotShips = ship.shotShips.get(shipIndex) as ShotShips;
         if (shotShips.hitPositions.length === ship.length) {
            return ATTACK_STATUS.killed;
        } else {
            return ATTACK_STATUS.shot;
        }
    }

    private sendAtackResultMessgage()
}
