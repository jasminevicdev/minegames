import * as THREE from 'three';
import { SceneManager2D } from './src/SceneManager2D.js';
import { Player2D } from './src/Player2D.js';
import { SoundManager } from './src/SoundManager.js';
import { BossManager } from './src/BossManager.js';
import { SaveManager } from './src/SaveManager.js';

class Game2D {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scoreDisplay = document.getElementById('score-display');
        this.livesDisplay = document.getElementById('lives-display');
        this.levelDisplay = document.getElementById('level-display');
        this.playerNameDisplay = document.getElementById('player-name-display');
        this.dialogueText = document.getElementById('dialogue-text');

        this.bossHud = document.getElementById('boss-hud');
        this.bossHealthFill = document.getElementById('boss-health-fill');

        // Overlays
        this.homeOverlay = document.getElementById('home-overlay');
        this.newPlayerOverlay = document.getElementById('new-player-overlay');
        this.selectPlayerOverlay = document.getElementById('select-player-overlay');
        this.playerPanelOverlay = document.getElementById('player-panel-overlay');
        this.characterOverlay = document.getElementById('character-overlay');

        this.levelOverlay = document.getElementById('level-overlay');
        this.winOverlay = document.getElementById('win-overlay');
        this.gameOverOverlay = document.getElementById('gameover-overlay');
        this.levelOverlayText = document.getElementById('level-overlay-text');

        // Inputs e Grids
        this.playerNameInput = document.getElementById('player-name-input');
        this.playersList = document.getElementById('players-list');
        this.characterSelector = document.getElementById('character-selector');

        // Botões Home / Novos Modais
        this.btnNewPlayer = document.getElementById('btn-new-player');
        this.btnSelectPlayer = document.getElementById('btn-select-player');
        this.btnCancelNewPlayer = document.getElementById('btn-cancel-new-player');
        this.btnConfirmNewPlayer = document.getElementById('btn-confirm-new-player');
        this.btnBackHomeFromSelect = document.getElementById('btn-back-home-from-select');

        // Botões Painel do Jogador
        this.panelPlayerName = document.getElementById('panel-player-name');
        this.panelPlayerInfo = document.getElementById('panel-player-info');
        this.btnPanelContinue = document.getElementById('btn-panel-continue');
        this.btnPanelChooseChar = document.getElementById('btn-panel-choose-char');
        this.btnPanelRestartFresh = document.getElementById('btn-panel-restart-fresh');
        this.btnPanelBack = document.getElementById('btn-panel-back');
        this.btnConfirmChar = document.getElementById('btn-confirm-char');

        // Outros Botões
        this.btnHome = document.getElementById('btn-home');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnRetry = document.getElementById('btn-retry');

        // Touch Control Buttons
        this.btnLeft = document.getElementById('btn-left');
        this.btnRight = document.getElementById('btn-right');
        this.btnJump = document.getElementById('btn-jump');
        this.btnAttack = document.getElementById('btn-attack');

        this.playerName = 'Jogador';
        this.score = 0;
        this.totalCollectibles = 8;
        this.currentLevel = 1;
        this.selectedCharacter = 'pomni';
        this.isGameActive = false;
        this.clock = new THREE.Clock();

        this.soundManager = new SoundManager();
        this.initThree();
        this.initGame();
        this.initEvents();
        this.showHomeOverlay();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 20);
        this.camera.lookAt(0, 5, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    initGame() {
        this.sceneManager = new SceneManager2D();
        this.bossManager = new BossManager(this.sceneManager.scene, this.soundManager);
        this.sceneManager.loadLevel(1);
        this.player = new Player2D(this.sceneManager.scene, this.soundManager, this.selectedCharacter);
    }

    hideAllOverlays() {
        this.homeOverlay.classList.add('hidden');
        this.newPlayerOverlay.classList.add('hidden');
        this.selectPlayerOverlay.classList.add('hidden');
        this.playerPanelOverlay.classList.add('hidden');
        this.characterOverlay.classList.add('hidden');
        this.levelOverlay.classList.add('hidden');
        this.winOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
    }

    showHomeOverlay() {
        this.isGameActive = false;
        this.hideAllOverlays();
        this.homeOverlay.classList.remove('hidden');
        this.bossHud.classList.add('hidden');
    }

    openPlayerPanel(playerName) {
        this.playerName = playerName;
        const saveData = SaveManager.getPlayerSave(playerName);

        this.panelPlayerName.innerText = `JOGADOR: ${playerName.toUpperCase()} 🎪`;

        if (saveData) {
            this.currentLevel = saveData.savedLevel || 1;
            this.selectedCharacter = saveData.selectedCharacter || 'pomni';
            this.panelPlayerInfo.innerText = `Fase Salva: ${this.currentLevel} | Personagem: ${this.selectedCharacter.toUpperCase()}`;

            if (this.currentLevel > 1) {
                this.btnPanelContinue.classList.remove('hidden');
                this.btnPanelContinue.innerText = `CONTINUAR JOGO 💾 (FASE ${this.currentLevel})`;
            } else {
                this.btnPanelContinue.classList.add('hidden');
            }
        } else {
            this.currentLevel = 1;
            this.selectedCharacter = 'pomni';
            this.panelPlayerInfo.innerText = `Fase Inicial | Personagem: POMNI`;
            this.btnPanelContinue.classList.add('hidden');
        }

        this.updateCharacterCardsUI();
        this.hideAllOverlays();
        this.playerPanelOverlay.classList.remove('hidden');
    }

    updateCharacterCardsUI() {
        const charCards = document.querySelectorAll('.char-card');
        charCards.forEach(c => {
            if (c.dataset.char === this.selectedCharacter) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });
    }

    renderPlayersList() {
        const allSaves = SaveManager.getAllSaves();
        this.playersList.innerHTML = '';

        const names = Object.keys(allSaves);
        if (names.length === 0) {
            this.playersList.innerHTML = `<p style="color:#aaa; font-style:italic;">Nenhum jogador cadastrado. Crie um novo!</p>`;
            return;
        }

        names.forEach(name => {
            const save = allSaves[name];
            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <div>
                    <div class="player-card-name">${save.playerName}</div>
                    <div class="player-card-info">Fase ${save.savedLevel} • ${save.selectedCharacter.toUpperCase()}</div>
                </div>
                <div>
                    <button class="player-card-delete" title="Excluir Jogador">🗑️</button>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('player-card-delete')) {
                    e.stopPropagation();
                    SaveManager.deletePlayer(name);
                    this.renderPlayersList();
                } else {
                    this.openPlayerPanel(name);
                }
            });

            this.playersList.appendChild(card);
        });
    }

    initEvents() {
        const handleResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 150);
        });

        // 1. Tela Home - Botões principais
        this.btnNewPlayer.addEventListener('click', () => {
            this.hideAllOverlays();
            this.playerNameInput.value = '';
            this.newPlayerOverlay.classList.remove('hidden');
        });

        this.btnSelectPlayer.addEventListener('click', () => {
            this.renderPlayersList();
            this.hideAllOverlays();
            this.selectPlayerOverlay.classList.remove('hidden');
        });

        // 2. Novo Jogador
        this.btnCancelNewPlayer.addEventListener('click', () => {
            this.showHomeOverlay();
        });

        this.btnConfirmNewPlayer.addEventListener('click', () => {
            const name = this.playerNameInput.value.trim();
            if (!name) {
                alert('Por favor, digite seu nome!');
                return;
            }
            SaveManager.saveProgress(name, 1, 'pomni');
            this.openPlayerPanel(name);
        });

        // 3. Voltar da seleção de jogadores
        this.btnBackHomeFromSelect.addEventListener('click', () => {
            this.showHomeOverlay();
        });

        // 4. Painel do Jogador
        this.btnPanelContinue.addEventListener('click', () => {
            const save = SaveManager.getPlayerSave(this.playerName);
            if (save) {
                this.currentLevel = save.savedLevel || 1;
                this.selectedCharacter = save.selectedCharacter || 'pomni';
            }
            this.startLevel(this.currentLevel);
        });

        this.btnPanelChooseChar.addEventListener('click', () => {
            this.updateCharacterCardsUI();
            this.hideAllOverlays();
            this.characterOverlay.classList.remove('hidden');
        });

        this.btnPanelRestartFresh.addEventListener('click', () => {
            this.currentLevel = 1;
            SaveManager.saveProgress(this.playerName, 1, this.selectedCharacter);
            this.startLevel(1);
        });

        this.btnPanelBack.addEventListener('click', () => {
            this.renderPlayersList();
            this.hideAllOverlays();
            this.selectPlayerOverlay.classList.remove('hidden');
        });

        // 5. Seleção de Personagem
        const charCards = document.querySelectorAll('.char-card');
        charCards.forEach(card => {
            card.addEventListener('click', () => {
                charCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedCharacter = card.dataset.char;
            });
        });

        this.btnConfirmChar.addEventListener('click', () => {
            SaveManager.saveProgress(this.playerName, this.currentLevel, this.selectedCharacter);
            this.openPlayerPanel(this.playerName);
        });

        // Modais de Fim de Fase / Win / Gameover
        this.btnNextLevel.addEventListener('click', () => {
            this.currentLevel++;
            SaveManager.saveProgress(this.playerName, this.currentLevel, this.selectedCharacter);
            this.startLevel(this.currentLevel);
        });

        this.btnRestart.addEventListener('click', () => {
            this.currentLevel = 1;
            SaveManager.saveProgress(this.playerName, 1, this.selectedCharacter);
            this.startLevel(1);
        });

        this.btnRetry.addEventListener('click', () => {
            this.startLevel(this.currentLevel);
        });

        this.btnHome.addEventListener('click', () => {
            this.showHomeOverlay();
        });

        const bindTouch = (elem, pressCallback, releaseCallback) => {
            const handleStart = (e) => { e.preventDefault(); pressCallback(); };
            const handleEnd = (e) => { e.preventDefault(); releaseCallback(); };
            elem.addEventListener('touchstart', handleStart);
            elem.addEventListener('touchend', handleEnd);
            elem.addEventListener('mousedown', handleStart);
            elem.addEventListener('mouseup', handleEnd);
        };

        bindTouch(this.btnLeft, () => { this.player.keys.left = true; }, () => { this.player.keys.left = false; });
        bindTouch(this.btnRight, () => { this.player.keys.right = true; }, () => { this.player.keys.right = false; });
        bindTouch(this.btnJump, () => {
            if (!this.player.keys.jump) this.player.jump();
            this.player.keys.jump = true;
        }, () => { this.player.keys.jump = false; });

        bindTouch(this.btnAttack, () => {
            this.player.shootPower();
        }, () => {});
    }

    startLevel(levelNumber) {
        this.soundManager.init();
        this.startOverlay.classList.add('hidden');
        this.levelOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
        this.winOverlay.classList.add('hidden');

        this.currentLevel = levelNumber;
        this.sceneManager.loadLevel(levelNumber);

        if (levelNumber === 5) {
            this.bossHud.classList.remove('hidden');
            this.bossManager.initBossArena();
            this.totalCollectibles = 0;
            this.score = 0;
        } else {
            this.bossHud.classList.add('hidden');
            this.bossManager.clearProjectiles();
            this.totalCollectibles = this.sceneManager.collectibles.length;
            this.score = 0;
        }

        if (this.player && this.player.mesh) {
            this.sceneManager.scene.remove(this.player.mesh);
            this.sceneManager.scene.remove(this.player.particles);
        }
        this.player = new Player2D(this.sceneManager.scene, this.soundManager, this.selectedCharacter);
        this.player.reset(-5, 4);

        this.isGameActive = true;
        this.updateUI();
    }

    checkCollisions() {
        if (!this.isGameActive) return;

        const pPos = this.player.position;

        if (this.currentLevel < 5) {
            this.sceneManager.collectibles.forEach(item => {
                if (item.userData.active) {
                    const dist = pPos.distanceTo(item.position);
                    if (dist < 1.4) {
                        item.userData.active = false;
                        item.visible = false;
                        this.score++;
                        this.soundManager.playCollect();
                        this.updateUI();
                    }
                }
            });
        }

        this.sceneManager.hazards.forEach(h => {
            if (h.userData.active) {
                const dist = pPos.distanceTo(h.position);
                if (dist < 1.5) {
                    if (this.player.takeDamage()) {
                        this.updateUI();
                        if (this.player.health <= 0) {
                            this.gameOver();
                        }
                    }
                }
            }
        });

        // Monstros Abstraídos: colisão com jogador e projéteis
        this.sceneManager.monsters.forEach(m => {
            if (m.userData.active) {
                // Colisão Monstro vs Jogador
                const dist = pPos.distanceTo(m.position);
                if (dist < 1.6) {
                    if (this.player.takeDamage()) {
                        this.updateUI();
                        if (this.player.health <= 0) {
                            this.gameOver();
                        }
                    }
                }

                // Colisão Monstro vs Projéteis do Jogador
                this.player.projectiles.forEach(p => {
                    if (p.userData.active) {
                        const projDist = p.position.distanceTo(m.position);
                        if (projDist < 1.5) {
                            p.userData.active = false;
                            p.visible = false;
                            m.userData.hp--;
                            this.soundManager.playCollect();

                            if (m.userData.hp <= 0) {
                                m.userData.active = false;
                                m.visible = false;
                            }
                        }
                    }
                });
            }
        });

        if (this.sceneManager.exitDoor) {
            const canExit = (this.currentLevel < 5 && this.score >= this.totalCollectibles) ||
                            (this.currentLevel === 5 && this.bossManager.health <= 0);

            if (canExit) {
                const exitBox = this.sceneManager.exitDoor.userData.bounds;
                if (pPos.x >= exitBox.minX && pPos.x <= exitBox.maxX && pPos.y >= exitBox.minY && pPos.y <= exitBox.maxY) {
                    this.completeLevel();
                }
            }
        }
    }

    updateUI() {
        this.playerNameDisplay.innerText = this.playerName;
        this.levelDisplay.innerText = `FASE ${this.currentLevel}`;
        const charName = this.selectedCharacter.toUpperCase();

        const hearts = '❤️'.repeat(Math.max(0, this.player.health));
        this.livesDisplay.innerText = hearts || '💀';

        if (this.currentLevel < 5) {
            this.scoreDisplay.innerText = `${this.score} / ${this.totalCollectibles}`;

            if (this.score === 0) {
                this.dialogueText.innerText = `Bem-vindo ao Circo da Yuk, ${this.playerName}! (${charName}) Colete todas as ${this.totalCollectibles} Cartolas Mágicas!`;
            } else if (this.score === Math.floor(this.totalCollectibles / 2)) {
                this.dialogueText.innerText = `Metade coletada, ${this.playerName}! Cuidado com os blocos glitch!`;
            } else if (this.score === this.totalCollectibles) {
                this.dialogueText.innerText = `INCRÍVEL ${this.playerName.toUpperCase()}! A PORTA DE SAÍDA ESTÁ ABERTA!`;
                this.dialogueText.style.color = "#00ff88";
            }
        } else {
            this.scoreDisplay.innerText = `BOSS`;
            const pct = Math.max(0, (this.bossManager.health / this.bossManager.maxHealth) * 100);
            this.bossHealthFill.style.width = `${pct}%`;

            if (this.bossManager.health > 0) {
                this.dialogueText.innerText = `⚠️ BATALHA FINAL! ${this.playerName}, use a tecla F / ATACAR ⚡ para destruir a Abstração e as Mini Bolhas!`;
                this.dialogueText.style.color = "#ffcc00";
            } else {
                this.dialogueText.innerText = `🏆 O CHEFÃO FOI DERROTADO! CORRA PARA A PORTA DOURADA DE SAÍDA FINAL!`;
                this.dialogueText.style.color = "#00ff88";
            }
        }
    }

    completeLevel() {
        this.isGameActive = false;
        this.soundManager.playWin();

        if (this.currentLevel < 5) {
            const nextLvl = this.currentLevel + 1;
            SaveManager.saveProgress(this.playerName, nextLvl, this.selectedCharacter);
            this.levelOverlayText.innerText = `Fase ${this.currentLevel} Concluída! Progresso salvo para a Fase ${nextLvl}!`;
            this.levelOverlay.classList.remove('hidden');
        } else {
            SaveManager.clearSave();
            this.winOverlay.classList.remove('hidden');
        }
    }

    gameOver() {
        this.isGameActive = false;
        this.bossManager.clearProjectiles();
        this.gameOverOverlay.classList.remove('hidden');
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);
        const time = this.clock.getElapsedTime();

        if (this.isGameActive) {
            this.player.update(delta, this.sceneManager.platforms, this.sceneManager.trampolines, this.sceneManager.hazards);
            this.sceneManager.update(delta, time);

            if (this.currentLevel === 5) {
                this.bossManager.update(delta, time, this.player);
                if (this.bossManager.health <= 0) {
                    this.updateUI();
                }
            }

            this.checkCollisions();

            const targetX = Math.max(0, Math.min(135, this.player.position.x + 3.0));
            const targetY = Math.max(5, this.player.position.y + 2.0);

            this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
            this.camera.lookAt(this.camera.position.x, this.camera.position.y - 1.0, 0);
        }

        this.renderer.render(this.sceneManager.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game2D();
});
