import { SaveHub } from './shared/SaveHub.js';
import { ThemeManager } from './shared/ThemeManager.js';

class GameHub {
    constructor() {
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
        this.activeProfileCard = document.getElementById('active-profile-card');
        this.activeAvatar = document.getElementById('active-avatar');
        this.activeName = document.getElementById('active-name');
        this.btnSwitchPlayer = document.getElementById('btn-switch-player');

        this.viewWelcome = document.getElementById('view-welcome');
        this.viewCreatePlayer = document.getElementById('view-create-player');
        this.viewGamesCatalog = document.getElementById('view-games-catalog');

        this.playersGrid = document.getElementById('players-grid');
        this.btnCreatePlayerView = document.getElementById('btn-create-player-view');

        this.inputPlayerName = document.getElementById('input-player-name');
        this.avatarGrid = document.getElementById('avatar-grid');
        this.btnCancelCreate = document.getElementById('btn-cancel-create');
        this.btnConfirmCreate = document.getElementById('btn-confirm-create');

        this.statCircusLevel = document.getElementById('stat-circus-level');
        this.statSnakeScore = document.getElementById('stat-snake-score');
        this.statTetrisScore = document.getElementById('stat-tetris-score');
        this.statFlappyScore = document.getElementById('stat-flappy-score');

        this.selectedAvatar = '🎪';

        this.initTheme();
        this.init();
    }

    initTheme() {
        const theme = ThemeManager.initAutoDetection((newTheme) => {
            this.updateThemeButtonIcon(newTheme);
        });
        this.updateThemeButtonIcon(theme);
    }

    updateThemeButtonIcon(theme) {
        this.btnThemeToggle.innerText = theme === 'dark' ? '🌙' : '☀️';
    }

    init() {
        this.initEvents();
        this.checkState();
    }

    checkState() {
        const activePlayer = SaveHub.getActivePlayer();

        if (activePlayer) {
            this.showGamesCatalog(activePlayer);
        } else {
            const data = SaveHub.getHubData();
            const playerNames = Object.keys(data.players);
            if (playerNames.length > 0) {
                // Seleciona automaticamente o primeiro jogador se houver
                SaveHub.setActivePlayer(playerNames[0]);
                this.showGamesCatalog(data.players[playerNames[0]]);
            } else {
                this.showWelcomeView();
            }
        }
    }

    hideAllViews() {
        this.viewWelcome.classList.add('hidden');
        this.viewCreatePlayer.classList.add('hidden');
        this.viewGamesCatalog.classList.add('hidden');
    }

    showWelcomeView() {
        this.hideAllViews();
        this.activeProfileCard.classList.add('hidden');
        this.renderPlayersList();
        this.viewWelcome.classList.remove('hidden');
    }

    showCreatePlayerView() {
        this.hideAllViews();
        this.inputPlayerName.value = '';
        this.viewCreatePlayer.classList.remove('hidden');
    }

    showGamesCatalog(player) {
        this.hideAllViews();
        this.activeAvatar.innerText = player.avatar || '🎪';
        this.activeName.innerText = player.name.toUpperCase();
        this.activeProfileCard.classList.remove('hidden');

        this.updateGameStats(player);
        this.viewGamesCatalog.classList.remove('hidden');
    }

    updateGameStats(player) {
        const circusSave = SaveHub.getGameSave('circus', player.name);
        const snakeSave = SaveHub.getGameSave('snake', player.name);
        const tetrisSave = SaveHub.getGameSave('tetris', player.name);
        const flappySave = SaveHub.getGameSave('flappy', player.name);

        this.statCircusLevel.innerText = `FASE ${circusSave.level || 1}`;
        this.statSnakeScore.innerText = `${snakeSave.highScore || 0} PTS`;
        this.statTetrisScore.innerText = `${tetrisSave.highScore || 0} PTS`;
        this.statFlappyScore.innerText = `${flappySave.highScore || 0} CANOS`;
    }

    renderPlayersList() {
        const data = SaveHub.getHubData();
        const players = data.players;
        this.playersGrid.innerHTML = '';

        const names = Object.keys(players);
        if (names.length === 0) {
            this.playersGrid.innerHTML = `<p style="color:#aaa; font-style:italic; grid-column: 1/-1;">Nenhum jogador criado ainda. Crie um abaixo!</p>`;
            return;
        }

        names.forEach(name => {
            const p = players[name];
            const item = document.createElement('div');
            item.className = `player-card-item ${data.activePlayer === name ? 'active' : ''}`;
            item.innerHTML = `
                <button class="btn-del-profile" title="Excluir">✕</button>
                <div class="player-card-avatar">${p.avatar || '🎪'}</div>
                <div class="player-card-name">${p.name}</div>
            `;

            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-del-profile')) {
                    e.stopPropagation();
                    SaveHub.deletePlayer(name);
                    this.renderPlayersList();
                } else {
                    SaveHub.setActivePlayer(name);
                    this.showGamesCatalog(p);
                }
            });

            this.playersGrid.appendChild(item);
        });
    }

    initEvents() {
        this.btnThemeToggle.addEventListener('click', () => {
            const nextTheme = ThemeManager.toggleTheme();
            this.updateThemeButtonIcon(nextTheme);
        });

        this.btnSwitchPlayer.addEventListener('click', () => {
            this.showWelcomeView();
        });

        this.btnCreatePlayerView.addEventListener('click', () => {
            this.showCreatePlayerView();
        });

        this.btnCancelCreate.addEventListener('click', () => {
            const activePlayer = SaveHub.getActivePlayer();
            if (activePlayer) {
                this.showGamesCatalog(activePlayer);
            } else {
                this.showWelcomeView();
            }
        });

        this.btnConfirmCreate.addEventListener('click', () => {
            const name = this.inputPlayerName.value.trim();
            if (!name) {
                alert('Por favor, digite seu nome!');
                return;
            }

            const newPlayer = SaveHub.createPlayer(name, this.selectedAvatar);
            this.showGamesCatalog(newPlayer);
        });

        // Seleção de Avatar
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                avatarOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.selectedAvatar = opt.dataset.avatar;
            });
        });
    }
}

new GameHub();
