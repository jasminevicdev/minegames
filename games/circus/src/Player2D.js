import * as THREE from 'three';

export class Player2D {
    constructor(scene, soundManager, characterType = 'pomni', powerType = 'normal') {
        this.scene = scene;
        this.soundManager = soundManager;
        this.characterType = characterType;
        this.powerType = powerType;

        this.position = new THREE.Vector3(0, 4, 0);
        this.velocity = new THREE.Vector2(0, 0);
        this.speed = 16.0;
        this.jumpForce = 17.5;
        this.gravity = 42.0;
        this.isGrounded = false;
        this.maxJumps = 2;
        this.jumpsLeft = 2;
        this.facingRight = true;
        this.health = 3;
        this.maxHealth = 3;
        this.invulnerableTimer = 0;

        this.width = 1.4;
        this.height = 2.0;

        // Teclas de controle
        this.keys = {
            left: false,
            right: false,
            jump: false,
            attack: false
        };

        this.projectiles = [];
        this.shootCooldown = 0;

        this.applyCharacterStats();
        this.createMesh();
        this.createParticles();
        this.initListeners();
    }

    applyCharacterStats() {
        switch (this.characterType) {
            case 'jax':
                this.speed = 20.0;
                this.jumpForce = 18.0;
                this.maxHealth = 3;
                break;
            case 'kinger':
                this.speed = 15.0;
                this.jumpForce = 21.0;
                this.maxHealth = 3;
                break;
            case 'gangle':
                this.speed = 15.5;
                this.jumpForce = 17.0;
                this.gravity = 32.0;
                this.maxHealth = 3;
                break;
            case 'zooble':
                this.speed = 14.5;
                this.jumpForce = 16.5;
                this.maxHealth = 4;
                break;
            case 'caine':
                this.speed = 17.0;
                this.jumpForce = 18.5;
                this.maxJumps = 3;
                this.maxHealth = 3;
                break;
            case 'bubble':
                this.speed = 18.5;
                this.jumpForce = 18.0;
                this.maxHealth = 3;
                break;
            case 'pomni':
            default:
                this.speed = 16.5;
                this.jumpForce = 17.5;
                this.maxHealth = 3;
                break;
        }
        this.health = this.maxHealth;
        this.jumpsLeft = this.maxJumps;

        // Aplica os modificadores do Poder Especial
        if (this.powerType === 'speed') {
            this.speed *= 1.5;
        } else if (this.powerType === 'jump') {
            this.jumpForce *= 1.25;
            this.gravity *= 0.85;
        } else if (this.powerType === 'shield') {
            this.maxHealth += 3;
            this.health = this.maxHealth;
        }
    }

    static drawCharacterOnCanvas(canvas, characterType = 'pomni') {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        ctx.scale(w / 256, h / 256);

        const type = (characterType || 'pomni').toLowerCase();
        switch (type) {
            case 'jax': Player2D.drawJaxStatic(ctx); break;
            case 'kinger': Player2D.drawKingerStatic(ctx); break;
            case 'gangle': Player2D.drawGangleStatic(ctx); break;
            case 'zooble': Player2D.drawZoobleStatic(ctx); break;
            case 'caine': Player2D.drawCaineStatic(ctx); break;
            case 'bubble': Player2D.drawBubbleStatic(ctx); break;
            case 'pomni': default: Player2D.drawPomniStatic(ctx); break;
        }

        ctx.restore();
    }

    createCharacterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        Player2D.drawCharacterOnCanvas(canvas, this.characterType);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    // =========================================================================
    // 1. POMNI — A Boba da Corte Digital (Touca Bicolor, Olhos Catavento, Gola Rufada, Luvas, Sapatos com Pompom)
    // =========================================================================
    static drawPomniStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Sombra suave de destaque
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 8;

        // --- PERNAS E SAPATOS DE BOBO DA CORTE ---
        // Perna Esquerda (Listrada Vermelho/Branco)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(102, 205, 16, 28);
        ctx.fillStyle = '#ff1e56';
        ctx.fillRect(102, 211, 16, 7);
        ctx.fillRect(102, 223, 16, 7);

        // Perna Direita (Listrada Azul/Branco)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(138, 205, 16, 28);
        ctx.fillStyle = '#00b4d8';
        ctx.fillRect(138, 211, 16, 7);
        ctx.fillRect(138, 223, 16, 7);

        // Sapatos Pontudos Curvados
        ctx.fillStyle = '#ff1e56';
        ctx.beginPath();
        ctx.moveTo(118, 230);
        ctx.quadraticCurveTo(92, 232, 82, 222);
        ctx.quadraticCurveTo(88, 242, 118, 240);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#00b4d8';
        ctx.beginPath();
        ctx.moveTo(138, 230);
        ctx.quadraticCurveTo(164, 232, 174, 222);
        ctx.quadraticCurveTo(168, 242, 138, 240);
        ctx.closePath();
        ctx.fill();

        // Pompons dourados na ponta dos sapatos
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(81, 221, 5.5, 0, Math.PI * 2);
        ctx.arc(175, 221, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // --- TRAJE BUFANTE BICOLOR (CORPO) ---
        // Metade Esquerda Vermelha
        const redGrad = ctx.createLinearGradient(80, 140, 128, 215);
        redGrad.addColorStop(0, '#ff2a5f');
        redGrad.addColorStop(1, '#c9184a');
        ctx.fillStyle = redGrad;
        ctx.beginPath();
        ctx.arc(128, 176, 44, Math.PI * 0.5, Math.PI * 1.5);
        ctx.fill();

        // Metade Direita Azul
        const blueGrad = ctx.createLinearGradient(128, 140, 176, 215);
        blueGrad.addColorStop(0, '#00d2ff');
        blueGrad.addColorStop(1, '#0077b6');
        ctx.fillStyle = blueGrad;
        ctx.beginPath();
        ctx.arc(128, 176, 44, Math.PI * 1.5, Math.PI * 0.5);
        ctx.fill();

        // Detalhes de Losangos no Macacão
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(106, 165); ctx.lineTo(114, 176); ctx.lineTo(106, 187); ctx.lineTo(98, 176); ctx.closePath();
        ctx.moveTo(150, 165); ctx.lineTo(158, 176); ctx.lineTo(150, 187); ctx.lineTo(142, 176); ctx.closePath();
        ctx.fill();

        // Contorno do traje
        ctx.strokeStyle = '#1e1b2e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(128, 176, 44, 0, Math.PI * 2);
        ctx.stroke();

        // Botões Pompom Amarelos no Centro do Peito
        for (const by of [162, 186]) {
            const btnGrad = ctx.createRadialGradient(126, by - 2, 1, 128, by, 9);
            btnGrad.addColorStop(0, '#fff3b0');
            btnGrad.addColorStop(0.6, '#ffcc00');
            btnGrad.addColorStop(1, '#d97706');
            ctx.fillStyle = btnGrad;
            ctx.beginPath();
            ctx.arc(128, by, 8.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // --- MANGAS BUFANTES E LUVAS ---
        // Manga Esquerda (Azul/Amarela) + Luva Vermelha
        ctx.fillStyle = '#00b4d8';
        ctx.beginPath(); ctx.arc(82, 160, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff1e56';
        ctx.beginPath(); ctx.roundRect(62, 168, 18, 26, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(71, 192, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Manga Direita (Vermelha/Amarela) + Luva Azul
        ctx.fillStyle = '#ff1e56';
        ctx.beginPath(); ctx.arc(174, 160, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00b4d8';
        ctx.beginPath(); ctx.roundRect(176, 168, 18, 26, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(185, 192, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // --- GOLA RUFADA DE PALHAÇO (COLARINHO PREGUEADO) ---
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e1b2e';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 7; i++) {
            const rx = 86 + i * 14;
            const ry = 142 + Math.sin((i / 6) * Math.PI) * 5;
            ctx.beginPath();
            ctx.ellipse(rx, ry, 10, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // --- CABEÇA E CABELO CASTANHO ---
        // Rosto Pálido Suave
        const faceGrad = ctx.createRadialGradient(122, 96, 8, 128, 104, 44);
        faceGrad.addColorStop(0, '#ffffff');
        faceGrad.addColorStop(0.75, '#fff0e5');
        faceGrad.addColorStop(1, '#f3d5c0');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.arc(128, 104, 43, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2b192e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Mechas Laterais e Franja do Cabelo Castanho Escuro
        ctx.fillStyle = '#3d1e1e';
        // Mecha esquerda
        ctx.beginPath();
        ctx.moveTo(86, 82);
        ctx.quadraticCurveTo(76, 106, 84, 128);
        ctx.quadraticCurveTo(93, 114, 94, 92);
        ctx.closePath();
        ctx.fill();
        // Mecha direita
        ctx.beginPath();
        ctx.moveTo(170, 82);
        ctx.quadraticCurveTo(180, 106, 172, 128);
        ctx.quadraticCurveTo(163, 114, 162, 92);
        ctx.closePath();
        ctx.fill();
        // Franja central repartida
        ctx.beginPath();
        ctx.moveTo(92, 78);
        ctx.quadraticCurveTo(108, 92, 120, 76);
        ctx.quadraticCurveTo(128, 90, 136, 76);
        ctx.quadraticCurveTo(148, 92, 164, 78);
        ctx.lineTo(158, 66);
        ctx.lineTo(98, 66);
        ctx.closePath();
        ctx.fill();

        // --- OLHOS GIGANTES COM ÍRIS DE CATAVENTO (PINWHEEL EYES) ---
        const drawPinwheelEye = (ex, ey) => {
            // Esclera branca
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(ex, ey, 15.5, 19.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1e1b2e';
            ctx.lineWidth = 2.8;
            ctx.stroke();

            // Íris dividida em setores Vermelho e Azul (Catavento)
            const segments = 6;
            for (let s = 0; s < segments; s++) {
                const a0 = (s / segments) * Math.PI * 2;
                const a1 = ((s + 1) / segments) * Math.PI * 2;
                ctx.fillStyle = s % 2 === 0 ? '#ff1e56' : '#00b4d8';
                ctx.beginPath();
                ctx.moveTo(ex, ey);
                ctx.arc(ex, ey, 10.5, a0, a1);
                ctx.closePath();
                ctx.fill();
            }

            // Anel da íris e pupila
            ctx.strokeStyle = '#1e1b2e';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(ex, ey, 10.5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#110b1a';
            ctx.beginPath();
            ctx.arc(ex, ey, 3.8, 0, Math.PI * 2);
            ctx.fill();

            // Brilhos especulares duplos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - 4, ey - 5, 3.8, 0, Math.PI * 2);
            ctx.arc(ex + 4, ey + 4, 2.0, 0, Math.PI * 2);
            ctx.fill();

            // Cílios inferiores/superiores característicos da Pomni
            ctx.strokeStyle = '#1e1b2e';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(ex - 14, ey - 10); ctx.lineTo(ex - 18, ey - 14);
            ctx.moveTo(ex + 14, ey - 10); ctx.lineTo(ex + 18, ey - 14);
            ctx.moveTo(ex - 12, ey + 14); ctx.lineTo(ex - 15, ey + 18);
            ctx.moveTo(ex + 12, ey + 14); ctx.lineTo(ex + 15, ey + 18);
            ctx.stroke();
        };

        drawPinwheelEye(107, 102);
        drawPinwheelEye(149, 102);

        // Sobrancelhas preocupadas/expressivas
        ctx.strokeStyle = '#3d1e1e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(94, 82); ctx.quadraticCurveTo(106, 78, 116, 84);
        ctx.moveTo(162, 82); ctx.quadraticCurveTo(150, 78, 140, 84);
        ctx.stroke();

        // Bochechas Coradas (Blush Rosa)
        ctx.fillStyle = 'rgba(255, 42, 95, 0.38)';
        ctx.beginPath();
        ctx.ellipse(91, 118, 8.5, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(165, 118, 8.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sorriso Tímido / Nervoso Fofo
        ctx.strokeStyle = '#2b192e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(117, 126);
        ctx.quadraticCurveTo(123, 131, 128, 127);
        ctx.quadraticCurveTo(133, 131, 139, 126);
        ctx.stroke();

        // --- CHAPÉU DE BOBO DA CORTE BICOLOR COM SINOS DOURADOS ---
        // Ponta Esquerda (Vermelha)
        const hatLeftGrad = ctx.createLinearGradient(30, 30, 128, 75);
        hatLeftGrad.addColorStop(0, '#c9184a');
        hatLeftGrad.addColorStop(1, '#ff2a5f');
        ctx.fillStyle = hatLeftGrad;
        ctx.beginPath();
        ctx.moveTo(128, 72);
        ctx.quadraticCurveTo(95, 25, 32, 58);
        ctx.quadraticCurveTo(68, 52, 88, 76);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e1b2e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Ponta Direita (Azul)
        const hatRightGrad = ctx.createLinearGradient(128, 75, 226, 30);
        hatRightGrad.addColorStop(0, '#00d2ff');
        hatRightGrad.addColorStop(1, '#0077b6');
        ctx.fillStyle = hatRightGrad;
        ctx.beginPath();
        ctx.moveTo(128, 72);
        ctx.quadraticCurveTo(161, 25, 224, 58);
        ctx.quadraticCurveTo(188, 52, 168, 76);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Faixa da Base do Chapéu com Detalhes Dourados
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.roundRect(86, 65, 84, 11, 5);
        ctx.fill();
        ctx.stroke();

        // Sinos Dourados nas Pontas do Chapéu
        for (const [bx, by] of [[30, 60], [226, 60]]) {
            const bellGrad = ctx.createRadialGradient(bx - 3, by - 3, 2, bx, by, 12);
            bellGrad.addColorStop(0, '#ffffff');
            bellGrad.addColorStop(0.4, '#ffd700');
            bellGrad.addColorStop(1, '#b45309');
            ctx.fillStyle = bellGrad;
            ctx.beginPath();
            ctx.arc(bx, by, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Fenda ressonante do sino
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.arc(bx, by + 3, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(bx - 1, by - 3, 2, 6);
        }
    }

    // =========================================================================
    // 2. JAX — O Coelho Roxo Sarcástico (Orelhas Longas, Macacão Jeans Rosa com Bolso/Botões, Luvas Amarelas, Sorriso Largo)
    // =========================================================================
    static drawJaxStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 8;

        // --- PERNAS COMPRIDAS E PÉS DE COELHO ---
        ctx.fillStyle = '#e04088';
        ctx.strokeStyle = '#1e1035';
        ctx.lineWidth = 3;
        ctx.fillRect(102, 200, 18, 32);
        ctx.strokeRect(102, 200, 18, 32);
        ctx.fillRect(136, 200, 18, 32);
        ctx.strokeRect(136, 200, 18, 32);

        // Pés roxos alongados
        ctx.fillStyle = '#9d4edd';
        ctx.beginPath();
        ctx.ellipse(104, 236, 16, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(152, 236, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // --- BRAÇOS ROXOS E LUVAS AMARELAS DE CARTOON ---
        ctx.strokeStyle = '#7b2cbf';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(96, 152); ctx.quadraticCurveTo(68, 168, 72, 192);
        ctx.moveTo(160, 152); ctx.quadraticCurveTo(188, 168, 184, 192);
        ctx.stroke();

        // Luvas Amarelas Clássicas
        for (const [gx, gy] of [[72, 195], [184, 195]]) {
            const gloveGrad = ctx.createRadialGradient(gx - 2, gy - 2, 2, gx, gy, 14);
            gloveGrad.addColorStop(0, '#fff799');
            gloveGrad.addColorStop(0.6, '#ffd60a');
            gloveGrad.addColorStop(1, '#e09f00');
            ctx.fillStyle = gloveGrad;
            ctx.strokeStyle = '#1e1035';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.arc(gx, gy, 12.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 3 traços clássicos no dorso da luva
            ctx.strokeStyle = '#5c4000';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(gx - 4, gy - 4); ctx.lineTo(gx - 4, gy + 5);
            ctx.moveTo(gx, gy - 5); ctx.lineTo(gx, gy + 5);
            ctx.moveTo(gx + 4, gy - 4); ctx.lineTo(gx + 4, gy + 5);
            ctx.stroke();
        }

        // --- TORSO ROXO E MACACÃO ROSA/MAGENTA COM ALÇAS E BOLSO ---
        ctx.fillStyle = '#9d4edd';
        ctx.strokeStyle = '#1e1035';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(96, 134, 64, 72, 18);
        ctx.fill();
        ctx.stroke();

        // Corpo do Macacão Rosa
        const overallGrad = ctx.createLinearGradient(96, 145, 160, 212);
        overallGrad.addColorStop(0, '#ff5ca8');
        overallGrad.addColorStop(1, '#d81b60');
        ctx.fillStyle = overallGrad;
        ctx.beginPath();
        ctx.roundRect(96, 152, 64, 58, [6, 6, 18, 18]);
        ctx.fill();
        ctx.stroke();

        // Alças do Macacão
        ctx.fillRect(102, 134, 13, 24);
        ctx.strokeRect(102, 134, 13, 24);
        ctx.fillRect(141, 134, 13, 24);
        ctx.strokeRect(141, 134, 13, 24);

        // Botões Amarelos do Macacão
        ctx.fillStyle = '#ffd60a';
        ctx.beginPath();
        ctx.arc(108.5, 154, 5.5, 0, Math.PI * 2);
        ctx.arc(147.5, 154, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bolso Central Costurado no Peito
        ctx.fillStyle = '#c2185b';
        ctx.beginPath();
        ctx.roundRect(114, 166, 28, 22, [3, 3, 10, 10]);
        ctx.fill();
        ctx.strokeStyle = '#ff99c8';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // --- ORELHAS LONGAS DE COELHO ---
        const drawEar = (ex, ey, angle) => {
            ctx.save();
            ctx.translate(ex, ey);
            ctx.rotate(angle);

            // Parte externa roxa
            ctx.fillStyle = '#9d4edd';
            ctx.strokeStyle = '#1e1035';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, -34, 13, 38, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Interior rosa suave
            ctx.fillStyle = '#ff85c0';
            ctx.beginPath();
            ctx.ellipse(0, -32, 6.5, 28, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        drawEar(105, 68, -0.18);
        drawEar(151, 68, 0.18);

        // --- CABEÇA ROXA ---
        const headGrad = ctx.createRadialGradient(120, 88, 8, 128, 98, 44);
        headGrad.addColorStop(0, '#c77dff');
        headGrad.addColorStop(0.7, '#9d4edd');
        headGrad.addColorStop(1, '#7b2cbf');
        ctx.fillStyle = headGrad;
        ctx.strokeStyle = '#1e1035';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(128, 98, 44, 39, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // --- OLHOS AMARELOS COM PUPILAS RETANGULARES E PÁLPEBRAS SARCÁSTICAS ---
        for (const ex of [110, 146]) {
            ctx.fillStyle = '#ffe600';
            ctx.beginPath();
            ctx.ellipse(ex, 90, 13, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pupila retangular vertical estilo Pac-Man/Cartoon
            ctx.fillStyle = '#0f071e';
            ctx.fillRect(ex - 3.5, 84, 7, 13);

            // Brilho no olho
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - 3, 85, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Pálpebra superior roxa semi-cerrada (expressão marota do Jax)
            ctx.fillStyle = '#7b2cbf';
            ctx.beginPath();
            ctx.arc(ex, 90, 13, Math.PI * 1.05, Math.PI * 1.95);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Sobrancelhas arqueadas travessas
        ctx.strokeStyle = '#1e1035';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(95, 72); ctx.quadraticCurveTo(108, 66, 120, 75);
        ctx.moveTo(161, 72); ctx.quadraticCurveTo(148, 66, 136, 75);
        ctx.stroke();

        // --- SORRISO LARGO DE ORELHA A ORELHA COM DENTES MARCADOS ---
        ctx.fillStyle = '#fffef2';
        ctx.strokeStyle = '#1e1035';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(94, 108);
        ctx.quadraticCurveTo(128, 118, 162, 108);
        ctx.quadraticCurveTo(156, 133, 128, 133);
        ctx.quadraticCurveTo(100, 133, 94, 108);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Divisórias verticais dos dentes do Jax
        ctx.lineWidth = 2.2;
        for (const tx of [106, 117, 128, 139, 150]) {
            ctx.beginPath();
            ctx.moveTo(tx, 111);
            ctx.lineTo(tx, 131);
            ctx.stroke();
        }
    }

    // =========================================================================
    // 3. KINGER — O Rei de Xadrez Real (Peça de Madeira Torneada, Manto Imperial com Arminho, Olhos Assimetricamente Esbugalhados, Mãos Flutuantes)
    // =========================================================================
    static drawKingerStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.48)';
        ctx.shadowBlur = 8;

        // --- MANTO IMPERIAL DE VELUDO ROXO ---
        const robeGrad = ctx.createLinearGradient(68, 128, 188, 240);
        robeGrad.addColorStop(0, '#7b2cbf');
        robeGrad.addColorStop(0.5, '#5a189a');
        robeGrad.addColorStop(1, '#3c096c');
        ctx.fillStyle = robeGrad;
        ctx.strokeStyle = '#19002e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(96, 132);
        ctx.quadraticCurveTo(64, 175, 68, 236);
        ctx.lineTo(188, 236);
        ctx.quadraticCurveTo(192, 175, 160, 132);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Dobras verticais do manto real
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(106, 150); ctx.lineTo(90, 232);
        ctx.moveTo(150, 150); ctx.lineTo(166, 232);
        ctx.stroke();

        // --- BORDAS E GOLA DE ARMINHO REAL (PELÚCIA BRANCA COM PINTAS PRETAS) ---
        ctx.fillStyle = '#fffdf7';
        ctx.strokeStyle = '#19002e';
        ctx.lineWidth = 2.5;

        // Faixa central vertical de arminho
        ctx.beginPath();
        ctx.roundRect(118, 142, 20, 94, 6);
        ctx.fill();
        ctx.stroke();

        // Barra inferior de arminho
        ctx.beginPath();
        ctx.roundRect(64, 224, 128, 16, 8);
        ctx.fill();
        ctx.stroke();

        // Gola real fofa de arminho nos ombros
        ctx.beginPath();
        ctx.ellipse(128, 138, 42, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pintinhas pretas clássicas da pele de arminho real
        ctx.fillStyle = '#19002e';
        const spots = [
            [98, 138], [114, 141], [142, 141], [158, 138],
            [128, 162], [125, 184], [131, 206],
            [80, 232], [104, 232], [128, 232], [152, 232], [176, 232]
        ];
        for (const [sx, sy] of spots) {
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Broche Dourado com Joia Rubi no Pescoço
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(128, 142, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff0055';
        ctx.beginPath(); ctx.arc(128, 142, 5, 0, Math.PI * 2); ctx.fill();

        // --- CABEÇA DE PEÇA DE XADREZ DE MADEIRA ESCULPIDA ---
        const woodGrad = ctx.createLinearGradient(88, 60, 168, 130);
        woodGrad.addColorStop(0, '#ffedd8');
        woodGrad.addColorStop(0.5, '#e6ccb2');
        woodGrad.addColorStop(1, '#b08968');
        ctx.fillStyle = woodGrad;
        ctx.strokeStyle = '#3d2516';
        ctx.lineWidth = 3;

        // Colar/anel torneado da peça
        ctx.beginPath();
        ctx.ellipse(128, 124, 34, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Corpo da cabeça de Rei de Xadrez
        ctx.beginPath();
        ctx.moveTo(96, 122);
        ctx.quadraticCurveTo(88, 86, 98, 68);
        ctx.lineTo(158, 68);
        ctx.quadraticCurveTo(168, 86, 160, 122);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Topo da Coroa de Madeira + Cruz Dourada no Topo
        ctx.beginPath();
        ctx.ellipse(128, 68, 34, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cruz Real Dourada no Topo
        const goldGrad = ctx.createLinearGradient(112, 24, 144, 62);
        goldGrad.addColorStop(0, '#fff3b0');
        goldGrad.addColorStop(0.5, '#ffd700');
        goldGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = goldGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(122, 24, 12, 38, 4);
        ctx.roundRect(110, 34, 36, 12, 4);
        ctx.fill();
        ctx.stroke();

        // --- OLHOS ESBUGALHADOS E ASSIMÉTRICOS (MARCA REGISTRADA DO KINGER) ---
        // Olho Esquerdo (Gigante Esbugalhado)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#19002e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(105, 96, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Olho Direito (Ligeiramente menor e mais alto, olhar assustado/cômico)
        ctx.beginPath();
        ctx.arc(151, 91, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Veias sutis de nervosismo nos olhos
        ctx.strokeStyle = 'rgba(255, 60, 100, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(88, 92); ctx.lineTo(94, 95);
        ctx.moveTo(164, 88); ctx.lineTo(159, 91);
        ctx.stroke();

        // Pupilas pequenininhas contraídas
        ctx.fillStyle = '#0a0414';
        ctx.beginPath();
        ctx.arc(107, 96, 4.2, 0, Math.PI * 2);
        ctx.arc(149, 91, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(103, 91, 3.5, 0, Math.PI * 2);
        ctx.arc(146, 87, 3.0, 0, Math.PI * 2);
        ctx.fill();

        // --- MÃOS FLUTUANTES COM LUVAS BRANCAS ---
        for (const [hx, hy] of [[52, 168], [204, 162]]) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#19002e';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(hx, hy, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Dedinhos da luva
            ctx.beginPath();
            ctx.arc(hx - 8, hy - 8, 5, 0, Math.PI * 2);
            ctx.arc(hx, hy - 11, 5, 0, Math.PI * 2);
            ctx.arc(hx + 8, hy - 8, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    // =========================================================================
    // 4. GANGLE — A Fita de Cetim & Máscara de Teatro (Máscara de Porcelana com Lágrimas, Corpo de Fita 3D em Loops, Pontas em V)
    // =========================================================================
    static drawGangleStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 8;

        // --- CORPO E MEMBROS DE FITA DE CETIM VERMELHO EM ESPIRAL ---
        // Camada traseira da fita (Bordô escuro para dar volume interno)
        ctx.strokeStyle = '#800f2f';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(128, 112);
        ctx.bezierCurveTo(175, 132, 82, 165, 156, 195);
        ctx.stroke();

        // Braços de Fita Ondulados
        ctx.strokeStyle = '#ff1e56';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(114, 128);
        ctx.quadraticCurveTo(64, 136, 56, 172);
        ctx.moveTo(142, 128);
        ctx.quadraticCurveTo(192, 136, 200, 172);
        ctx.stroke();

        // Pernas de Fita com Pontas Recortadas
        ctx.beginPath();
        ctx.moveTo(116, 192);
        ctx.quadraticCurveTo(96, 216, 102, 238);
        ctx.moveTo(140, 192);
        ctx.quadraticCurveTo(160, 216, 154, 238);
        ctx.stroke();

        // Camada frontal da fita (Vermelho Cetim Brilhante com Borda Dourada Sutil)
        const ribbonGrad = ctx.createLinearGradient(80, 110, 176, 210);
        ribbonGrad.addColorStop(0, '#ff4d6d');
        ribbonGrad.addColorStop(0.5, '#ff0a54');
        ribbonGrad.addColorStop(1, '#c9184a');
        ctx.strokeStyle = ribbonGrad;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(128, 110);
        ctx.bezierCurveTo(75, 135, 180, 162, 104, 196);
        ctx.bezierCurveTo(85, 208, 150, 215, 128, 228);
        ctx.stroke();

        // Brilho acetinado central na fita
        ctx.strokeStyle = 'rgba(255, 200, 215, 0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(128, 110);
        ctx.bezierCurveTo(75, 135, 180, 162, 104, 196);
        ctx.stroke();

        // --- MÁSCARA DE COMÉDIA QUEBRADA (PENDURADA AO LADO) ---
        ctx.save();
        ctx.translate(184, 150);
        ctx.rotate(0.35);
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 1.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Rachadura na máscara de comédia
        ctx.beginPath();
        ctx.moveTo(-4, -12); ctx.lineTo(2, 0); ctx.lineTo(-3, 8);
        ctx.stroke();
        ctx.restore();

        // --- MÁSCARA PRINCIPAL DE PORCELANA BRANCA (ROSTO) ---
        const maskGrad = ctx.createRadialGradient(118, 68, 6, 128, 78, 44);
        maskGrad.addColorStop(0, '#ffffff');
        maskGrad.addColorStop(0.8, '#f8fafc');
        maskGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = maskGrad;
        ctx.strokeStyle = '#1e1b2e';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.ellipse(128, 78, 40, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Laço vermelho no topo da máscara
        ctx.fillStyle = '#ff0a54';
        ctx.beginPath();
        ctx.ellipse(116, 42, 12, 6, -0.3, 0, Math.PI * 2);
        ctx.ellipse(140, 42, 12, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(128, 42, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Olhos Expressivos da Máscara
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(111, 74, 7.5, 9.5, -0.1, 0, Math.PI * 2);
        ctx.ellipse(145, 74, 7.5, 9.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Brilhos grandes de anime nos olhos da Gangle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(109, 71, 3.2, 0, Math.PI * 2);
        ctx.arc(143, 71, 3.2, 0, Math.PI * 2);
        ctx.arc(113, 77, 1.6, 0, Math.PI * 2);
        ctx.arc(147, 77, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Lágrimas Cristalinas Azuis nos Cantos dos Olhos
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(104, 83, 4.2, 0, Math.PI * 2);
        ctx.arc(152, 83, 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas Emotivas
        ctx.strokeStyle = '#1e1b2e';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(98, 64); ctx.quadraticCurveTo(108, 60, 118, 56);
        ctx.moveTo(158, 64); ctx.quadraticCurveTo(148, 60, 138, 56);
        ctx.stroke();

        // Bochechas Rosadas Suaves
        ctx.fillStyle = 'rgba(255, 77, 109, 0.35)';
        ctx.beginPath();
        ctx.ellipse(98, 86, 7, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(158, 86, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Boca Trêmula Expressiva
        ctx.strokeStyle = '#1e1b2e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(113, 98);
        ctx.quadraticCurveTo(120, 91, 128, 95);
        ctx.quadraticCurveTo(136, 91, 143, 98);
        ctx.stroke();
    }

    // =========================================================================
    // 5. ZOOBLE — O Quebra-Cabeça Abstrato Mix-and-Match (Cabeça Triangular Rosa, Olhos Espiral/Assimétricos, Garra, Antenas, Peças Coloridas)
    // =========================================================================
    static drawZoobleStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#140c24';
        ctx.lineWidth = 3;

        // --- PERNAS ASSIMÉTRICAS DESCOMBINADAS ---
        // Perna Esquerda (Listrada Rosa e Amarela)
        ctx.fillStyle = '#ff2a85';
        ctx.fillRect(102, 198, 14, 38);
        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(102, 206, 14, 8);
        ctx.fillRect(102, 222, 14, 8);
        ctx.strokeRect(102, 198, 14, 38);

        // Perna Direita (Mola / Zig-zag Verde Neon e Roxo)
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(146, 198);
        ctx.lineTo(138, 210);
        ctx.lineTo(154, 220);
        ctx.lineTo(142, 234);
        ctx.stroke();

        // Sapatos Geométricos Diferentes
        ctx.fillStyle = '#7209b7';
        ctx.strokeStyle = '#140c24';
        ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.roundRect(92, 232, 26, 11, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff9e00';
        ctx.beginPath(); ctx.arc(146, 236, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // --- BRAÇOS ASSIMÉTRICOS (GARRA DE PINÇA + BRAÇO ESPIRAL) ---
        // Braço Esquerdo com Garra Roxa/Vermelha
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(96, 152); ctx.lineTo(68, 166);
        ctx.stroke();

        // Pinça / Garra
        ctx.fillStyle = '#ff0055';
        ctx.strokeStyle = '#140c24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(60, 170, 13, 0.3 * Math.PI, 1.7 * Math.PI);
        ctx.lineTo(60, 170);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Braço Direito Amarelo Articulado com Esfera Azul
        ctx.strokeStyle = '#ffd60a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(160, 152); ctx.lineTo(184, 142); ctx.lineTo(194, 168);
        ctx.stroke();
        ctx.fillStyle = '#00bbf9';
        ctx.strokeStyle = '#140c24';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(194, 172, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // --- TORSO DE BLOCO DE ENCAIXE AZUL-CIANO COM MANCHAS AMARELAS ---
        const bodyGrad = ctx.createLinearGradient(94, 132, 162, 200);
        bodyGrad.addColorStop(0, '#00f5d4');
        bodyGrad.addColorStop(1, '#00bbf9');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(96, 134, 64, 66, 12);
        ctx.fill();
        ctx.stroke();

        // Padrões Geométricos no Torso da Zooble
        ctx.fillStyle = '#ffd60a';
        ctx.beginPath();
        ctx.arc(114, 154, 8, 0, Math.PI * 2);
        ctx.rect(134, 168, 16, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff2a85';
        ctx.beginPath();
        ctx.moveTo(116, 174); ctx.lineTo(106, 190); ctx.lineTo(126, 190); ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // --- ANTENAS NO TOPO DA CABEÇA ---
        // Antena Esquerda (Raio Zig-Zag Roxo/Amarelo)
        ctx.strokeStyle = '#ffbe0b';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(102, 70); ctx.lineTo(86, 48); ctx.lineTo(98, 40); ctx.lineTo(82, 22);
        ctx.stroke();
        ctx.fillStyle = '#ff006e';
        ctx.beginPath(); ctx.arc(82, 22, 6, 0, Math.PI * 2); ctx.fill();

        // Antena Direita (Curva Listrada Preta e Branca)
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(152, 70);
        ctx.quadraticCurveTo(176, 42, 164, 24);
        ctx.stroke();
        ctx.fillStyle = '#ffd60a';
        ctx.beginPath(); ctx.arc(164, 24, 7, 0, Math.PI * 2); ctx.fill();

        // --- CABEÇA TRIANGULAR ASSIMÉTRICA ROSA-CHOQUE ---
        const headGrad = ctx.createLinearGradient(76, 52, 180, 128);
        headGrad.addColorStop(0, '#ff5ca8');
        headGrad.addColorStop(1, '#f72585');
        ctx.fillStyle = headGrad;
        ctx.strokeStyle = '#140c24';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(74, 66);
        ctx.lineTo(182, 58);
        ctx.lineTo(132, 134);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // --- OLHOS ASSIMÉTRICOS HIPNÓTICOS ---
        // Olho Esquerdo (Grande com Espiral Amarela e Roxa)
        ctx.fillStyle = '#ffd60a';
        ctx.beginPath();
        ctx.arc(108, 86, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Espiral hipnótica dentro do olho esquerdo
        ctx.strokeStyle = '#7209b7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.25) {
            const r = (a / (Math.PI * 4)) * 13;
            const sx = 108 + Math.cos(a) * r;
            const sy = 86 + Math.sin(a) * r;
            if (a === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Olho Direito (Menor, Turquesa com Pálpebra Laranja)
        ctx.fillStyle = '#00f5d4';
        ctx.strokeStyle = '#140c24';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(148, 84, 11.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pálpebra pesada de tédio da Zooble no olho direito
        ctx.fillStyle = '#ff9e00';
        ctx.beginPath();
        ctx.arc(148, 84, 11.5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#140c24';
        ctx.beginPath();
        ctx.arc(148, 87, 3.8, 0, Math.PI * 2);
        ctx.fill();
    }

    // =========================================================================
    // 6. CAINE — O Mestre de Cerimônias (Cartola com Faixa Vermelha, Mandíbula de Dentadura, Olhos com Heterocromia Azul/Verde, Fraque de Gala e Bengala)
    // =========================================================================
    static drawCaineStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.48)';
        ctx.shadowBlur = 8;

        // --- PERNAS DE TERNO E SAPATOS DE VERNIZ ---
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.8;
        ctx.fillRect(106, 204, 16, 30);
        ctx.strokeRect(106, 204, 16, 30);
        ctx.fillRect(134, 204, 16, 30);
        ctx.strokeRect(134, 204, 16, 30);

        // Sapatos sociais pretos com brilho
        ctx.beginPath();
        ctx.ellipse(110, 236, 14, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(146, 236, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // --- FRAQUE VERMELHO DE GALA (RINGMASTER TUXEDO) ---
        // Caudas do Fraque atrás
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(92, 185); ctx.lineTo(78, 226); ctx.lineTo(104, 212); ctx.closePath();
        ctx.moveTo(164, 185); ctx.lineTo(178, 226); ctx.lineTo(152, 212); ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Casaco Principal Vermelho Rubi
        const coatGrad = ctx.createLinearGradient(90, 142, 166, 208);
        coatGrad.addColorStop(0, '#ef4444');
        coatGrad.addColorStop(1, '#b91c1c');
        ctx.fillStyle = coatGrad;
        ctx.beginPath();
        ctx.roundRect(92, 144, 72, 62, 12);
        ctx.fill();
        ctx.stroke();

        // Camisa Branca Central em V e Lapelas Pretas
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(112, 144); ctx.lineTo(144, 144); ctx.lineTo(128, 192); ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lapelas Pretas de Cetim
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.moveTo(112, 144); ctx.lineTo(100, 168); ctx.lineTo(124, 182); ctx.closePath();
        ctx.moveTo(144, 144); ctx.lineTo(156, 168); ctx.lineTo(132, 182); ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ombreiras Douradas de Mestre de Cerimônias (Epaulettes)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(90, 148, 13, 6, -0.2, 0, Math.PI * 2);
        ctx.ellipse(166, 148, 13, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Gravata Borboleta Preta Clássica
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(128, 148); ctx.lineTo(112, 141); ctx.lineTo(112, 155); ctx.closePath();
        ctx.moveTo(128, 148); ctx.lineTo(144, 141); ctx.lineTo(144, 155); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(128, 148, 4, 0, Math.PI * 2); ctx.fill();

        // Botões Dourados do Fraque
        for (const by of [170, 186, 198]) {
            ctx.beginPath();
            ctx.arc(104, by, 3.5, 0, Math.PI * 2);
            ctx.arc(152, by, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- LUVAS BRANCAS E BENGALA DE MESTRE DE CERIMÔNIAS ---
        // Bengala Preta com Pomo Dourado na mão direita
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(192, 146); ctx.lineTo(204, 236);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(191, 144, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Luvas Brancas
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(68, 174, 12, 0, Math.PI * 2);
        ctx.arc(190, 166, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // --- CABEÇA DE DENTADURA GIGANTE COM OLHOS DENTRO DA BOCA ---
        // Fundo Escuro da Cavidade Bucal
        ctx.fillStyle = '#1a0510';
        ctx.beginPath();
        ctx.ellipse(128, 100, 48, 36, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- DOIS OLHOS FLUTUANTES COM HETEROCROMIA CANÔNICA (UM AZUL, UM VERDE!) ---
        const drawCaineEye = (ex, ey, irisColor) => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(ex, ey, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Íris colorida (Esquerda Azul #00d2ff, Direita Verde #00ff66)
            ctx.fillStyle = irisColor;
            ctx.beginPath();
            ctx.arc(ex, ey, 8.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pupila preta
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(ex, ey, 4.2, 0, Math.PI * 2);
            ctx.fill();

            // Reflexo de luz
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - 3.5, ey - 3.5, 3.0, 0, Math.PI * 2);
            ctx.fill();
        };

        drawCaineEye(111, 100, '#00d2ff'); // Olho Azul
        drawCaineEye(145, 100, '#00e676'); // Olho Verde

        // Fileira Superior e Inferior de Dentes Brancos Esculpidos
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 6; i++) {
            const tx = 86 + i * 14;
            // Dente Superior
            ctx.beginPath();
            ctx.roundRect(tx, 70, 13, 18, [2, 2, 6, 6]);
            ctx.fill();
            ctx.stroke();

            // Dente Inferior
            ctx.beginPath();
            ctx.roundRect(tx, 112, 13, 18, [6, 6, 2, 2]);
            ctx.fill();
            ctx.stroke();
        }

        // Gengiva Superior Rosa-Avermelhada Esculpida
        const gumGrad = ctx.createLinearGradient(76, 54, 180, 140);
        gumGrad.addColorStop(0, '#ff4d6d');
        gumGrad.addColorStop(0.5, '#e11d48');
        gumGrad.addColorStop(1, '#be123c');
        ctx.fillStyle = gumGrad;
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 3;

        // Arco da Gengiva Superior
        ctx.beginPath();
        ctx.arc(128, 76, 50, Math.PI, 0);
        ctx.lineTo(178, 76);
        ctx.quadraticCurveTo(128, 68, 78, 76);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Arco da Gengiva Inferior
        ctx.beginPath();
        ctx.arc(128, 124, 48, 0, Math.PI);
        ctx.lineTo(80, 124);
        ctx.quadraticCurveTo(128, 132, 176, 124);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // --- CARTOLA PRETA DE GALA COM FAIXA VERMELHA ---
        const hatGrad = ctx.createLinearGradient(96, 10, 160, 56);
        hatGrad.addColorStop(0, '#374151');
        hatGrad.addColorStop(0.4, '#111827');
        hatGrad.addColorStop(1, '#030712');
        ctx.fillStyle = hatGrad;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.8;

        // Copa da Cartola
        ctx.beginPath();
        ctx.roundRect(98, 12, 60, 40, [6, 6, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Faixa Vermelha de Cetim na Cartola
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(98, 41, 60, 9);
        ctx.strokeRect(98, 41, 60, 9);

        // Aba Curvada da Cartola
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.ellipse(128, 51, 46, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // =========================================================================
    // 7. BOLHA / BUBBLE — O Ajudante Bolha de Sabão Iridescente (Reflexos Arco-Íris, Olhos Brilhantes, Dentes Afiados de Piranha e Língua)
    // =========================================================================
    static drawBubbleStatic(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 210, 255, 0.5)';
        ctx.shadowBlur = 14;

        // --- ESFERA TRANSLÚCIDA IRIDESCENTE DE SABÃO ---
        const bubbleGrad = ctx.createRadialGradient(104, 96, 10, 128, 128, 68);
        bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bubbleGrad.addColorStop(0.35, 'rgba(125, 211, 252, 0.85)');
        bubbleGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.82)');
        bubbleGrad.addColorStop(0.85, 'rgba(244, 114, 182, 0.88)');
        bubbleGrad.addColorStop(0.95, 'rgba(250, 204, 21, 0.9)');
        bubbleGrad.addColorStop(1, 'rgba(2, 132, 199, 0.95)');

        ctx.fillStyle = bubbleGrad;
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(128, 128, 66, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Anel Iridescente Interno
        ctx.strokeStyle = 'rgba(255, 42, 133, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(128, 128, 61, 0.2 * Math.PI, 1.1 * Math.PI);
        ctx.stroke();

        // Reflexos de Vidro/Sabão Brilhantes no Topo da Bolha
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.beginPath();
        ctx.ellipse(96, 86, 18, 9, -0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(82, 104, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // --- OLHOS PRETOS BRILHANTES ---
        for (const ex of [104, 152]) {
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.ellipse(ex, 102, 8.5, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            // Brilhos duplos fofos nos olhos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - 2.5, 98, 3.2, 0, Math.PI * 2);
            ctx.arc(ex + 2.5, 105, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- BOCA ENORME COM DENTES AFIADOS DE TUBARÃO E LÍNGUA ---
        ctx.fillStyle = '#1e1035';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(82, 124);
        ctx.quadraticCurveTo(128, 132, 174, 124);
        ctx.quadraticCurveTo(166, 174, 128, 174);
        ctx.quadraticCurveTo(90, 174, 82, 124);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Língua Comprida Rosa Vibrante
        ctx.fillStyle = '#ff2a85';
        ctx.beginPath();
        ctx.moveTo(108, 152);
        ctx.quadraticCurveTo(128, 186, 148, 152);
        ctx.quadraticCurveTo(128, 144, 108, 152);
        ctx.fill();
        ctx.stroke();

        // Fileira Superior de Dentes Triangulares Afiados
        ctx.fillStyle = '#ffffff';
        for (let tx = 86; tx <= 158; tx += 14) {
            ctx.beginPath();
            ctx.moveTo(tx, 125);
            ctx.lineTo(tx + 7, 144);
            ctx.lineTo(tx + 14, 125);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Fileira Inferior de Dentes Afiados
        for (let tx = 93; tx <= 149; tx += 14) {
            ctx.beginPath();
            ctx.moveTo(tx, 166);
            ctx.lineTo(tx + 7, 150);
            ctx.lineTo(tx + 14, 166);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Mini bolhas decorativas ao redor
        for (const [bx, by, br] of [[64, 72, 9], [192, 82, 11], [186, 176, 7], [68, 178, 8]]) {
            ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    createMesh() {
        const texture = this.createCharacterTexture();
        // Plano visual ligeiramente maior para exibir todos os detalhes com nitidez mantendo a hitbox original
        const geometry = new THREE.PlaneGeometry(this.width * 1.32, this.height * 1.24);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.05,
            roughness: 0.2,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.copy(this.position);

        // Adiciona Adereços 3D Exclusivos de Cada Personagem
        this.createCharacter3DAccessories();

        this.scene.add(this.mesh);
    }

    createCharacter3DAccessories() {
        this.accessoriesGroup = new THREE.Group();
        this.mesh.add(this.accessoriesGroup);

        const charType = (this.characterType || 'pomni').toLowerCase();
        const themeColors = {
            pomni: 0xff2a5f,
            jax: 0xa855f7,
            kinger: 0xffd700,
            gangle: 0xff0a54,
            zooble: 0x00f5d4,
            caine: 0xef4444,
            bubble: 0x38bdf8
        };
        const auraColor = themeColors[charType] || 0x00d2ff;

        // 1. Anel de Aura Neon 3D sob os pés do personagem
        const ringGeo = new THREE.TorusGeometry(0.68, 0.045, 8, 28);
        const ringMat = new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.7 });
        this.auraRing = new THREE.Mesh(ringGeo, ringMat);
        this.auraRing.rotation.x = Math.PI / 2;
        this.auraRing.position.set(0, -this.height * 0.48, 0);
        this.mesh.add(this.auraRing);

        // 2. Adereços 3D Flutuantes Específicos de Cada Personagem
        if (charType === 'pomni') {
            // Sinos 3D dourados e estrelas bicolores orbitantes
            const starRed = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.16),
                new THREE.MeshStandardMaterial({ color: 0xff2a5f, emissive: 0xff1e56, emissiveIntensity: 0.7 })
            );
            starRed.position.set(-0.85, 0.55, 0.15);
            const starBlue = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.16),
                new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x00b4d8, emissiveIntensity: 0.7 })
            );
            starBlue.position.set(0.85, 0.55, 0.15);
            this.accessoriesGroup.add(starRed, starBlue);

        } else if (charType === 'jax') {
            // Chave Mestra Dourada 3D do Jax flutuando ao lado
            const keyGroup = new THREE.Group();
            const keyRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.13, 0.035, 8, 16),
                new THREE.MeshStandardMaterial({ color: 0xffd60a, emissive: 0xffaa00, emissiveIntensity: 0.6 })
            );
            const keyStem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8),
                new THREE.MeshStandardMaterial({ color: 0xffd60a, emissive: 0xffaa00, emissiveIntensity: 0.6 })
            );
            keyStem.position.y = -0.18;
            keyGroup.add(keyRing, keyStem);
            keyGroup.position.set(0.9, 0.35, 0.2);
            keyGroup.rotation.z = 0.4;
            this.accessoriesGroup.add(keyGroup);

        } else if (charType === 'kinger') {
            // Mãos 3D Flutuantes com Luvas Brancas + Coroa de Luz
            const gloveMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xddddff, emissiveIntensity: 0.3, roughness: 0.2 });
            const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), gloveMat);
            leftHand.position.set(-0.88, -0.1, 0.22);
            const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), gloveMat);
            rightHand.position.set(0.88, 0.05, 0.22);
            this.accessoriesGroup.add(leftHand, rightHand);

        } else if (charType === 'gangle') {
            // Laços de Fita 3D Flutuantes
            const loopMat = new THREE.MeshStandardMaterial({ color: 0xff0a54, emissive: 0xff2a5f, emissiveIntensity: 0.6 });
            const loop1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 20), loopMat);
            loop1.position.set(-0.85, 0.2, 0.15);
            const loop2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 20), loopMat);
            loop2.position.set(0.85, -0.1, 0.15);
            this.accessoriesGroup.add(loop1, loop2);

        } else if (charType === 'zooble') {
            // Peças Geométricas 3D Mix-and-Match Flutuantes
            const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: 0xffbe0b, emissive: 0xff9e00, emissiveIntensity: 0.6 }));
            p1.position.set(-0.88, 0.4, 0.2);
            const p2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00bbf9, emissiveIntensity: 0.6 }));
            p2.position.set(0.88, -0.2, 0.2);
            this.accessoriesGroup.add(p1, p2);

        } else if (charType === 'caine') {
            // Bengala 3D Giratória e Olho Flutuante Mágico
            const caneGroup = new THREE.Group();
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.85, 8), new THREE.MeshStandardMaterial({ color: 0x111827 }));
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.8 }));
            tip.position.y = 0.44;
            caneGroup.add(rod, tip);
            caneGroup.position.set(0.92, 0.0, 0.22);
            caneGroup.rotation.z = -0.25;
            this.accessoriesGroup.add(caneGroup);

        } else if (charType === 'bubble') {
            // Mini Bolhas de Sabão 3D Translúcidas Orbitantes
            for (let i = 0; i < 3; i++) {
                const b = new THREE.Mesh(
                    new THREE.SphereGeometry(0.14 + i * 0.03, 14, 14),
                    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.5, transparent: true, opacity: 0.75, roughness: 0.05 })
                );
                const ang = (i / 3) * Math.PI * 2;
                b.position.set(Math.cos(ang) * 0.88, Math.sin(ang) * 0.65, 0.2);
                this.accessoriesGroup.add(b);
            }
        }
    }

    createParticles() {
        const count = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = 0.1;
            colors[i * 3] = Math.random(); colors[i * 3 + 1] = Math.random(); colors[i * 3 + 2] = 1.0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.particles = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.8 }));
        this.scene.add(this.particles);
    }

    initListeners() {
        const onKeyDown = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
                if (!this.keys.jump) this.jump();
                this.keys.jump = true;
            }
            if (e.code === 'KeyF' || e.code === 'KeyE') {
                this.shootPower();
            }
        };

        const onKeyUp = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.jump = false;
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
    }

    shootPower() {
        if (this.shootCooldown > 0) return;
        this.shootCooldown = this.powerType === 'rapidfire' ? 0.08 : 0.22; // Cooldown ágil ou muito rápido

        let projMesh;
        const dir = this.facingRight ? 1 : -1;
        const startX = this.position.x + (this.facingRight ? 1.2 : -1.2);
        const startY = this.position.y;

        const charType = (this.characterType || 'pomni').toLowerCase();

        if (charType === 'caine') {
            // CAINE: BARRA DE CENSURA CÂNONICA INCLINADA COM TEXTURA ### CENSOR ### E BRILHO NEON
            const group = new THREE.Group();
            const censorCanvas = document.createElement('canvas');
            censorCanvas.width = 256; censorCanvas.height = 128;
            const ctx = censorCanvas.getContext('2d');

            ctx.fillStyle = '#05000a';
            ctx.fillRect(0, 0, 256, 128);
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 12;
            ctx.strokeRect(6, 6, 244, 116);

            // Título CENSOR em destaque
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 36px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('### CENSOR ###', 128, 64);

            const censorTex = new THREE.CanvasTexture(censorCanvas);

            const censorMesh = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.95, 0.4),
                new THREE.MeshStandardMaterial({ map: censorTex, emissive: 0xff0044, emissiveIntensity: 0.5, roughness: 0.2 })
            );

            // Halo/brilho de censura glitch atrás da barra
            const auraGlow = new THREE.Mesh(
                new THREE.BoxGeometry(2.4, 1.1, 0.2),
                new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.4 })
            );
            group.add(auraGlow);
            group.add(censorMesh);

            group.rotation.z = -0.22 * dir;
            group.userData = { vx: dir * 26.0, vy: 0, rotSpeed: 0, char: 'caine' };
            projMesh = group;

        } else if (charType === 'jax') {
            // JAX: CENOURA ELÉTRICA 3D ULTRA DETALHADA COM FAÍSCAS 🥕⚡
            const group = new THREE.Group();
            
            // Corpo da Cenoura
            const carrotGeo = new THREE.ConeGeometry(0.4, 1.4, 12);
            const carrotMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff2200, emissiveIntensity: 0.6, roughness: 0.3 });
            const carrot = new THREE.Mesh(carrotGeo, carrotMat);
            carrot.rotation.z = -Math.PI / 2 * dir;

            // Anéis de eletricidade da cenoura
            const ringGeo = new THREE.TorusGeometry(0.3, 0.06, 8, 16);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.y = Math.PI / 2;
            group.add(ring);

            // Rama Verde no topo
            const leafGeo = new THREE.ConeGeometry(0.25, 0.6, 6);
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x00ff44, emissive: 0x00aa22, emissiveIntensity: 0.8 });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(-0.75 * dir, 0.1, 0);
            leaf.rotation.z = Math.PI / 3 * dir;

            group.add(carrot);
            group.add(leaf);
            group.userData = { vx: dir * 25.0, vy: 0.8, rotSpeed: 14.0, char: 'jax' };
            projMesh = group;

        } else if (charType === 'kinger') {
            // KINGER: REI DE XADREZ MÁGICO 3D COM COROA DOURADA E AURA ♔✨
            const group = new THREE.Group();
            
            // Base e corpo da peça
            const bodyGeo = new THREE.CylinderGeometry(0.3, 0.55, 1.2, 16);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffcc00, emissiveIntensity: 0.6, roughness: 0.1 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            group.add(body);

            // Coroa com Cruz Sagrada
            const crossVertical = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
            crossVertical.position.y = 0.8;
            const crossHorizontal = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
            crossHorizontal.position.y = 0.8;
            group.add(crossVertical);
            group.add(crossHorizontal);

            // Anel Mágico Orbonico em volta do Rei
            const orbRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 8, 20), new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
            orbRing.rotation.x = Math.PI / 3;
            group.add(orbRing);

            group.userData = { vx: dir * 23.0, vy: 1.5, rotSpeed: 8.0, char: 'kinger' };
            projMesh = group;

        } else if (charType === 'gangle') {
            // GANGLE: LAÇO DUPLO DE SEDA ESPIRAL GLAMOUR 🎀
            const group = new THREE.Group();
            
            const ribbonGeo1 = new THREE.TorusGeometry(0.55, 0.12, 10, 32);
            const ribbonMat1 = new THREE.MeshStandardMaterial({ color: 0xff2a5f, emissive: 0xff0055, emissiveIntensity: 0.9, roughness: 0.2 });
            const ribbon1 = new THREE.Mesh(ribbonGeo1, ribbonMat1);

            const ribbonGeo2 = new THREE.TorusGeometry(0.35, 0.08, 10, 32);
            const ribbonMat2 = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 0.8 });
            const ribbon2 = new THREE.Mesh(ribbonGeo2, ribbonMat2);
            ribbon2.rotation.x = Math.PI / 2;

            group.add(ribbon1);
            group.add(ribbon2);
            group.userData = { vx: dir * 22.0, vy: 1.0, rotSpeed: 18.0, char: 'gangle' };
            projMesh = group;

        } else if (charType === 'zooble') {
            // ZOOBLE: CRISTAL GLITCH DODECAEDRO MATRIX 🧩⚡
            const group = new THREE.Group();
            
            const outerGeo = new THREE.DodecahedronGeometry(0.6);
            const outerMat = new THREE.MeshStandardMaterial({ color: 0x7000ff, emissive: 0x00d2ff, emissiveIntensity: 0.9, wireframe: true });
            const outer = new THREE.Mesh(outerGeo, outerMat);

            const innerGeo = new THREE.OctahedronGeometry(0.35);
            const innerMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
            const inner = new THREE.Mesh(innerGeo, innerMat);

            group.add(outer);
            group.add(inner);
            group.userData = { vx: dir * 24.0, vy: 0.8, rotSpeed: 16.0, char: 'zooble' };
            projMesh = group;

        } else if (charType === 'bubble') {
            // BOLHA: ESFERA DE SABÃO IRIDESCENTE ÁCIDA COM BOLHAS INTERNAS 🫧🧪
            const group = new THREE.Group();
            
            const mainBubbleGeo = new THREE.SphereGeometry(0.65, 24, 24);
            const mainBubbleMat = new THREE.MeshStandardMaterial({
                color: 0x00ff88,
                emissive: 0x00ffaa,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.75,
                roughness: 0.1
            });
            const mainBubble = new THREE.Mesh(mainBubbleGeo, mainBubbleMat);

            // Mini bolhas orbitantes
            for (let b = 0; b < 3; b++) {
                const subGeo = new THREE.SphereGeometry(0.18, 12, 12);
                const subMat = new THREE.MeshBasicMaterial({ color: 0xaaff00, transparent: true, opacity: 0.9 });
                const sub = new THREE.Mesh(subGeo, subMat);
                const angle = (b / 3) * Math.PI * 2;
                sub.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0);
                group.add(sub);
            }

            group.add(mainBubble);
            group.userData = { vx: dir * 21.0, vy: 1.6, rotSpeed: 6.0, char: 'bubble' };
            projMesh = group;

        } else {
            // POMNI (OU JAZ): DADO DA SORTE MAGICO 3D COM PONTOS NEON 🎲
            const group = new THREE.Group();
            const diceGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
            const diceMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xff2a5f, emissiveIntensity: 0.7, roughness: 0.2 });
            const dice = new THREE.Mesh(diceGeo, diceMat);

            // Moldura brilhante do dado
            const frameGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const frameMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true });
            const frame = new THREE.Mesh(frameGeo, frameMat);

            group.add(dice);
            group.add(frame);
            group.userData = { vx: dir * 23.0, vy: 1.2, rotSpeed: 12.0, char: 'pomni' };
            projMesh = group;
        }

        projMesh.position.set(startX, startY, 0);
        projMesh.userData.active = true;
        projMesh.userData.lifeTimer = 5.0; // Desaparece obrigatoriamente após 5 segundos

        this.scene.add(projMesh);
        this.projectiles.push(projMesh);

        if (this.soundManager) this.soundManager.playCollect();
    }

    jump() {
        if (this.jumpsLeft > 0) {
            this.velocity.y = this.jumpForce;
            this.jumpsLeft--;
            this.isGrounded = false;
            if (this.soundManager) this.soundManager.playJump();
        }
    }

    bounce(force = 23.0) {
        this.velocity.y = force;
        this.jumpsLeft = 1;
        this.isGrounded = false;
        if (this.soundManager) this.soundManager.playBounce();
    }

    takeDamage() {
        if (this.invulnerableTimer > 0) return false;

        this.health--;
        this.invulnerableTimer = 1.2;
        this.velocity.y = 12.0;
        if (this.soundManager) this.soundManager.playHit();
        return true;
    }

    reset(x = 0, y = 4) {
        this.position.set(x, y, 0);
        this.velocity.set(0, 0);
        this.health = this.maxHealth;
        this.invulnerableTimer = 0;
        this.jumpsLeft = this.maxJumps;
        this.isGrounded = false;
        this.mesh.position.copy(this.position);
    }

    update(delta, platforms, trampolines, hazardObjects) {
        if (this.shootCooldown > 0) this.shootCooldown -= delta;

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= delta;
            this.mesh.visible = Math.floor(this.invulnerableTimer * 15) % 2 === 0;
        } else {
            this.mesh.visible = true;
        }

        // Movimento Horizontal
        if (this.keys.left) {
            this.velocity.x = -this.speed;
            this.facingRight = false;
        } else if (this.keys.right) {
            this.velocity.x = this.speed;
            this.facingRight = true;
        } else {
            this.velocity.x *= 0.75;
        }

        this.mesh.scale.x = this.facingRight ? 1 : -1;

        // Gravidade
        this.velocity.y -= this.gravity * delta;

        // Movimento
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;

        // Projéteis de Poder do Jogador (auto-destruição em no máximo 5 segundos)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.position.x += p.userData.vx * delta;
            p.position.y += p.userData.vy * delta;

            const rotSpeed = p.userData.rotSpeed !== undefined ? p.userData.rotSpeed : 10.0;
            p.rotation.z += delta * rotSpeed;

            if (p.userData.lifeTimer !== undefined) {
                p.userData.lifeTimer -= delta;
            }

            // Elimina o projétil se o tempo de 5s expirar OU se sair da distância do jogador
            if ((p.userData.lifeTimer !== undefined && p.userData.lifeTimer <= 0) || Math.abs(p.position.x - this.position.x) > 35) {
                this.scene.remove(p);
                this.projectiles.splice(i, 1);
            }
        }

        // Colisão AABB com Plataformas
        let onGround = false;

        platforms.forEach(plat => {
            const pBox = plat.userData.bounds;
            if (!pBox) return;

            const playerLeft = this.position.x - this.width / 2;
            const playerRight = this.position.x + this.width / 2;
            const playerBottom = this.position.y - this.height / 2;

            if (playerRight > pBox.minX && playerLeft < pBox.maxX) {
                if (this.velocity.y <= 0 && playerBottom <= pBox.maxY && playerBottom >= pBox.maxY - 0.6) {
                    this.position.y = pBox.maxY + this.height / 2;
                    this.velocity.y = 0;
                    onGround = true;
                }
            }
        });

        if (trampolines) {
            trampolines.forEach(tramp => {
                const tBox = tramp.userData.bounds;
                if (!tBox) return;
                const playerLeft = this.position.x - this.width / 2;
                const playerRight = this.position.x + this.width / 2;
                const playerBottom = this.position.y - this.height / 2;

                if (playerRight > tBox.minX && playerLeft < tBox.maxX) {
                    if (this.velocity.y <= 0 && playerBottom <= tBox.maxY && playerBottom >= tBox.maxY - 0.6) {
                        this.bounce(25.0);
                    }
                }
            });
        }

        if (onGround) {
            this.isGrounded = true;
            this.jumpsLeft = this.maxJumps;
        } else {
            this.isGrounded = false;
        }

        if (this.position.x < -10) this.position.x = -10;
        if (this.position.x > 400) this.position.x = 400;

        if (this.position.y < -10) {
            this.takeDamage();
            this.position.set(Math.max(0, this.position.x - 8), 6, 0);
            this.velocity.set(0, 0);
        }

        const now = Date.now() * 0.001;
        const isMovingHoriz = Math.abs(this.velocity.x) > 0.5;
        const bobbing = this.isGrounded && isMovingHoriz ? Math.sin(now * 16.0) * 0.1 : Math.sin(now * 3.0) * 0.03;
        this.mesh.position.set(this.position.x, this.position.y + bobbing, this.position.z);

        // Inclinação dinâmica ao caminhar e Squash & Stretch nos pulos
        if (this.isGrounded && isMovingHoriz) {
            this.mesh.rotation.z = Math.sin(now * 16.0) * 0.07;
            this.mesh.scale.y = 1.0 + Math.abs(Math.sin(now * 16.0)) * 0.04;
        } else if (!this.isGrounded) {
            this.mesh.rotation.z = (this.facingRight ? -1 : 1) * Math.min(0.12, Math.max(-0.12, this.velocity.y * -0.006));
            this.mesh.scale.y = 1.0 + Math.min(0.12, Math.abs(this.velocity.y) * 0.005);
        } else {
            this.mesh.rotation.z *= 0.8;
            this.mesh.scale.y = 1.0 + Math.sin(now * 3.0) * 0.02;
        }

        // Anima os adereços 3D flutuantes de cada personagem
        if (this.accessoriesGroup) {
            this.accessoriesGroup.children.forEach((acc, idx) => {
                acc.position.y += Math.sin(now * 4.5 + idx * 1.7) * 0.003;
                acc.rotation.y += delta * 2.2;
                acc.rotation.z += Math.cos(now * 3.0 + idx) * 0.004;
            });
        }
        if (this.auraRing) {
            const pulse = 1.0 + Math.sin(now * 5.0) * 0.08;
            this.auraRing.scale.set(pulse, pulse, 1.0);
        }

        const pPositions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < pPositions.length / 3; i++) {
            pPositions[i * 3] += (this.position.x - pPositions[i * 3]) * 0.1;
            pPositions[i * 3 + 1] += (this.position.y - 0.5 - pPositions[i * 3 + 1]) * 0.1;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
