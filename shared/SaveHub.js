// SaveHub.js - Gerenciador Central de Saves para o Game Hub JasDEV
export class SaveHub {
    static STORAGE_KEY = 'jasdev_game_hub_saves';

    static getHubData() {
        try {
            const raw = localStorage.getItem(SaveHub.STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error('Erro ao ler SaveHub:', e);
        }
        return { activePlayer: null, players: {} };
    }

    static saveHubData(data) {
        try {
            localStorage.setItem(SaveHub.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Erro ao salvar SaveHub:', e);
        }
    }

    static getActivePlayer() {
        const data = SaveHub.getHubData();
        if (data.activePlayer && data.players[data.activePlayer]) {
            return data.players[data.activePlayer];
        }
        return null;
    }

    static setActivePlayer(playerName) {
        const data = SaveHub.getHubData();
        if (data.players[playerName]) {
            data.activePlayer = playerName;
            SaveHub.saveHubData(data);
            return true;
        }
        return false;
    }

    static createPlayer(playerName, avatar = '🎪') {
        if (!playerName) return null;
        const name = playerName.trim();
        const data = SaveHub.getHubData();

        if (!data.players[name]) {
            data.players[name] = {
                name,
                avatar,
                createdAt: Date.now(),
                games: {
                    circus: { level: 1, character: 'pomni' },
                    snake: { highScore: 0 },
                    tetris: { highScore: 0, level: 1 },
                    flappy: { highScore: 0, bestStreak: 0 }
                }
            };
        }

        data.activePlayer = name;
        SaveHub.saveHubData(data);
        return data.players[name];
    }

    static deletePlayer(playerName) {
        const data = SaveHub.getHubData();
        if (data.players[playerName]) {
            delete data.players[playerName];
            if (data.activePlayer === playerName) {
                const remaining = Object.keys(data.players);
                data.activePlayer = remaining.length > 0 ? remaining[0] : null;
            }
            SaveHub.saveHubData(data);
        }
    }

    static getGameSave(gameId, playerName = null) {
        const data = SaveHub.getHubData();
        const targetPlayer = playerName || data.activePlayer;
        if (targetPlayer && data.players[targetPlayer]) {
            return data.players[targetPlayer].games[gameId] || {};
        }
        return {};
    }

    static updateGameSave(gameId, gameData, playerName = null) {
        const data = SaveHub.getHubData();
        const targetPlayer = playerName || data.activePlayer;
        if (targetPlayer && data.players[targetPlayer]) {
            data.players[targetPlayer].games[gameId] = {
                ...(data.players[targetPlayer].games[gameId] || {}),
                ...gameData,
                lastPlayed: Date.now()
            };
            SaveHub.saveHubData(data);
            return true;
        }
        return false;
    }
}
