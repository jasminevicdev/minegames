// SaveManager.js para o jogo Circus - Integrado ao SaveHub Central
import { SaveHub } from '../../../shared/SaveHub.js';

export class SaveManager {
    static getSaveData() {
        const active = SaveHub.getActivePlayer();
        if (!active) return null;
        const gameSave = SaveHub.getGameSave('circus', active.name);
        return {
            playerName: active.name,
            savedLevel: gameSave.level || 1,
            selectedCharacter: gameSave.character || 'pomni',
            selectedPower: gameSave.power || 'normal'
        };
    }

    static hasSaveData() {
        const data = SaveManager.getSaveData();
        return data && data.savedLevel && data.savedLevel >= 1;
    }

    static getAllSaves() {
        const data = SaveHub.getHubData();
        const saves = {};
        if (data && data.players) {
            Object.keys(data.players).forEach(name => {
                const player = data.players[name];
                const circusSave = (player.games && player.games.circus) || {};
                saves[name] = {
                    playerName: name,
                    savedLevel: circusSave.level || 1,
                    selectedCharacter: circusSave.character || 'pomni',
                    selectedPower: circusSave.power || 'normal'
                };
            });
        }
        return saves;
    }

    static getPlayerSave(playerName) {
        const activeData = SaveHub.getActivePlayer();
        const target = playerName || (activeData ? activeData.name : null);
        if (!target) return null;
        const circusSave = SaveHub.getGameSave('circus', target);
        return {
            playerName: target,
            savedLevel: circusSave.level || 1,
            selectedCharacter: circusSave.character || 'pomni',
            selectedPower: circusSave.power || 'normal'
        };
    }

    static saveProgress(playerName, levelNumber, characterType, powerType = 'normal') {
        SaveHub.createPlayer(playerName);
        SaveHub.setActivePlayer(playerName);
        return SaveHub.updateGameSave('circus', {
            level: levelNumber || 1,
            character: characterType || 'pomni',
            power: powerType
        }, playerName);
    }

    static deletePlayer(playerName) {
        SaveHub.deletePlayer(playerName);
    }
}


