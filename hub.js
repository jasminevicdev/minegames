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

        // Busca e Filtros
        this.inputSearch = document.getElementById('input-hub-search');
        this.searchFeedback = document.getElementById('search-feedback');
        this.searchTermDisplay = document.getElementById('search-term-display');
        this.searchCountDisplay = document.getElementById('search-count-display');
        this.btnClearSearch = document.getElementById('btn-clear-search');

        // Carrossel
        this.carouselTrack = document.getElementById('carousel-track');
        this.btnCarouselPrev = document.getElementById('btn-carousel-prev');
        this.btnCarouselNext = document.getElementById('btn-carousel-next');
        this.carouselDots = document.getElementById('carousel-dots');
        this.currentSlideIndex = 0;
        this.carouselInterval = null;

        // Categorias e Cards
        this.catPills = document.querySelectorAll('.cat-pill');
        this.categoryBlocks = document.querySelectorAll('.category-block');
        this.gameCards = document.querySelectorAll('.game-card');

        // Estatísticas
        this.statCircusLevel = document.getElementById('stat-circus-level');
        this.statSnakeScore = document.getElementById('stat-snake-score');
        this.statTetrisScore = document.getElementById('stat-tetris-score');
        this.statFlappyScore = document.getElementById('stat-flappy-score');
        this.statJasminecraftBlocks = document.getElementById('stat-jasminecraft-blocks');
        this.statMiyuEndings = document.getElementById('stat-miyu-endings');
        this.statCyberstrikeScore = document.getElementById('stat-cyberstrike-score');
        this.statTurboracerScore = document.getElementById('stat-turboracer-score');
        this.statNeonbreakerScore = document.getElementById('stat-neonbreaker-score');
        this.statMemorycircusScore = document.getElementById('stat-memorycircus-score');
        this.statCyberpongScore = document.getElementById('stat-cyberpong-score');
        this.statTowerdefenseScore = document.getElementById('stat-towerdefense-score');
        this.statAstrojumpScore = document.getElementById('stat-astrojump-score');
        this.statNinjasliceScore = document.getElementById('stat-ninjaslice-score');
        this.statNeon2048Score = document.getElementById('stat-neon2048-score');
        this.statPenaltyScore = document.getElementById('stat-penalty-score');
        this.statPacmanScore = document.getElementById('stat-pacman-score');
        this.statRhythmScore = document.getElementById('stat-rhythm-score');
        this.statDinorunScore = document.getElementById('stat-dinorun-score');
        this.statMinesweeperScore = document.getElementById('stat-minesweeper-score');
        this.statDressupScore = document.getElementById('stat-dressup-score');
        this.statMakeupScore = document.getElementById('stat-makeup-score');
        this.statNailartScore = document.getElementById('stat-nailart-score');
        this.statSpasalonScore = document.getElementById('stat-spasalon-score');
        this.statSweetbakeryScore = document.getElementById('stat-sweetbakery-score');
        this.statPetsalonScore = document.getElementById('stat-petsalon-score');
        this.statRoomdecorScore = document.getElementById('stat-roomdecor-score');
        this.statJewelryScore = document.getElementById('stat-jewelry-score');
        this.statMagicalteaScore = document.getElementById('stat-magicaltea-score');
        this.statPerfumeScore = document.getElementById('stat-perfume-score');

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
        this.initCarousel();
        this.initSearch();
        this.initCategoryFilters();
        this.checkState();

        // Expõe filtro global para o rodapé
        window.filterGames = (category) => {
            this.applyCategoryFilter(category);
            const target = document.getElementById('view-games-catalog');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        };
    }

    checkState() {
        const activePlayer = SaveHub.getActivePlayer();

        if (activePlayer) {
            this.showGamesCatalog(activePlayer);
        } else {
            const data = SaveHub.getHubData();
            const playerNames = Object.keys(data.players);
            if (playerNames.length > 0) {
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
        const jasminecraftSave = SaveHub.getGameSave('jasminecraft', player.name);
        const cyberstrikeSave = SaveHub.getGameSave('cyberstrike', player.name);
        const turboracerSave = SaveHub.getGameSave('turboracer', player.name);
        const neonbreakerSave = SaveHub.getGameSave('neonbreaker', player.name);
        const memorycircusSave = SaveHub.getGameSave('memorycircus', player.name);
        const cyberpongSave = SaveHub.getGameSave('cyberpong', player.name);
        const towerdefenseSave = SaveHub.getGameSave('towerdefense', player.name);
        const astrojumpSave = SaveHub.getGameSave('astrojump', player.name);
        const ninjasliceSave = SaveHub.getGameSave('ninjaslice', player.name);
        const neon2048Save = SaveHub.getGameSave('neon2048', player.name);
        const penaltySave = SaveHub.getGameSave('penalty', player.name);
        const pacmanSave = SaveHub.getGameSave('pacman', player.name);
        const rhythmSave = SaveHub.getGameSave('rhythm', player.name);
        const dinorunSave = SaveHub.getGameSave('dinorun', player.name);
        const minesweeperSave = SaveHub.getGameSave('minesweeper', player.name);
        const dressupSave = SaveHub.getGameSave('dressup', player.name);
        const makeupSave = SaveHub.getGameSave('makeup', player.name);
        const nailartSave = SaveHub.getGameSave('nailart', player.name);
        const spasalonSave = SaveHub.getGameSave('spasalon', player.name);
        const sweetbakerySave = SaveHub.getGameSave('sweetbakery', player.name);
        const petsalonSave = SaveHub.getGameSave('petsalon', player.name);
        const roomdecorSave = SaveHub.getGameSave('roomdecor', player.name);
        const jewelrySave = SaveHub.getGameSave('jewelry', player.name);
        const magicalteaSave = SaveHub.getGameSave('magicaltea', player.name);
        const perfumeSave = SaveHub.getGameSave('perfume', player.name);

        if (this.statCircusLevel) this.statCircusLevel.innerText = `FASE ${circusSave.level || 1}`;
        if (this.statSnakeScore) this.statSnakeScore.innerText = `${snakeSave.highScore || 0} PTS`;
        if (this.statTetrisScore) this.statTetrisScore.innerText = `${tetrisSave.highScore || 0} PTS`;
        if (this.statFlappyScore) this.statFlappyScore.innerText = `${flappySave.highScore || 0} CANOS`;
        if (this.statJasminecraftBlocks) this.statJasminecraftBlocks.innerText = `${jasminecraftSave.blocksPlaced || 0} BLOCOS`;
        if (this.statMiyuEndings) this.statMiyuEndings.innerText = `${localStorage.getItem('stat_miyu_endings') || 0}`;
        if (this.statCyberstrikeScore) this.statCyberstrikeScore.innerText = `${cyberstrikeSave.highScore || 0} PTS`;
        if (this.statTurboracerScore) this.statTurboracerScore.innerText = `${turboracerSave.highScore || 0} PTS`;
        if (this.statNeonbreakerScore) this.statNeonbreakerScore.innerText = `${neonbreakerSave.highScore || 0} PTS`;
        if (this.statMemorycircusScore) this.statMemorycircusScore.innerText = `${memorycircusSave.highScore || 0} PTS`;
        if (this.statCyberpongScore) this.statCyberpongScore.innerText = `${cyberpongSave.highScore || 0} PTS`;
        if (this.statTowerdefenseScore) this.statTowerdefenseScore.innerText = `${towerdefenseSave.highScore || 0} PTS`;
        if (this.statAstrojumpScore) this.statAstrojumpScore.innerText = `${astrojumpSave.highScore || 0}m`;
        if (this.statNinjasliceScore) this.statNinjasliceScore.innerText = `${ninjasliceSave.highScore || 0} PTS`;
        if (this.statNeon2048Score) this.statNeon2048Score.innerText = `${neon2048Save.highScore || 0} PTS`;
        if (this.statPenaltyScore) this.statPenaltyScore.innerText = `${penaltySave.highScore || 0} PTS`;
        if (this.statPacmanScore) this.statPacmanScore.innerText = `${pacmanSave.highScore || 0} PTS`;
        if (this.statRhythmScore) this.statRhythmScore.innerText = `${rhythmSave.highScore || 0} PTS`;
        if (this.statDinorunScore) this.statDinorunScore.innerText = `${dinorunSave.highScore || 0}m`;
        if (this.statMinesweeperScore) this.statMinesweeperScore.innerText = `${minesweeperSave.highScore || 0} PTS`;
        if (this.statDressupScore) this.statDressupScore.innerText = `${dressupSave.highScore || 0} ⭐`;
        if (this.statMakeupScore) this.statMakeupScore.innerText = `${makeupSave.highScore || 0} 💖`;
        if (this.statNailartScore) this.statNailartScore.innerText = `${nailartSave.highScore || 0} 💅`;
        if (this.statSpasalonScore) this.statSpasalonScore.innerText = `${spasalonSave.highScore || 0} 🌸`;
        if (this.statSweetbakeryScore) this.statSweetbakeryScore.innerText = `${sweetbakerySave.highScore || 0} 🧁`;
        if (this.statPetsalonScore) this.statPetsalonScore.innerText = `${petsalonSave.highScore || 0} 🐾`;
        if (this.statRoomdecorScore) this.statRoomdecorScore.innerText = `${roomdecorSave.highScore || 0} 🏠`;
        if (this.statJewelryScore) this.statJewelryScore.innerText = `${jewelrySave.highScore || 0} 💎`;
        if (this.statMagicalteaScore) this.statMagicalteaScore.innerText = `${magicalteaSave.highScore || 0} 🧋`;
        if (this.statPerfumeScore) this.statPerfumeScore.innerText = `${perfumeSave.highScore || 0} 🌸`;
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

    /* ================= CARROSSEL DESTAQUES ================= */
    initCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        if (!slides.length) return;

        const showSlide = (idx) => {
            this.currentSlideIndex = (idx + slides.length) % slides.length;
            slides.forEach((s, i) => s.classList.toggle('active', i === this.currentSlideIndex));
            dots.forEach((d, i) => d.classList.toggle('active', i === this.currentSlideIndex));
        };

        if (this.btnCarouselPrev) {
            this.btnCarouselPrev.addEventListener('click', () => {
                showSlide(this.currentSlideIndex - 1);
                this.resetCarouselTimer();
            });
        }

        if (this.btnCarouselNext) {
            this.btnCarouselNext.addEventListener('click', () => {
                showSlide(this.currentSlideIndex + 1);
                this.resetCarouselTimer();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                showSlide(parseInt(dot.dataset.index, 10));
                this.resetCarouselTimer();
            });
        });

        // Iniciar rotação automática (5 segundos)
        this.startCarouselTimer();

        // Pausar ao passar o mouse
        const container = document.getElementById('hero-carousel');
        if (container) {
            container.addEventListener('mouseenter', () => clearInterval(this.carouselInterval));
            container.addEventListener('mouseleave', () => this.startCarouselTimer());

            // Suporte a Touch Swipe no Celular
            let touchStartX = 0;
            let touchEndX = 0;

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                clearInterval(this.carouselInterval);
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 45) {
                    if (diff > 0) {
                        showSlide(this.currentSlideIndex + 1); // Swipe esquerda -> próximo
                    } else {
                        showSlide(this.currentSlideIndex - 1); // Swipe direita -> anterior
                    }
                }
                this.startCarouselTimer();
            }, { passive: true });
        }
    }

    startCarouselTimer() {
        clearInterval(this.carouselInterval);
        this.carouselInterval = setInterval(() => {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.carousel-dots .dot');
            if (!slides.length) return;
            this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
            slides.forEach((s, i) => s.classList.toggle('active', i === this.currentSlideIndex));
            dots.forEach((d, i) => d.classList.toggle('active', i === this.currentSlideIndex));
        }, 5000);
    }

    resetCarouselTimer() {
        this.startCarouselTimer();
    }

    /* ================= BUSCA EM TEMPO REAL ================= */
    initSearch() {
        if (!this.inputSearch) return;

        // Atalho de teclado [/]
        window.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== this.inputSearch) {
                e.preventDefault();
                this.inputSearch.focus();
                this.inputSearch.select();
            }
            if (e.key === 'Escape' && document.activeElement === this.inputSearch) {
                this.clearSearch();
            }
        });

        this.inputSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            this.performSearch(query);
        });

        if (this.btnClearSearch) {
            this.btnClearSearch.addEventListener('click', () => this.clearSearch());
        }
    }

    performSearch(query) {
        if (!query) {
            this.clearSearch();
            return;
        }

        let matchCount = 0;
        this.gameCards.forEach(card => {
            const name = card.dataset.name || '';
            const isMatch = name.toLowerCase().includes(query);
            card.classList.toggle('hidden', !isMatch);
            if (isMatch) matchCount++;
        });

        // Exibir feedback de busca
        this.searchFeedback.classList.remove('hidden');
        this.searchTermDisplay.innerText = query;
        this.searchCountDisplay.innerText = matchCount;

        // Mostrar todas as seções para exibir os cards encontrados
        this.categoryBlocks.forEach(block => block.classList.remove('hidden'));
    }

    clearSearch() {
        if (this.inputSearch) this.inputSearch.value = '';
        this.searchFeedback.classList.add('hidden');
        this.gameCards.forEach(card => card.classList.remove('hidden'));

        // Restaura a aba selecionada atual
        const activeTab = document.querySelector('.cat-pill.active');
        const filter = activeTab ? activeTab.dataset.filter : 'all';
        this.applyCategoryFilter(filter);
    }

    /* ================= FILTROS DE CATEGORIA ================= */
    initCategoryFilters() {
        this.catPills.forEach(pill => {
            if (!pill.dataset.filter) return;
            pill.addEventListener('click', () => {
                const filter = pill.dataset.filter;
                this.applyCategoryFilter(filter);
            });
        });
    }

    applyCategoryFilter(filter) {
        this.catPills.forEach(p => {
            if (!p.dataset.filter) return;
            p.classList.toggle('active', p.dataset.filter === filter);
        });

        if (filter === 'all') {
            this.categoryBlocks.forEach(b => b.classList.remove('hidden'));
            this.gameCards.forEach(c => c.classList.remove('hidden'));
        } else {
            this.categoryBlocks.forEach(b => {
                const sectionCat = b.dataset.section;
                b.classList.toggle('hidden', sectionCat !== filter);
            });
            this.gameCards.forEach(c => {
                const cats = c.dataset.category || '';
                c.classList.toggle('hidden', !cats.includes(filter));
            });
        }
    }

    initEvents() {
        this.btnThemeToggle.addEventListener('click', () => {
            const nextTheme = ThemeManager.toggleTheme();
            this.updateThemeButtonIcon(nextTheme);
        });

        // Modal Sobre JasDEV
        const modalAbout = document.getElementById('modal-about-jasdev');
        const openAbout = () => {
            if (modalAbout) modalAbout.classList.remove('hidden');
        };
        const closeAbout = () => {
            if (modalAbout) modalAbout.classList.add('hidden');
        };
        window.openAboutJasdev = openAbout;

        const btnAboutHeader = document.getElementById('btn-about-jasdev');
        const tabAbout = document.getElementById('tab-about-jasdev');
        const linkFooterAbout = document.getElementById('link-footer-about');
        const btnCloseAboutModal = document.getElementById('btn-close-about-modal');
        const btnCloseAboutAction = document.getElementById('btn-close-about-action');

        if (btnAboutHeader) btnAboutHeader.addEventListener('click', openAbout);
        if (tabAbout) tabAbout.addEventListener('click', openAbout);
        if (linkFooterAbout) {
            linkFooterAbout.addEventListener('click', (e) => {
                e.preventDefault();
                openAbout();
            });
        }
        if (btnCloseAboutModal) btnCloseAboutModal.addEventListener('click', closeAbout);
        if (btnCloseAboutAction) btnCloseAboutAction.addEventListener('click', closeAbout);
        if (modalAbout) {
            modalAbout.addEventListener('click', (e) => {
                if (e.target === modalAbout) closeAbout();
            });
        }

        const btnMobileInfo = document.getElementById('btn-mobile-info');
        if (btnMobileInfo) {
            btnMobileInfo.addEventListener('click', () => {
                alert("🌍 COMO JOGAR EM QUALQUER CELULAR (QUALQUER WI-FI OU 4G/5G):\n\nAcesse o link oficial online de qualquer lugar do mundo:\n👉 https://jasminevicdev.github.io/minegames/\n\n🏠 Ou na rede local de casa:\nhttp://192.168.1.13:3000\n\nTodos os jogos possuem controles virtuais na tela para celular!");
            });
        }

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
