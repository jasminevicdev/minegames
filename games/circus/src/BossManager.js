import * as THREE from 'three';
import { Player2D } from './Player2D.js';

export class BossManager {
    constructor(scene, soundManager) {
        this.scene = scene;
        this.soundManager = soundManager;

        this.active = false;
        this.maxHealth = 6;
        this.health = 6;

        this.abstractionProjectiles = [];
        this.miniBubbles = [];
        this.attackTimer = 0;
        this.bubbleTimer = 0;

        this.caineMesh = null;
        this.bubbleMesh = null;

        this.cainePos = new THREE.Vector3(20, 6, 0);
        this.bubblePos = new THREE.Vector3(25, 9, 0);
    }

    initBossArena() {
        this.active = true;
        this.health = this.maxHealth;
        this.clearProjectiles();

        // 1. Caine Chefão (Arte 512x512 HD completa + Anéis 3D e Olhos Flutuantes)
        const caineCanvas = document.createElement('canvas');
        caineCanvas.width = 512;
        caineCanvas.height = 512;
        Player2D.drawCharacterOnCanvas(caineCanvas, 'caine');

        const caineTex = new THREE.CanvasTexture(caineCanvas);
        this.caineMesh = new THREE.Group();

        const caineSprite = new THREE.Mesh(
            new THREE.PlaneGeometry(5.6, 5.6),
            new THREE.MeshStandardMaterial({ map: caineTex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide })
        );
        this.caineMesh.add(caineSprite);

        // Anel Mágico Dourado 3D do Mestre de Cerimônias
        const bossHalo = new THREE.Mesh(
            new THREE.TorusGeometry(2.9, 0.09, 10, 36),
            new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.65 })
        );
        bossHalo.position.z = -0.2;
        this.caineMesh.add(bossHalo);

        this.caineMesh.position.copy(this.cainePos);
        this.scene.add(this.caineMesh);

        // 2. Bolha Ajudante (Arte 512x512 HD Iridescente com Dentes de Piranha e Língua)
        const bubbleCanvas = document.createElement('canvas');
        bubbleCanvas.width = 512;
        bubbleCanvas.height = 512;
        Player2D.drawCharacterOnCanvas(bubbleCanvas, 'bubble');

        const bubbleTex = new THREE.CanvasTexture(bubbleCanvas);
        this.bubbleMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(3.0, 3.0),
            new THREE.MeshStandardMaterial({ map: bubbleTex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide })
        );
        this.bubbleMesh.position.copy(this.bubblePos);
        this.scene.add(this.bubbleMesh);
    }

    // --- ATAQUE DO CAINE: ABSTRAÇÃO (Fera Glitch 3D com Múltiplos Olhos Neon) ---
    fireAbstractionAttack() {
        if (!this.active) return;

        const absCanvas = document.createElement('canvas');
        absCanvas.width = 256;
        absCanvas.height = 256;
        const ctx = absCanvas.getContext('2d');

        // Massa escura glitch irregular
        ctx.fillStyle = '#090014';
        ctx.beginPath();
        ctx.arc(128, 128, 105, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Polígonos de falha digital
        const glitchColors = ['#ff0055', '#00f5d4', '#ffbe0b', '#7209b7'];
        for (let g = 0; g < 8; g++) {
            ctx.fillStyle = glitchColors[g % glitchColors.length];
            ctx.fillRect(45 + (g * 19) % 120, 40 + (g * 29) % 130, 32, 12);
        }

        // Múltiplos olhos abstraídos brilhantes
        const eyeCoords = [[85, 95, 22, '#ff0055'], [165, 90, 20, '#ffbe0b'], [128, 145, 26, '#00f5d4'], [90, 165, 15, '#ff2a85'], [165, 160, 16, '#00ff66']];
        for (const [ex, ey, er, ec] of eyeCoords) {
            ctx.fillStyle = ec;
            ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(ex, ey, er * 0.65, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.arc(ex, ey, er * 0.28, 0, Math.PI * 2); ctx.fill();
        }

        const absTex = new THREE.CanvasTexture(absCanvas);
        const absMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.7, 1.7),
            new THREE.MeshBasicMaterial({ map: absTex, transparent: true })
        );
        absMesh.position.copy(this.cainePos);
        absMesh.userData = { vx: -11.0 - Math.random() * 3.0, vy: (Math.random() - 0.5) * 5.0 };

        this.scene.add(absMesh);
        this.abstractionProjectiles.push(absMesh);
        if (this.soundManager) this.soundManager.playHit();
    }

    // --- ATAQUE DA BOLHA: MINI BOLHAS (Mini Bubbles Flutuantes) ---
    fireMiniBubblesAttack() {
        if (!this.active) return;

        for (let i = 0; i < 3; i++) {
            const bMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x00d2ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 })
            );
            bMesh.position.set(this.bubblePos.x, this.bubblePos.y + (i - 1) * 1.2, 0);
            bMesh.userData = {
                vx: -8.0 - Math.random() * 4.0,
                vy: (Math.random() - 0.5) * 3.0,
                startY: bMesh.position.y
            };

            this.scene.add(bMesh);
            this.miniBubbles.push(bMesh);
        }
    }

    takeDamage() {
        if (this.health <= 0) return true;
        this.health--;
        if (this.soundManager) this.soundManager.playBounce();

        if (this.caineMesh) {
            this.caineMesh.scale.set(1.4, 1.4, 1.4);
            setTimeout(() => { if (this.caineMesh) this.caineMesh.scale.set(1.0, 1.0, 1.0); }, 200);
        }
        return this.health <= 0;
    }

    clearProjectiles() {
        this.abstractionProjectiles.forEach(p => this.scene.remove(p));
        this.miniBubbles.forEach(b => this.scene.remove(b));
        if (this.caineMesh) this.scene.remove(this.caineMesh);
        if (this.bubbleMesh) this.scene.remove(this.bubbleMesh);

        this.abstractionProjectiles = [];
        this.miniBubbles = [];
        this.caineMesh = null;
        this.bubbleMesh = null;
        this.active = false;
    }

    update(delta, time, player) {
        if (!this.active) return;

        // 1. Animar Caine e Bolha
        this.cainePos.y = 6.0 + Math.sin(time * 2.0) * 1.5;
        if (this.caineMesh) this.caineMesh.position.copy(this.cainePos);

        this.bubblePos.x = this.cainePos.x + Math.cos(time * 3.0) * 4.5;
        this.bubblePos.y = this.cainePos.y + Math.sin(time * 3.0) * 3.0;
        if (this.bubbleMesh) this.bubbleMesh.position.copy(this.bubblePos);

        // 2. Temporizadores de Ataque
        this.attackTimer += delta;
        if (this.attackTimer > 1.6) {
            this.fireAbstractionAttack();
            this.attackTimer = 0;
        }

        this.bubbleTimer += delta;
        if (this.bubbleTimer > 2.5) {
            this.fireMiniBubblesAttack();
            this.bubbleTimer = 0;
        }

        // 3. Atualizar Projéteis de Abstração do Caine
        for (let i = this.abstractionProjectiles.length - 1; i >= 0; i--) {
            const abs = this.abstractionProjectiles[i];
            abs.position.x += abs.userData.vx * delta;
            abs.position.y += abs.userData.vy * delta;
            abs.rotation.z += delta * 6.0;

            if (abs.position.distanceTo(player.position) < 1.3) {
                player.takeDamage();
                this.scene.remove(abs);
                this.abstractionProjectiles.splice(i, 1);
                continue;
            }

            if (abs.position.x < -15 || abs.position.x > 35) {
                this.scene.remove(abs);
                this.abstractionProjectiles.splice(i, 1);
            }
        }

        // 4. Atualizar Mini Bolhas da Bolha
        for (let i = this.miniBubbles.length - 1; i >= 0; i--) {
            const mb = this.miniBubbles[i];
            mb.position.x += mb.userData.vx * delta;
            mb.position.y = mb.userData.startY + Math.sin(time * 5.0 + i) * 1.2;

            if (mb.position.distanceTo(player.position) < 1.2) {
                player.takeDamage();
                this.scene.remove(mb);
                this.miniBubbles.splice(i, 1);
                continue;
            }

            if (mb.position.x < -15) {
                this.scene.remove(mb);
                this.miniBubbles.splice(i, 1);
            }
        }

        // 5. Testar Colisão dos Poderes do Jogador contra Caine e Bolha
        if (player.projectiles) {
            for (let i = player.projectiles.length - 1; i >= 0; i--) {
                const proj = player.projectiles[i];
                if (proj.position.distanceTo(this.cainePos) < 2.5 || proj.position.distanceTo(this.bubblePos) < 1.8) {
                    this.takeDamage();
                    this.scene.remove(proj);
                    player.projectiles.splice(i, 1);
                }
            }
        }
    }
}
