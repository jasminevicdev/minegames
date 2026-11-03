import * as THREE from 'three';
import { ThemeManager } from '../../../shared/ThemeManager.js';

export class SceneManager2D {
    constructor() {
        this.scene = new THREE.Scene();
        this.currentTheme = ThemeManager.initAutoDetection((theme) => {
            this.updateThemeBg(theme);
        });
        this.updateThemeBg(this.currentTheme);

        this.currentLevel = 1;
        this.platforms = [];
        this.trampolines = [];
        this.collectibles = [];
        this.hazards = [];
        this.decorations = [];
        this.monsters = [];
        this.exitDoor = null;

        this.initLights();
    }

    updateThemeBg(theme) {
        const isDark = theme === 'dark';
        const color = isDark ? 0x0a061e : 0xe0f2fe;
        this.scene.background = new THREE.Color(color);
        this.scene.fog = new THREE.FogExp2(color, 0.012);
    }

    initLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xfff5cc, 1.2);
        this.dirLight.position.set(20, 30, 20);
        this.dirLight.castShadow = true;
        this.scene.add(this.dirLight);

        this.cyanSpot = new THREE.PointLight(0x00d2ff, 2.5, 50);
        this.cyanSpot.position.set(30, 15, 10);
        this.scene.add(this.cyanSpot);

        this.redSpot = new THREE.PointLight(0xff2a5f, 2.5, 50);
        this.redSpot.position.set(70, 15, 10);
        this.scene.add(this.redSpot);
    }

    clearScene() {
        [...this.platforms, ...this.trampolines, ...this.collectibles, ...this.hazards, ...this.decorations, ...this.monsters].forEach(obj => {
            this.scene.remove(obj);
        });
        if (this.exitDoor) this.scene.remove(this.exitDoor);
        if (this.bgMesh) this.scene.remove(this.bgMesh);

        this.platforms = [];
        this.trampolines = [];
        this.collectibles = [];
        this.hazards = [];
        this.decorations = [];
        this.monsters = [];
        this.exitDoor = null;
    }

    loadLevel(levelIndex = 1) {
        this.currentLevel = levelIndex;
        this.clearScene();

        if (levelIndex === 20) {
            this.buildLevelBoss();
        } else {
            this.buildProceduralLevel(levelIndex);
        }
    }

    // Gerador Procedural Otimizado de 19 Fases + Boss Final
    buildProceduralLevel(level) {
        const isHard = level > 10;
        const difficultyFactor = isHard ? (level - 10) : 0;

        // Esquema de cores por tema de fase
        const themes = [
            0x0a061e, 0x050014, 0x18000a, 0x200028, 0x051a2e, 0x1c0f00, 0x0d2b1d
        ];
        const themeColor = themes[(level - 1) % themes.length];
        this.scene.background = new THREE.Color(themeColor);

        // Fundo em malha procedural
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#' + new THREE.Color(themeColor).getHexString();
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = isHard ? '#ff0055' : '#00d2ff';
        ctx.lineWidth = isHard ? 3 : 1.5;
        for (let i = 0; i < 512; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 2);

        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1500, 800), new THREE.MeshBasicMaterial({ map: tex }));
        this.bgMesh.position.set(300, 20, -40);
        this.scene.add(this.bgMesh);

        this.createFloatingShapes(20 + level * 2);

        // Tamanho da fase expande com o nível
        const levelLength = 100 + level * 10;
        const numPlatforms = 10 + Math.floor(level * 1.2);
        
        let currentX = -4;
        let currentY = 0;

        // Plataforma Inicial Segura
        this.createPlatform(currentX, currentY, 14, 2, 0x00d2ff);

        // Gerar plataformas e desafios sem sobreposição de movimento
        for (let i = 0; i < numPlatforms; i++) {
            // A largura diminui levemente a cada nível (ficando mais desafiador)
            const pWidth = Math.max(4.5, 9.5 - (level * 0.25));
            const pHeight = 1.5;

            const isMoving = (i % 2 === 0 && level >= 3) || isHard;
            // Limitar moveRange para movimento suave e sem colisão
            const moveRange = isMoving ? Math.min(2.8, 1.2 + Math.random() * (isHard ? 1.8 : 1.0)) : 0;

            // Progresso gradual de distância: a "intimidade" diminui (distância aumenta) a cada nível
            // Na Fase 1 o espaço base é ~4.5 unidades (confortável, não grudado). A cada fase aumenta gradativamente.
            const levelDistanceIncrease = (level - 1) * 0.4;
            const minRequiredGap = pWidth + 3.5 + levelDistanceIncrease + (moveRange * 1.3);
            const gap = minRequiredGap + Math.random() * (isHard ? 2.5 : 1.2);
            currentX += gap;
            
            currentY += (Math.random() - 0.45) * (isHard ? 4.0 : 2.5);
            currentY = Math.max(1.5, Math.min(14, currentY));

            const colors = [0xff2a5f, 0xffcc00, 0x00d2ff, 0x7000ff, 0x00ff88];
            const pColor = colors[i % colors.length];

            this.createPlatform(currentX, currentY, pWidth, pHeight, pColor, isMoving, moveRange);

            // Trampolim estratégico
            if (i % 3 === 0) {
                this.createTrampoline(currentX - pWidth / 4, currentY + pHeight / 2 + 0.1);
            }

            // Cartola Coletável
            this.createCollectible(currentX, currentY + 3.0, i + 1);

            // Perigos de Espinho / Glitch (Somente a partir da Fase 6!)
            const hasGlitches = level >= 6;
            if (hasGlitches && i > 1 && (Math.random() < (isHard ? 0.65 : 0.35))) {
                const hX = currentX + (Math.random() - 0.5) * pWidth;
                const hY = currentY - (isHard ? (2.0 + Math.random() * 2) : 2.5);
                this.createHazard(hX, hY, isHard ? 2.2 : 1.6, isHard ? 2.2 : 1.6);
            }

            // Monstros Patrulhando (Fases 1 a 5 sem monstros agressivos; Monstros Glitch surgem a partir da Fase 6)
            if (hasGlitches && i > 0 && (Math.random() < (isHard ? 0.7 : 0.35))) {
                const mX = currentX;
                const mY = currentY + 1.2;
                const monster = this.createMonster(mX, mY, isHard ? 4.5 : 3.0);
                if (isHard) {
                    monster.userData.speed += difficultyFactor * 0.35; // Monstro mais rápido
                    monster.userData.hp += Math.floor(difficultyFactor * 0.3); // Mais vida
                }
            }
        }

        // Plataforma Final Verde Firme e Porta Dourada de Saída Bem Destacada
        currentX += 8;
        const finalPlatformY = Math.max(2, Math.min(8, currentY));
        this.createPlatform(currentX, finalPlatformY, 20, 2.5, 0x00ff88);
        this.createExitDoor(currentX, finalPlatformY + 1.25);
    }

    // --- FASE 1: Tenda Principal do Circo ---
    buildLevel1() {
        this.scene.background = new THREE.Color(0x0a061e);
        const tentCanvas = document.createElement('canvas');
        tentCanvas.width = 1024; tentCanvas.height = 512;
        const ctx = tentCanvas.getContext('2d');
        const colors = ['#ff2a5f', '#181236', '#ffcc00', '#181236', '#00d2ff', '#181236'];
        for (let i = 0; i < 16; i++) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(i * 64, 0, 64, 512);
        }
        const tentTex = new THREE.CanvasTexture(tentCanvas);
        tentTex.wrapS = THREE.RepeatWrapping; tentTex.repeat.set(4, 1);

        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(250, 60), new THREE.MeshBasicMaterial({ map: tentTex }));
        this.bgMesh.position.set(60, 15, -15);
        this.scene.add(this.bgMesh);

        this.createFloatingShapes(20);
        this.createPlatform(-4, 0, 16, 2, 0x00d2ff);
        this.createPlatform(16, 2, 8, 1.5, 0xff2a5f);
        this.createPlatform(28, 4.5, 7, 1.5, 0xffcc00);
        this.createPlatform(42, 3, 10, 1.5, 0x00d2ff, true, 4);
        this.createPlatform(58, 6, 8, 1.5, 0x7000ff);
        this.createPlatform(72, 8, 7, 1.5, 0xff2a5f);
        this.createPlatform(86, 5, 9, 1.5, 0xffcc00, true, 5);
        this.createPlatform(102, 3, 16, 2, 0x00ff88);

        this.createTrampoline(20, 2.75);
        this.createTrampoline(62, 6.75);

        const itemCoords = [[0, 3.5], [16, 5.5], [28, 8.0], [42, 6.5], [58, 9.5], [72, 11.5], [86, 8.5], [100, 6.0]];
        itemCoords.forEach((c, idx) => this.createCollectible(c[0], c[1], idx + 1));

        this.createHazard(35, 2.5);
        this.createHazard(50, 7.5);
        this.createHazard(79, 4.0);

        // Monstros Abstraídos patrulhando
        this.createMonster(28, 5.5, 3);
        this.createMonster(72, 9.0, 2.5);

        this.createExitDoor(108, 4.0);
    }

    // --- FASE 2: Vazio Glitch Abstrato ---
    buildLevel2() {
        this.scene.background = new THREE.Color(0x050014);
        const glitchCanvas = document.createElement('canvas');
        glitchCanvas.width = 512; glitchCanvas.height = 512;
        const ctx = glitchCanvas.getContext('2d');
        ctx.fillStyle = '#050014'; ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2;
        for (let i = 0; i < 512; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }
        const glitchTex = new THREE.CanvasTexture(glitchCanvas);
        glitchTex.wrapS = THREE.RepeatWrapping; glitchTex.wrapT = THREE.RepeatWrapping;
        glitchTex.repeat.set(8, 2);

        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(280, 70), new THREE.MeshBasicMaterial({ map: glitchTex }));
        this.bgMesh.position.set(70, 15, -15);
        this.scene.add(this.bgMesh);

        this.createFloatingShapes(30);
        this.createPlatform(-4, 0, 14, 2, 0xff0055);
        this.createPlatform(14, 3, 6, 1.5, 0x00d2ff, true, 3);
        this.createPlatform(26, 6, 7, 1.5, 0x7000ff);
        this.createPlatform(38, 9, 6, 1.5, 0xffcc00, true, 5);
        this.createPlatform(52, 6, 8, 1.5, 0x00ff88);
        this.createPlatform(66, 10, 6, 1.5, 0xff0055, true, 4);
        this.createPlatform(80, 7, 7, 1.5, 0x00d2ff);
        this.createPlatform(94, 4, 8, 1.5, 0x7000ff, true, 6);
        this.createPlatform(112, 3, 18, 2, 0xffcc00);

        this.createTrampoline(30, 6.75);
        this.createTrampoline(70, 10.75);

        const itemCoords = [
            [0, 3.5], [14, 6.0], [26, 9.0], [38, 12.0], [52, 9.0],
            [66, 13.0], [80, 10.0], [94, 7.5], [110, 6.0], [120, 6.0]
        ];
        itemCoords.forEach((c, idx) => this.createCollectible(c[0], c[1], idx + 1));

        this.createHazard(20, 4.5);
        this.createHazard(45, 8.0);
        this.createHazard(60, 4.0);
        this.createHazard(87, 8.5);

        // Monstros Abstraídos
        this.createMonster(26, 7.0, 3);
        this.createMonster(52, 7.0, 3.5);
        this.createMonster(80, 8.0, 3);

        this.createExitDoor(122, 4.0);
    }

    // --- FASE 3: O Labirinto dos Escritórios Abstratos ---
    buildLevel3() {
        this.scene.background = new THREE.Color(0x3a3618);
        const officeCanvas = document.createElement('canvas');
        officeCanvas.width = 512; officeCanvas.height = 512;
        const ctx = officeCanvas.getContext('2d');
        ctx.fillStyle = '#eedc82'; ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 4;
        for (let i = 0; i < 512; i += 64) {
            ctx.strokeRect(i, 0, 64, 512);
        }
        const officeTex = new THREE.CanvasTexture(officeCanvas);
        officeTex.wrapS = THREE.RepeatWrapping; officeTex.repeat.set(6, 1);

        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(290, 75), new THREE.MeshBasicMaterial({ map: officeTex }));
        this.bgMesh.position.set(75, 18, -15);
        this.scene.add(this.bgMesh);

        this.createFloatingShapes(25);
        this.createPlatform(-4, 0, 15, 2, 0xd4af37);
        this.createPlatform(15, 4, 7, 1.5, 0x8b5a2b);
        this.createPlatform(28, 8, 8, 1.5, 0xd4af37, true, 4);
        this.createPlatform(44, 12, 6, 1.5, 0x00d2ff);
        this.createPlatform(58, 9, 8, 1.5, 0xff0055, true, 5);
        this.createPlatform(74, 14, 7, 1.5, 0x7000ff);
        this.createPlatform(90, 10, 8, 1.5, 0x00ff88, true, 4);
        this.createPlatform(106, 6, 8, 1.5, 0xd4af37);
        this.createPlatform(122, 4, 18, 2, 0xffcc00);

        this.createTrampoline(20, 5.75);
        this.createTrampoline(62, 10.75);

        const itemCoords = [
            [0, 3.5], [15, 7.0], [28, 11.0], [44, 15.0], [58, 12.0],
            [74, 17.0], [90, 13.0], [106, 9.0], [120, 7.0], [126, 7.0],
            [130, 7.0], [134, 7.0]
        ];
        itemCoords.forEach((c, idx) => this.createCollectible(c[0], c[1], idx + 1));

        this.createHazard(22, 5.5);
        this.createHazard(50, 10.0);
        this.createHazard(82, 12.0);

        this.createExitDoor(132, 5.0);
    }

    // --- FASE 4: O Palco dos Holofotes de Circo ---
    buildLevel4() {
        this.scene.background = new THREE.Color(0x18000a);
        const velvetCanvas = document.createElement('canvas');
        velvetCanvas.width = 512; velvetCanvas.height = 512;
        const ctx = velvetCanvas.getContext('2d');
        for (let i = 0; i < 512; i += 32) {
            ctx.fillStyle = (i / 32) % 2 === 0 ? '#800020' : '#d90429';
            ctx.fillRect(i, 0, 32, 512);
        }
        const velvetTex = new THREE.CanvasTexture(velvetCanvas);
        velvetTex.wrapS = THREE.RepeatWrapping; velvetTex.repeat.set(6, 1);

        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 80), new THREE.MeshBasicMaterial({ map: velvetTex }));
        this.bgMesh.position.set(75, 20, -15);
        this.scene.add(this.bgMesh);

        this.createFloatingShapes(40);
        this.createPlatform(-4, 0, 16, 2, 0xffcc00);
        this.createPlatform(18, 4, 7, 1.5, 0x00d2ff, true, 4);
        this.createPlatform(32, 8, 8, 1.5, 0xff0055);
        this.createPlatform(48, 12, 7, 1.5, 0x7000ff, true, 5);
        this.createPlatform(64, 9, 8, 1.5, 0x00ff88);
        this.createPlatform(80, 13, 7, 1.5, 0xffcc00, true, 6);
        this.createPlatform(96, 10, 8, 1.5, 0x00d2ff);
        this.createPlatform(112, 7, 8, 1.5, 0xff0055, true, 4);
        this.createPlatform(128, 4, 20, 2, 0x00ff88);

        this.createTrampoline(22, 5.75);
        this.createTrampoline(52, 13.75);
        this.createTrampoline(84, 14.75);

        const itemCoords = [
            [0, 3.5], [18, 7.0], [32, 11.0], [48, 15.0], [64, 12.0],
            [80, 16.0], [96, 13.0], [112, 10.0], [125, 7.0], [130, 7.0],
            [134, 7.0], [138, 7.0], [142, 7.0], [144, 7.0]
        ];
        itemCoords.forEach((c, idx) => this.createCollectible(c[0], c[1], idx + 1));

        this.createHazard(25, 6.0);
        this.createHazard(40, 10.0);
        this.createHazard(72, 11.0);

        this.createExitDoor(142, 5.0);
    }

    // --- FASE 20: A Arena Final de Batalha do Chefão (Caine & Bolha) ---
    buildLevelBoss() {
        this.scene.background = new THREE.Color(0x200028);

        // Fundo Arena do Chefão
        const arenaCanvas = document.createElement('canvas');
        arenaCanvas.width = 512; arenaCanvas.height = 512;
        const ctx = arenaCanvas.getContext('2d');
        ctx.fillStyle = '#200028'; ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 472, 472);
        const arenaTex = new THREE.CanvasTexture(arenaCanvas);

        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshBasicMaterial({ map: arenaTex }));
        this.bgMesh.position.set(10, 15, -15);
        this.scene.add(this.bgMesh);

        this.createFloatingShapes(20);

        // Plataformas da Arena do Chefão
        this.createPlatform(-8, 0, 20, 2, 0x00d2ff);
        this.createPlatform(8, 4, 8, 1.5, 0xff2a5f);
        this.createPlatform(-6, 8, 8, 1.5, 0xffcc00);
        this.createPlatform(10, 12, 8, 1.5, 0x7000ff);
        this.createPlatform(-8, 14, 8, 1.5, 0x00ff88);

        this.createTrampoline(-8, 1.0);
        this.createTrampoline(8, 5.0);

        // Porta de Saída Final Secreta (inicialmente oculta até derrotar o Chefão)
        this.createExitDoor(28, 2.0);
    }

    createFloatingShapes(count = 20) {
        for (let i = 0; i < count; i++) {
            const size = 1.0 + Math.random() * 1.5;
            const geo = Math.random() > 0.5 ? new THREE.BoxGeometry(size, size, size) : new THREE.OctahedronGeometry(size);
            const mat = new THREE.MeshStandardMaterial({
                color: [0xff2a5f, 0x00d2ff, 0xffcc00, 0x7000ff, 0x00ff88][i % 5],
                wireframe: Math.random() > 0.5,
                roughness: 0.2
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.2) * 150,
                2 + Math.random() * 25,
                -3 - Math.random() * 8
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            mesh.userData = {
                rotSpeedX: (Math.random() - 0.5) * 1.5,
                rotSpeedY: (Math.random() - 0.5) * 1.5,
                floatSpeed: 1 + Math.random() * 2,
                startY: mesh.position.y
            };
            this.scene.add(mesh);
            this.decorations.push(mesh);
        }
    }

    createPlatform(x, y, width, height, color = 0xff2a5f, isMoving = false, moveRange = 0) {
        const geo = new THREE.BoxGeometry(width, height, 1.2);
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff'; ctx.lineWidth = 8;
        for (let i = -128; i < 256; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 32, 128); ctx.stroke();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(width / 2, 1);

        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, 0);
        mesh.castShadow = true; mesh.receiveShadow = true;

        mesh.userData = {
            width, height, isMoving, startX: x, moveRange,
            bounds: { minX: x - width / 2, maxX: x + width / 2, minY: y - height / 2, maxY: y + height / 2 }
        };

        this.scene.add(mesh);
        this.platforms.push(mesh);
        return mesh;
    }

    createTrampoline(x, y) {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.2), new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
        base.position.y = 0.2; group.add(base);

        const top = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x00d2ff, emissiveIntensity: 0.5 }));
        top.position.y = 0.45; group.add(top);

        group.position.set(x, y, 0);
        group.userData = { bounds: { minX: x - 1.1, maxX: x + 1.1, minY: y, maxY: y + 0.6 } };
        this.scene.add(group);
        this.trampolines.push(group);
    }

    createCollectible(x, y, id) {
        const group = new THREE.Group();
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x181236, roughness: 0.3 });
        const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xff2a5f, emissive: 0xff2a5f, emissiveIntensity: 0.6 });

        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 16), hatMat);
        brim.position.y = 0.04; group.add(brim);

        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.48, 0.8, 16), hatMat);
        crown.position.y = 0.45; group.add(crown);

        const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.15, 16), ribbonMat);
        ribbon.position.y = 0.18; group.add(ribbon);

        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
        star.position.y = 1.0; group.add(star);

        group.position.set(x, y, 0);
        group.userData = { id, active: true, startY: y, radius: 0.8 };
        this.scene.add(group);
        this.collectibles.push(group);
    }

    createHazard(x, y, width = 1.6, height = 1.6) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 1.0),
            new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.8 })
        );
        mesh.position.set(x, y, 0);
        mesh.userData = { startX: x, startY: y, width, height, active: true };
        this.scene.add(mesh);
        this.hazards.push(mesh);
    }

    createExitDoor(x, y) {
        const doorGroup = new THREE.Group();
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(3.0, 5.0, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 0.3 })
        );
        frame.position.y = 2.5; doorGroup.add(frame);

        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 4.4, 0.3),
            new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        panel.position.set(0, 2.5, 0.2); doorGroup.add(panel);

        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.8, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xff2a5f })
        );
        sign.position.set(0, 5.2, 0.3); doorGroup.add(sign);

        doorGroup.position.set(x, y, 0);
        doorGroup.userData = { bounds: { minX: x - 1.5, maxX: x + 1.5, minY: y, maxY: y + 5.0 } };
        this.scene.add(doorGroup);
        this.exitDoor = doorGroup;
    }

    createMonster(x, y, patrolRange = 4) {
        const group = new THREE.Group();

        // Massa Interna Escura de Abstração Digital
        const darkCoreGeo = new THREE.DodecahedronGeometry(0.78, 1);
        const darkCoreMat = new THREE.MeshStandardMaterial({
            color: 0x070210,
            emissive: 0x1a0033,
            emissiveIntensity: 0.9,
            roughness: 0.4
        });
        const darkCore = new THREE.Mesh(darkCoreGeo, darkCoreMat);
        group.add(darkCore);

        // Casca Externa Glitch Poligonal
        const bodyGeo = new THREE.IcosahedronGeometry(1.05, 1);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x11052c,
            emissive: 0xff0055,
            emissiveIntensity: 0.85,
            roughness: 0.2,
            wireframe: true
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Múltiplos Olhos Abstraídos Brilhantes Espalhados pela Criatura
        const eyeColors = [0xff2a5f, 0xffd60a, 0x00f5d4, 0x00e676, 0xff006e, 0x38bdf8];
        const eyePositions = [
            [0.45, 0.35, 0.65],
            [-0.45, 0.4, 0.62],
            [0.0, -0.35, 0.72],
            [0.65, -0.15, 0.45],
            [-0.6, -0.2, 0.48],
            [0.1, 0.68, 0.42]
        ];

        eyePositions.forEach((pos, idx) => {
            const eyeGroup = new THREE.Group();
            const iris = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 10, 10),
                new THREE.MeshBasicMaterial({ color: eyeColors[idx % eyeColors.length] })
            );
            const pupil = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x000000 })
            );
            pupil.position.z = 0.14;
            eyeGroup.add(iris, pupil);
            eyeGroup.position.set(pos[0], pos[1], pos[2]);
            group.add(eyeGroup);
        });

        group.position.set(x, y + 1.0, 0);
        group.userData = {
            startX: x,
            patrolRange,
            speed: 2.0,
            direction: 1,
            hp: 2,
            active: true,
            radius: 1.0
        };

        this.scene.add(group);
        this.monsters.push(group);
        return group;
    }

    update(delta, time, cameraPos) {
        if (this.bgMesh && cameraPos) {
            this.bgMesh.position.x = cameraPos.x;
            this.bgMesh.position.y = cameraPos.y;
        }

        this.decorations.forEach(d => {
            d.rotation.x += d.userData.rotSpeedX * delta;
            d.rotation.y += d.userData.rotSpeedY * delta;
            d.position.y = d.userData.startY + Math.sin(time * d.userData.floatSpeed) * 0.8;
        });

        this.platforms.forEach((p, idx) => {
            if (p.userData.isMoving) {
                // Sentido de oscilação individual
                if (p.userData.direction === undefined) p.userData.direction = 1;
                p.position.x += p.userData.direction * 3.0 * delta;

                if (Math.abs(p.position.x - p.userData.startX) > p.userData.moveRange) {
                    p.userData.direction *= -1;
                }

                // Colisão de blocos entre plataformas vizinhas (rebatimento)
                for (let j = idx + 1; j < this.platforms.length; j++) {
                    const other = this.platforms[j];
                    const distHorizontal = Math.abs(p.position.x - other.position.x);
                    const distVertical = Math.abs(p.position.y - other.position.y);
                    const minDistX = (p.userData.width + other.userData.width) / 2 + 0.5;
                    const minDistY = (p.userData.height + other.userData.height) / 2 + 0.2;

                    if (distHorizontal < minDistX && distVertical < minDistY) {
                        // Se houver contato/colisão, inverte o movimento dos blocos imediatamente!
                        p.userData.direction *= -1;
                        if (other.userData.isMoving) {
                            if (other.userData.direction === undefined) other.userData.direction = -1;
                            other.userData.direction *= -1;
                        }
                    }
                }

                p.userData.bounds.minX = p.position.x - p.userData.width / 2;
                p.userData.bounds.maxX = p.position.x + p.userData.width / 2;
            }
        });

        this.collectibles.forEach(c => {
            if (c.userData.active) {
                c.rotation.y += delta * 2.0;
                c.position.y = c.userData.startY + Math.sin(time * 3 + c.userData.id) * 0.25;
            }
        });

        this.hazards.forEach(h => {
            const scale = 1.0 + Math.sin(time * 6) * 0.15;
            h.scale.set(scale, scale, scale);
        });

        this.monsters.forEach(m => {
            if (m.userData.active) {
                m.position.x += m.userData.speed * m.userData.direction * delta;
                if (Math.abs(m.position.x - m.userData.startX) > m.userData.patrolRange) {
                    m.userData.direction *= -1;
                }
                m.rotation.y += delta * 3.0;
                m.rotation.z += delta * 1.5;
            }
        });
    }
}
