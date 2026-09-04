import * as THREE from 'three';
import { SceneManager2D } from './src/SceneManager2D.js';
import { Player2D } from './src/Player2D.js';
import { SoundManager } from './src/SoundManager.js';
import { BossManager } from './src/BossManager.js';
import { SaveManager } from './src/SaveManager.js';
import { SaveHub } from '../../shared/SaveHub.js';

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
        this.powerOverlay = document.getElementById('power-overlay');

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
        this.btnPanelChoosePower = document.getElementById('btn-panel-choose-power');
        this.btnPanelRestartFresh = document.getElementById('btn-panel-restart-fresh');
        this.btnPanelBack = document.getElementById('btn-panel-back');
        this.btnConfirmChar = document.getElementById('btn-confirm-char');
        this.btnConfirmPower = document.getElementById('btn-confirm-power');

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
        this.btnEnterDoor = document.getElementById('btn-enter-door');

        this.playerName = 'Jogador';
        this.score = 0;
        this.totalCollectibles = 8;
        this.currentLevel = 1;
        this.selectedCharacter = 'pomni';
        this.selectedPower = 'normal';
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
        // FOV adaptativo: em telas verticais (aspect < 1), aumenta o FOV para enquadrar a fase inteira sem cortes
        const fov = aspect < 1 ? Math.min(75, 50 / aspect) : 50;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
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
        this.player = new Player2D(this.sceneManager.scene, this.soundManager, this.selectedCharacter, this.selectedPower);
    }

    hideAllOverlays() {
        this.homeOverlay.classList.add('hidden');
        this.newPlayerOverlay.classList.add('hidden');
        this.selectPlayerOverlay.classList.add('hidden');
        this.playerPanelOverlay.classList.add('hidden');
        this.characterOverlay.classList.add('hidden');
        this.powerOverlay.classList.add('hidden');
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
            this.selectedPower = saveData.selectedPower || 'normal';
            this.panelPlayerInfo.innerText = `Fase Salva: ${this.currentLevel} | Personagem: ${this.selectedCharacter.toUpperCase()} | Poder: ${this.selectedPower.toUpperCase()}`;

            if (this.currentLevel > 1) {
                this.btnPanelContinue.classList.remove('hidden');
                this.btnPanelContinue.innerText = `CONTINUAR JOGO 💾 (FASE ${this.currentLevel})`;
            } else {
                this.btnPanelContinue.classList.add('hidden');
            }
        } else {
            this.currentLevel = 1;
            this.selectedCharacter = 'pomni';
            this.selectedPower = 'normal';
            this.panelPlayerInfo.innerText = `Fase Inicial | Personagem: POMNI | Poder: NORMAL`;
            this.btnPanelContinue.classList.add('hidden');
        }

        this.updateCharacterCardsUI();
        this.updatePowerCardsUI();
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

    updatePowerCardsUI() {
        const powerCards = document.querySelectorAll('#power-selector .char-card');
        powerCards.forEach(c => {
            if (c.dataset.power === this.selectedPower) {
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
            card.style.cssText = 'touch-action: manipulation; -webkit-tap-highlight-color: transparent; cursor: pointer;';
            card.innerHTML = `
                <div style="pointer-events: none;">
                    <div class="player-card-name">${save.playerName}</div>
                    <div class="player-card-info">Fase ${save.savedLevel} • ${save.selectedCharacter.toUpperCase()}</div>
                </div>
                <div>
                    <button class="player-card-delete" title="Excluir Jogador" style="pointer-events: auto;">🗑️</button>
                </div>
            `;

            const handleSelectPlayer = (e) => {
                if (e.target.classList.contains('player-card-delete')) {
                    e.stopPropagation();
                    SaveManager.deletePlayer(name);
                    this.renderPlayersList();
                } else {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    this.openPlayerPanel(name);
                }
            };

            card.addEventListener('click', handleSelectPlayer);
            card.addEventListener('touchstart', handleSelectPlayer);

            this.playersList.appendChild(card);
        });
    }

    initEvents() {
        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            this.camera.aspect = aspect;
            this.camera.fov = aspect < 1 ? Math.min(75, 50 / aspect) : 50;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 150);
        });

        // 1. Tela Home - Botões principais
        const handleOpenNewPlayer = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.hideAllOverlays();
            this.playerNameInput.value = '';
            this.newPlayerOverlay.classList.remove('hidden');
        };

        const handleOpenSelectPlayer = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.renderPlayersList();
            this.hideAllOverlays();
            this.selectPlayerOverlay.classList.remove('hidden');
        };

        this.btnNewPlayer.addEventListener('click', handleOpenNewPlayer);
        this.btnNewPlayer.addEventListener('touchstart', handleOpenNewPlayer);

        this.btnSelectPlayer.addEventListener('click', handleOpenSelectPlayer);
        this.btnSelectPlayer.addEventListener('touchstart', handleOpenSelectPlayer);

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
            this.playerName = name;
            this.selectedCharacter = 'pomni';
            this.currentLevel = 1;
            SaveManager.saveProgress(this.playerName, 1, 'pomni', 'normal');
            this.startLevel(1);
        });

        // 3. Voltar da seleção de jogadores
        this.btnBackHomeFromSelect.addEventListener('click', () => {
            this.showHomeOverlay();
        });

        // 4. Painel do Jogador
        const handlePanelContinue = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const save = SaveManager.getPlayerSave(this.playerName);
            if (save) {
                this.currentLevel = save.savedLevel || 1;
                this.selectedCharacter = save.selectedCharacter || 'pomni';
            }
            this.startLevel(this.currentLevel);
        };

        const handlePanelChooseChar = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.updateCharacterCardsUI();
            this.hideAllOverlays();
            this.characterOverlay.classList.remove('hidden');
        };

        const handlePanelRestartFresh = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.currentLevel = 1;
            SaveManager.saveProgress(this.playerName, 1, this.selectedCharacter, this.selectedPower);
            this.startLevel(1);
        };

        const handlePanelBack = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.renderPlayersList();
            this.hideAllOverlays();
            this.selectPlayerOverlay.classList.remove('hidden');
        };

        this.btnPanelContinue.addEventListener('click', handlePanelContinue);
        this.btnPanelContinue.addEventListener('touchstart', handlePanelContinue);

        this.btnPanelChooseChar.addEventListener('click', handlePanelChooseChar);
        this.btnPanelChooseChar.addEventListener('touchstart', handlePanelChooseChar);

        const handlePanelChoosePower = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.updatePowerCardsUI();
            this.hideAllOverlays();
            this.powerOverlay.classList.remove('hidden');
        };
        this.btnPanelChoosePower.addEventListener('click', handlePanelChoosePower);
        this.btnPanelChoosePower.addEventListener('touchstart', handlePanelChoosePower);

        this.btnPanelRestartFresh.addEventListener('click', handlePanelRestartFresh);
        this.btnPanelRestartFresh.addEventListener('touchstart', handlePanelRestartFresh);

        this.btnPanelBack.addEventListener('click', handlePanelBack);
        this.btnPanelBack.addEventListener('touchstart', handlePanelBack);

        // 5. Seleção de Personagem
        const charCards = document.querySelectorAll('#character-selector .char-card');
        charCards.forEach(card => {
            const handleSelectChar = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                charCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedCharacter = card.dataset.char;
            };
            card.addEventListener('click', handleSelectChar);
            card.addEventListener('touchstart', handleSelectChar);
        });

        const handleConfirmChar = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            SaveManager.saveProgress(this.playerName, this.currentLevel, this.selectedCharacter, this.selectedPower);
            this.openPlayerPanel(this.playerName);
        };
        this.btnConfirmChar.addEventListener('click', handleConfirmChar);
        this.btnConfirmChar.addEventListener('touchstart', handleConfirmChar);

        // 6. Seleção de Poder
        const powerCards = document.querySelectorAll('#power-selector .char-card');
        powerCards.forEach(card => {
            const handleSelectPower = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                powerCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedPower = card.dataset.power;
            };
            card.addEventListener('click', handleSelectPower);
            card.addEventListener('touchstart', handleSelectPower);
        });

        const handleConfirmPower = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            SaveManager.saveProgress(this.playerName, this.currentLevel, this.selectedCharacter, this.selectedPower);
            this.openPlayerPanel(this.playerName);
        };
        this.btnConfirmPower.addEventListener('click', handleConfirmPower);
        this.btnConfirmPower.addEventListener('touchstart', handleConfirmPower);

        // Modais de Fim de Fase / Win / Gameover
        this.btnNextLevel.addEventListener('click', () => {
            this.currentLevel++;
            SaveManager.saveProgress(this.playerName, this.currentLevel, this.selectedCharacter, this.selectedPower);
            this.startLevel(this.currentLevel);
        });

        this.btnRestart.addEventListener('click', () => {
            this.currentLevel = 1;
            SaveManager.saveProgress(this.playerName, 1, this.selectedCharacter, this.selectedPower);
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

        if (this.btnEnterDoor) {
            bindTouch(this.btnEnterDoor, () => {
                const canExit = (this.currentLevel < 20 && this.score >= this.totalCollectibles) ||
                                (this.currentLevel === 20 && this.bossManager.health <= 0);
                if (canExit) {
                    this.completeLevel();
                }
            }, () => {});
        }
    }

    startLevel(levelNumber) {
        this.soundManager.init();
        this.hideAllOverlays();

        this.currentLevel = levelNumber;
        this.sceneManager.loadLevel(levelNumber);

        if (levelNumber === 20) {
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

        if (this.currentLevel < 20) {
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
            const exitBox = this.sceneManager.exitDoor.userData.bounds;
            const isNearDoor = pPos.x >= exitBox.minX - 3.0 && pPos.x <= exitBox.maxX + 3.0 &&
                               pPos.y >= exitBox.minY - 3.0 && pPos.y <= exitBox.maxY + 4.0;

            if (isNearDoor) {
                if (this.btnEnterDoor) this.btnEnterDoor.classList.remove('hidden');
                // Se o jogador estiver na porta final da fase, avança imediatamente!
                this.completeLevel();
            } else {
                if (this.btnEnterDoor) this.btnEnterDoor.classList.add('hidden');
            }
        }
    }

    updateUI() {
        this.playerNameDisplay.innerText = this.playerName;
        this.levelDisplay.innerText = `FASE ${this.currentLevel} / 20`;
        const charName = this.selectedCharacter.toUpperCase();

        const hearts = '❤️'.repeat(Math.max(0, this.player.health));
        this.livesDisplay.innerText = hearts || '💀';

        if (this.currentLevel < 20) {
            this.scoreDisplay.innerText = `${this.score} / ${this.totalCollectibles}`;
            const isHard = this.currentLevel > 10;
            const hasGlitches = this.currentLevel >= 6;

            if (this.score === 0) {
                if (hasGlitches) {
                    this.dialogueText.innerText = isHard
                        ? `⚠️ FASE DIFICULTADA ${this.currentLevel}! ${this.playerName}, monstros mais rápidos e espinhos glitch a frente!`
                        : `⚠️ ATENÇÃO ${this.playerName}! A partir da FASE 6 surgem os perigos GLITCH e monstros patrulhando! Cuidado!`;
                    this.dialogueText.style.color = isHard ? "#ff2a5f" : "#ffcc00";
                } else {
                    this.dialogueText.innerText = `🎪 FASE ${this.currentLevel} FÁCIL! Bem-vindo ${this.playerName} (${charName})! Colete todas as ${this.totalCollectibles} Cartolas e avance tranquilo!`;
                    this.dialogueText.style.color = "#00d2ff";
                }
            } else if (this.score === Math.floor(this.totalCollectibles / 2)) {
                this.dialogueText.innerText = `Metade coletada na Fase ${this.currentLevel}, ${this.playerName}! Continue avançando!`;
            } else if (this.score === this.totalCollectibles) {
                this.dialogueText.innerText = `INCRÍVEL ${this.playerName.toUpperCase()}! A PORTA DE SAÍDA ESTÁ ABERTA!`;
                this.dialogueText.style.color = "#00ff88";
            }
        } else {
            this.scoreDisplay.innerText = `BOSS`;
            const pct = Math.max(0, (this.bossManager.health / this.bossManager.maxHealth) * 100);
            this.bossHealthFill.style.width = `${pct}%`;

            if (this.bossManager.health > 0) {
                this.dialogueText.innerText = `⚠️ BATALHA FINAL DO VIGÉSIMO NÍVEL! ${this.playerName}, destrua Caine e a Abstração!`;
                this.dialogueText.style.color = "#ffcc00";
            } else {
                this.dialogueText.innerText = `🏆 O CHEFÃO FINAL FOI DERROTADO! CORRA PARA A PORTA DOURADA DE SAÍDA FINAL!`;
                this.dialogueText.style.color = "#00ff88";
            }
        }
    }

    completeLevel() {
        this.isGameActive = false;
        this.soundManager.playWin();

        if (this.currentLevel < 20) {
            const nextLvl = this.currentLevel + 1;
            SaveManager.saveProgress(this.playerName, nextLvl, this.selectedCharacter, this.selectedPower);
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
            this.sceneManager.update(delta, time, this.camera.position);

            if (this.currentLevel === 20) {
                this.bossManager.update(delta, time, this.player);
                if (this.bossManager.health <= 0) {
                    this.updateUI();
                }
            }

            this.checkCollisions();

            const targetX = Math.max(0, this.player.position.x + 3.0);
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
