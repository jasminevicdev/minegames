import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a061e);
        this.scene.fog = new THREE.FogExp2(0x0a061e, 0.015);

        this.collidables = [];
        this.collectibles = [];
        this.exitDoor = null;

        this.initLights();
        this.createDigitalTent();
        this.createDecorations();
        this.createCollectibles();
        this.createExitDoor();
    }

    initLights() {
        // Luz Ambiente Colorida
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Luz Direcional Principal (Sol do Circo)
        const mainLight = new THREE.DirectionalLight(0xfff5cc, 1.2);
        mainLight.position.set(20, 40, 20);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -40;
        mainLight.shadow.camera.right = 40;
        mainLight.shadow.camera.top = 40;
        mainLight.shadow.camera.bottom = -40;
        this.scene.add(mainLight);

        // Luzes neon coloridas no centro da tenda
        const redSpot = new THREE.PointLight(0xff2a5f, 2, 35);
        redSpot.position.set(-15, 12, -15);
        this.scene.add(redSpot);

        const blueSpot = new THREE.PointLight(0x00d2ff, 2, 35);
        blueSpot.position.set(15, 12, 15);
        this.scene.add(blueSpot);

        const yellowSpot = new THREE.PointLight(0xffcc00, 2.5, 40);
        yellowSpot.position.set(0, 25, 0);
        this.scene.add(yellowSpot);
    }

    createDigitalTent() {
        const tentRadius = 45;
        const tentHeight = 35;

        // --- Chão Xadrez Vibrante ---
        const floorSize = 90;
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const numSquares = 8;
        const squareSize = canvas.width / numSquares;

        for (let i = 0; i < numSquares; i++) {
            for (let j = 0; j < numSquares; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillStyle = '#ff2a5f'; // Vermelho Neon
                } else {
                    ctx.fillStyle = '#00d2ff'; // Azul Cyan Digital
                }
                ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
            }
        }

        const floorTexture = new THREE.CanvasTexture(canvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(10, 10);

        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.3,
            metalness: 0.1
        });

        const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.collidables.push(floor);

        // --- Paredes da Tenda (Cilindro Listrado) ---
        const wallGeometry = new THREE.CylinderGeometry(tentRadius, tentRadius, tentHeight, 32, 1, true);
        
        // Criar textura de listras para a tenda (Vermelho / Amarelo / Azul)
        const tentCanvas = document.createElement('canvas');
        tentCanvas.width = 512;
        tentCanvas.height = 512;
        const tCtx = tentCanvas.getContext('2d');
        const stripes = 12;
        const stripeW = tentCanvas.width / stripes;
        const colors = ['#ff2a5f', '#ffcc00', '#7000ff', '#00d2ff'];

        for (let i = 0; i < stripes; i++) {
            tCtx.fillStyle = colors[i % colors.length];
            tCtx.fillRect(i * stripeW, 0, stripeW, tentCanvas.height);
        }

        const tentTexture = new THREE.CanvasTexture(tentCanvas);
        tentTexture.wrapS = THREE.RepeatWrapping;
        tentTexture.wrapT = THREE.RepeatWrapping;
        tentTexture.repeat.set(4, 1);

        const tentMaterial = new THREE.MeshStandardMaterial({
            map: tentTexture,
            side: THREE.BackSide,
            roughness: 0.6
        });

        const tentWall = new THREE.Mesh(wallGeometry, tentMaterial);
        tentWall.position.y = tentHeight / 2;
        this.scene.add(tentWall);

        // --- Teto em Cone da Tenda ---
        const roofGeometry = new THREE.ConeGeometry(tentRadius, 20, 32, 1, true);
        const roof = new THREE.Mesh(roofGeometry, tentMaterial);
        roof.position.y = tentHeight + 10;
        this.scene.add(roof);
    }

    createDecorations() {
        // Matérias Coloridos Stylized
        const matRed = new THREE.MeshStandardMaterial({ color: 0xff2a5f, roughness: 0.2 });
        const matYellow = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.2 });
        const matBlue = new THREE.MeshStandardMaterial({ color: 0x00d2ff, roughness: 0.2 });
        const matPurple = new THREE.MeshStandardMaterial({ color: 0x7000ff, roughness: 0.2 });

        const materials = [matRed, matYellow, matBlue, matPurple];

        // 1. Pilares / Blocos Gigantes de Brinquedo
        for (let i = 0; i < 10; i++) {
            const size = 2 + Math.random() * 3;
            const height = 3 + Math.random() * 8;
            const geo = new THREE.BoxGeometry(size, height, size);
            const mat = materials[i % materials.length];
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (i / 10) * Math.PI * 2;
            const radius = 15 + Math.random() * 15;
            mesh.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add(mesh);
            this.collidables.push(mesh);
        }

        // 2. Pirâmides Flutuantes Surreais
        for (let i = 0; i < 6; i++) {
            const geo = new THREE.ConeGeometry(2, 4, 4);
            const mat = materials[(i + 1) % materials.length];
            const pyramid = new THREE.Mesh(geo, mat);

            pyramid.position.set(
                (Math.random() - 0.5) * 50,
                8 + Math.random() * 10,
                (Math.random() - 0.5) * 50
            );
            pyramid.rotation.z = Math.PI;
            pyramid.castShadow = true;

            this.scene.add(pyramid);
            // Animação de flutuação armazenada na malha
            pyramid.userData = { initialY: pyramid.position.y, speed: 1.5 + Math.random() };
        }
    }

    createCollectibles() {
        const totalCollectibles = 8;
        const matHat = new THREE.MeshStandardMaterial({
            color: 0x111122,
            roughness: 0.3,
            metalness: 0.2
        });
        const matRibbon = new THREE.MeshStandardMaterial({
            color: 0xff2a5f,
            emissive: 0xff2a5f,
            emissiveIntensity: 0.5
        });

        for (let i = 0; i < totalCollectibles; i++) {
            const group = new THREE.Group();

            // Cartola - Base
            const brimGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16);
            const brim = new THREE.Mesh(brimGeo, matHat);
            brim.position.y = 0.05;
            group.add(brim);

            // Cartola - Corpo
            const crownGeo = new THREE.CylinderGeometry(0.8, 0.75, 1.2, 16);
            const crown = new THREE.Mesh(crownGeo, matHat);
            crown.position.y = 0.65;
            group.add crown;

            // Fita Vermelha da Cartola
            const ribbonGeo = new THREE.CylinderGeometry(0.77, 0.77, 0.2, 16);
            const ribbon = new THREE.Mesh(ribbonGeo, matRibbon);
            ribbon.position.y = 0.25;
            group.add(ribbon);

            // Esfera de Brilho Interna
            const glowGeo = new THREE.SphereGeometry(0.4, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 1.4;
            group.add(glow);

            // Posição em Círculo / Espalhada
            const angle = (i / totalCollectibles) * Math.PI * 2;
            const dist = 12 + (i % 2 === 0 ? 8 : 18);
            group.position.set(Math.cos(angle) * dist, 1.2, Math.sin(angle) * dist);

            group.userData = { id: i, active: true, initialY: group.position.y };
            this.scene.add(group);
            this.collectibles.push(group);
        }
    }

    createExitDoor() {
        // Porta de Saída "EXIT" estilo escritório glitch
        const doorGroup = new THREE.Group();

        // Moldura da Porta
        const frameGeo = new THREE.BoxGeometry(4.5, 7.5, 0.5);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.4 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 3.75;
        doorGroup.add(frame);

        // Painel da Porta
        const doorGeo = new THREE.BoxGeometry(3.8, 6.8, 0.3);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 3.75, 0.1);
        doorGroup.add(door);

        // Placa "EXIT" Luminosa
        const signGeo = new THREE.BoxGeometry(2.5, 1.0, 0.4);
        const signMat = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 6.8, 0.3);
        doorGroup.add(sign);

        // Posicionar porta na borda da tenda
        doorGroup.position.set(0, 0, -42);
        this.scene.add(doorGroup);
        this.exitDoor = doorGroup;
    }

    update(delta, time) {
        // Animar pirâmides flutuantes
        this.scene.traverse((obj) => {
            if (obj.userData && obj.userData.initialY && !obj.userData.active) {
                obj.position.y = obj.userData.initialY + Math.sin(time * obj.userData.speed) * 0.8;
                obj.rotation.y += delta * 0.5;
            }
        });

        // Animar cartolas coletáveis
        this.collectibles.forEach((item) => {
            if (item.userData.active) {
                item.rotation.y += delta * 1.8;
                item.position.y = item.userData.initialY + Math.sin(time * 3 + item.userData.id) * 0.3;
            }
        });
    }
}
