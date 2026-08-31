import * as THREE from 'three';

export class Player2D {
    constructor(scene, soundManager, characterType = 'pomni') {
        this.scene = scene;
        this.soundManager = soundManager;
        this.characterType = characterType;

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
    }

    createCharacterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);

        switch (this.characterType) {
            case 'jax': this.drawJax(ctx); break;
            case 'kinger': this.drawKinger(ctx); break;
            case 'gangle': this.drawGangle(ctx); break;
            case 'zooble': this.drawZooble(ctx); break;
            case 'caine': this.drawCaine(ctx); break;
            case 'bubble': this.drawBubble(ctx); break;
            case 'pomni': default: this.drawPomni(ctx); break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    drawPomni(ctx) {
        ctx.fillStyle = '#ff2a5f'; ctx.beginPath(); ctx.arc(128, 175, 48, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
        ctx.fillStyle = '#00d2ff'; ctx.beginPath(); ctx.arc(128, 175, 48, Math.PI * 1.5, Math.PI * 0.5); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(128, 160, 10, 0, Math.PI * 2); ctx.arc(128, 185, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(75, 175, 14, 0, Math.PI * 2); ctx.arc(181, 175, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffedd8'; ctx.beginPath(); ctx.arc(128, 105, 44, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(108, 100, 16, 20, 0, 0, Math.PI * 2); ctx.ellipse(148, 100, 16, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff2a5f'; ctx.beginPath(); ctx.arc(110, 100, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#00d2ff'; ctx.beginPath(); ctx.arc(146, 100, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(107, 96, 4, 0, Math.PI * 2); ctx.arc(143, 96, 4, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#331122'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(128, 126, 11, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();

        ctx.fillStyle = '#ff2a5f'; ctx.beginPath(); ctx.moveTo(98, 70); ctx.quadraticCurveTo(55, 30, 35, 60); ctx.quadraticCurveTo(75, 70, 115, 70); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(35, 60, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#00d2ff'; ctx.beginPath(); ctx.moveTo(158, 70); ctx.quadraticCurveTo(201, 30, 221, 60); ctx.quadraticCurveTo(181, 70, 141, 70); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(221, 60, 9, 0, Math.PI * 2); ctx.fill();
    }

    drawJax(ctx) {
        ctx.fillStyle = '#ff66b2'; ctx.beginPath(); ctx.roundRect(98, 140, 60, 80, 20); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.fillRect(108, 140, 8, 30); ctx.fillRect(140, 140, 8, 30);
        ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(128, 100, 42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.ellipse(100, 35, 12, 35, -0.2, 0, Math.PI * 2); ctx.ellipse(156, 35, 12, 35, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.ellipse(100, 35, 6, 25, -0.2, 0, Math.PI * 2); ctx.ellipse(156, 35, 6, 25, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.ellipse(112, 95, 12, 16, 0, 0, Math.PI * 2); ctx.ellipse(144, 95, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(114, 95, 4, 0, Math.PI * 2); ctx.arc(142, 95, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(128, 112, 18, 0, Math.PI); ctx.stroke();
    }

    drawKinger(ctx) {
        ctx.fillStyle = '#6b21a8'; ctx.beginPath(); ctx.moveTo(70, 230); ctx.lineTo(128, 120); ctx.lineTo(186, 230); ctx.fill();
        ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(128, 110, 38, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.fillRect(123, 50, 10, 25); ctx.fillRect(115, 58, 26, 10);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(104, 105, 18, 0, Math.PI * 2); ctx.arc(152, 105, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(104, 105, 5, 0, Math.PI * 2); ctx.arc(152, 105, 5, 0, Math.PI * 2); ctx.fill();
    }

    drawGangle(ctx) {
        ctx.strokeStyle = '#ff2a5f'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(128, 90); ctx.bezierCurveTo(70, 120, 180, 160, 128, 230); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(128, 80, 36, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(114, 76, 5, 0, Math.PI * 2); ctx.arc(142, 76, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(128, 92, 12, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    }

    drawZooble(ctx) {
        ctx.fillStyle = '#00d2ff'; ctx.fillRect(98, 140, 60, 70);
        ctx.fillStyle = '#ff2a5f'; ctx.fillRect(102, 210, 14, 30);
        ctx.fillStyle = '#00ff88'; ctx.fillRect(140, 210, 14, 30);
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.moveTo(128, 55); ctx.lineTo(88, 125); ctx.lineTo(168, 125); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff0055'; ctx.beginPath(); ctx.arc(128, 95, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(128, 95, 4, 0, Math.PI * 2); ctx.fill();
    }

    drawCaine(ctx) {
        ctx.fillStyle = '#dc2626'; ctx.fillRect(98, 150, 60, 75);
        ctx.fillStyle = '#000000'; ctx.fillRect(118, 150, 20, 12);
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(128, 80, 48, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(128, 120, 48, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#ffffff';
        for (let i = 85; i <= 165; i += 20) { ctx.fillRect(i, 78, 12, 16); ctx.fillRect(i, 106, 12, 16); }
        ctx.fillStyle = '#00d2ff'; ctx.beginPath(); ctx.arc(128, 100, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(128, 100, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111827'; ctx.fillRect(100, 20, 56, 35); ctx.fillRect(80, 50, 96, 8);
    }

    drawBubble(ctx) {
        const grad = ctx.createRadialGradient(110, 110, 10, 128, 128, 55);
        grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#38bdf8');
        grad.addColorStop(0.8, '#facc15'); grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(128, 128, 55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        for (let i = 98; i <= 148; i += 16) { ctx.beginPath(); ctx.moveTo(i, 130); ctx.lineTo(i + 8, 148); ctx.lineTo(i + 16, 130); ctx.fill(); }
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(108, 105, 7, 0, Math.PI * 2); ctx.arc(148, 105, 7, 0, Math.PI * 2); ctx.fill();
    }

    createMesh() {
        const texture = this.createCharacterTexture();
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            roughness: 0.2,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
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
        this.shootCooldown = 0.22; // Cooldown ágil de disparo

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

        const bobbing = this.isGrounded && Math.abs(this.velocity.x) > 0.5 ? Math.sin(Date.now() * 0.015) * 0.08 : 0;
        this.mesh.position.set(this.position.x, this.position.y + bobbing, this.position.z);

        const pPositions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < pPositions.length / 3; i++) {
            pPositions[i * 3] += (this.position.x - pPositions[i * 3]) * 0.1;
            pPositions[i * 3 + 1] += (this.position.y - 0.5 - pPositions[i * 3 + 1]) * 0.1;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
