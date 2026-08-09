// ThemeManager.js - Gerenciador Central de Tema Claro/Escuro (Light/Dark Mode)
export class ThemeManager {
    static STORAGE_KEY = 'jasdev_theme';

    static getInitialTheme() {
        try {
            const saved = localStorage.getItem(ThemeManager.STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
        } catch (e) {
            console.error('Erro ao ler tema:', e);
        }

        // Verifica preferência do sistema operacional / navegador
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    static applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(ThemeManager.STORAGE_KEY, theme);
        } catch (e) {
            console.error('Erro ao salvar tema:', e);
        }
    }

    static getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || ThemeManager.getInitialTheme();
    }

    static toggleTheme() {
        const current = ThemeManager.getCurrentTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        ThemeManager.applyTheme(next);
        return next;
    }

    static initAutoDetection(onThemeChangeCallback = null) {
        const theme = ThemeManager.getInitialTheme();
        ThemeManager.applyTheme(theme);

        // Ouve mudanças na preferência do SO caso o usuário não tenha salvado nada manualmente
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(ThemeManager.STORAGE_KEY)) {
                    const newSystemTheme = e.matches ? 'dark' : 'light';
                    ThemeManager.applyTheme(newSystemTheme);
                    if (onThemeChangeCallback) onThemeChangeCallback(newSystemTheme);
                }
            });
        }

        return theme;
    }
}
