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
            selectedCharacter: gameSave.character || 'pomni'
        };
    }

    static hasSaveData() {
        const data = SaveManager.getSaveData();
        return data && data.savedLevel && data.savedLevel >= 1;
    }

    static saveProgress(playerName, levelNumber, characterType) {
        return SaveHub.updateGameSave('circus', {
            level: levelNumber || 1,
            character: characterType || 'pomni'
        }, playerName);
    }

    static deletePlayer(playerName) {
        SaveHub.deletePlayer(playerName);
    }
}


