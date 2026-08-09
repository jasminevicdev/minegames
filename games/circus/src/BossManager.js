import * as THREE from 'three';

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

        // 1. Caine Chefão
        const caineCanvas = document.createElement('canvas');
        caineCanvas.width = 512; caineCanvas.height = 512;
        const ctx = caineCanvas.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(256, 160, 110, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(256, 260, 110, 0, Math.PI); ctx.fill();

        ctx.fillStyle = '#ffffff';
        for (let i = 160; i <= 340; i += 40) {
            ctx.fillRect(i, 155, 24, 35);
            ctx.fillRect(i, 225, 24, 35);
        }

        ctx.fillStyle = '#00d2ff';
        ctx.beginPath(); ctx.arc(256, 210, 42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(256, 210, 16, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#111827';
        ctx.fillRect(190, 20, 132, 70);
        ctx.fillRect(140, 90, 232, 20);

        const caineTex = new THREE.CanvasTexture(caineCanvas);
        this.caineMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(5.2, 5.2),
            new THREE.MeshStandardMaterial({ map: caineTex, transparent: true, side: THREE.DoubleSide })
        );
        this.caineMesh.position.copy(this.cainePos);
        this.scene.add(this.caineMesh);

        // 2. Bolha Ajudante
        const bubbleCanvas = document.createElement('canvas');
        bubbleCanvas.width = 256; bubbleCanvas.height = 256;
        const bCtx = bubbleCanvas.getContext('2d');
        bCtx.clearRect(0, 0, 256, 256);

        const grad = bCtx.createRadialGradient(110, 110, 10, 128, 128, 55);
        grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#38bdf8');
        grad.addColorStop(0.8, '#facc15'); grad.addColorStop(1, '#0284c7');
        bCtx.fillStyle = grad; bCtx.beginPath(); bCtx.arc(128, 128, 55, 0, Math.PI * 2); bCtx.fill();

        bCtx.fillStyle = '#ffffff';
        for (let i = 98; i <= 148; i += 16) {
            bCtx.beginPath(); bCtx.moveTo(i, 130); bCtx.lineTo(i + 8, 148); bCtx.lineTo(i + 16, 130); bCtx.fill();
        }

        const bubbleTex = new THREE.CanvasTexture(bubbleCanvas);
        this.bubbleMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.6, 2.6),
            new THREE.MeshStandardMaterial({ map: bubbleTex, transparent: true, side: THREE.DoubleSide })
        );
        this.bubbleMesh.position.copy(this.bubblePos);
        this.scene.add(this.bubbleMesh);
    }

    // --- ATAQUE DO CAINE: ABSTRAÇÃO (Esfera Abstrata Glitch com Olhos) ---
    fireAbstractionAttack() {
        if (!this.active) return;

        const absCanvas = document.createElement('canvas');
        absCanvas.width = 128; absCanvas.height = 128;
        const ctx = absCanvas.getContext('2d');
        ctx.fillStyle = '#110022'; ctx.beginPath(); ctx.arc(64, 64, 55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff0044'; ctx.fillRect(20, 20, 88, 88);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(45, 55, 12, 0, Math.PI * 2); ctx.arc(83, 55, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(45, 55, 5, 0, Math.PI * 2); ctx.arc(83, 55, 5, 0, Math.PI * 2); ctx.fill();

        const absTex = new THREE.CanvasTexture(absCanvas);
        const absMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 1.5),
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
