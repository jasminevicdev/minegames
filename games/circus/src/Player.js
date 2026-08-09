import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class Player {
    constructor(camera, domElement, sceneManager) {
        this.camera = camera;
        this.sceneManager = sceneManager;

        // Pointer Lock Controls (Controle por mouse estilo FPS)
        this.controls = new PointerLockControls(camera, domElement);

        // Estado de Movimento
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        // Física e Velocidade
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 18.0;
        this.jumpForce = 12.0;
        this.gravity = 30.0;

        // Posição Inicial
        this.camera.position.set(0, 2.5, 20);

        this.initListeners();
    }

    initListeners() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = true;
                    break;
                case 'Space':
                    if (this.canJump) {
                        this.velocity.y += this.jumpForce;
                        this.canJump = false;
                    }
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    update(delta) {
        if (!this.controls.isLocked) return;

        // Resets e Atrito
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= this.gravity * delta; // Gravidade

        // Vetor de Direção do Movimento
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.speed * 10.0 * delta;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.speed * 10.0 * delta;
        }

        // Aplicar Movimento Relativo à Câmera
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);

        // Movimento Vertical (Pulo / Chão)
        this.camera.position.y += this.velocity.y * delta;

        // Colisão Básica com o Chão (Y = 2.5)
        if (this.camera.position.y < 2.5) {
            this.velocity.y = 0;
            this.camera.position.y = 2.5;
            this.canJump = true;
        }

        // Limite dos Muros da Tenda (Distância do Centro)
        const distFromCenter = Math.sqrt(this.camera.position.x ** 2 + this.camera.position.z ** 2);
        const maxRadius = 40.0;
        if (distFromCenter > maxRadius) {
            const angle = Math.atan2(this.camera.position.z, this.camera.position.x);
            this.camera.position.x = Math.cos(angle) * maxRadius;
            this.camera.position.z = Math.sin(angle) * maxRadius;
        }
    }
}
