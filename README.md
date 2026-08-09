# 🎪🎮 JasDEV Game Hub (MineGames)

Um **Hub de Jogos 3D e 2D interativos e educativos**, construído com **HTML5, CSS3, JavaScript ES6 e Three.js**. O projeto foi desenhado com foco em **alta usabilidade para crianças**, design responsivo (mobile, tablet e desktop) e **sistema de save único por perfil de jogador**.

![Licença MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Tecnologias](https://img.shields.io/badge/tech-Three.js%20%7C%20JS%20ES6%20%7C%20CSS3-blue.svg)

---

## 🕹️ Jogos Incluídos

| Jogo | Ícone | Descrição |
|---|---|---|
| **Circo da JasDEV** | 🎪 | Jogo de plataforma 2D no universo *O Incrível Circo Digital*. Possui 5 fases, coletáveis, monstros abstraídos e batalha de chefão contra Caine e Bolha. |
| **Snake 3D** | 🐍 | O clássico jogo da cobrinha reimaginado em 3D neon. Maçãs iluminadas, crescimento continuo e controles D-Pad touch para celular. |
| **Tetris 3D** | 🟦 | Encaixe peças tridimensionais, complete e destrua linhas para pontuar e subir de nível. |
| **Flappy Bird 3D** | 🐦 | Voe com o passarinho 3D desviando dos canos. Suporta toque na tela inteira (mobile) ou tecla Espaço. |

---

## 🌟 Principais Recursos

- **👤 Perfil Único de Jogador**: Crie perfis com nome e avatar emoji (🎪 🦊 🐰 🚀 🌟 🦄 🐲 🤖).
- **💾 Save Centralizado (`SaveHub.js`)**: O mesmo perfil mantém o progresso e os recordes em todos os 4 jogos simultaneamente via `localStorage`.
- **📱 Responsivo & Mobile-First**: Funciona perfeitamente em telas pequenas e grandes, em orientação retrato e paisagem, com suporte a safe area insets (notches de celular).
- **🔗 Navegação por Páginas (F5 Suportado)**: Cada jogo fica em sua própria subpasta e possui o botão **🏠 HUB** para retornar a qualquer momento.

---

## 🚀 Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jasminevicdev/minegames.git
   cd minegames
   ```

2. **Abra com um servidor HTTP simples (recomendado para carregar os módulos ES6 do Three.js):**
   ```bash
   python -m http.server 8085
   ```

3. **Acesse no seu navegador:**
   ```text
   http://localhost:8085
   ```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3** (Vanilla CSS, Glassmorphism, CSS Grid & Flexbox)
- **JavaScript (ES6 Modules)**
- **Three.js (v0.160.0)** para renderização 3D de cenários, iluminação, malhas e câmeras
- **Google Fonts** (*Fredoka* & *Outfit*)

---

## 📜 Licença

Este projeto está licenciado sob a licença **MIT** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

Desenvolvido com 💖 por **Jas Victor** (`jasminevic.dantass@gmail.com`).
