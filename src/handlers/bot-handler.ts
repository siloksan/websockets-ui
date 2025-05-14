import { AttackReq, DetectedCells, PlayerData, Position, SingleGameData } from "../types";

export class BotHandler {
    public handleAtackRequest = (data: AttackReq, game: SingleGameData) => {
        const { gameId, indexPlayer, x, y } = data;

        // check that player shot in his turn
        if (!game.player.turn) return;

        const shotCoordinate: Position = { x, y };
        
        // make sure that the shot has not been fired yet
        if (this.checkPositionAlreadyShoot(shotCoordinate, game.player.detectedOpponentsCells)) return;

        this.addPositionToDetectedCellsStorage(shotCoordinate, game.player.detectedOpponentsCells)

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


    private getHitStatus(hit: Position, pl: PlayerData) {

        // for (let i = 0; i < opponentShips.ships.length; i += 1) {
        //     const ship = opponentShips.ships[i] as Ship;
        //     let xMatch = false;
        //     let yMatch = false;

        //     if (ship.direction) {
        //         xMatch = ship.position.x === hit.x;
        //     } else {
        //         const xRange = { min: ship.position.x, max: ship.position.x + ship.length - 1 };
        //         xMatch = isInRange(hit.x, xRange);
        //     }

        //     if (ship.direction) {
        //         const yRange = { min: ship.position.y, max: ship.position.y + ship.length - 1 };
        //         yMatch = isInRange(hit.y, yRange);
        //     } else {
        //         yMatch = ship.position.y === hit.y;
        //     }

        //     if (xMatch && yMatch) {
        //         // write in storage hit for the ship
        //         this.writeHit(hit, opponentShips, i);
        //         // return shot status and ship index
        //         const shotResult: ShotResult = [this.getShipStatus(opponentShips, i), ship];
        //         return shotResult;
        //     }
        // }

        // return [ATTACK_STATUS.miss];
    }
}
