// Accessibility Panel Logic
var isTTSActive = false;
var isHighContrast = false;
var currentFontSize = 16;
var currentTTSVoice = null;
// Enhanced contrast theme cycling for accessibility
var currentContrastTheme = 0; // 0: default, 1: high contrast, 2: dark mode, 3: light mode, 4: color-blind friendly
const contrastThemes = ['default', 'high-contrast', 'dark-mode', 'light-mode', 'color-blind-mode'];

window.selectTTSVoice = function(lang) {
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (lang === 'en') {
        selectedVoice = voices.find(voice => voice.name === 'Awasili') ||
                       voices.find(voice => voice.name === 'Asilia') ||
                       voices.find(voice => voice.lang === 'en-KE') ||
                       voices.find(voice => voice.lang.startsWith('en-US')) ||
                       voices.find(voice => voice.lang.startsWith('en-GB')) ||
                       voices.find(voice => voice.lang.startsWith('en'));
    } else if (lang === 'sw') {
        selectedVoice = voices.find(voice => voice.lang === 'sw-KE') ||
                       voices.find(voice => voice.lang.startsWith('sw'));
    } else if (lang === 'fr') {
        selectedVoice = voices.find(voice => voice.lang.startsWith('fr'));
    } else if (lang === 'ar') {
        selectedVoice = voices.find(voice => voice.lang.startsWith('ar'));
    }
    currentTTSVoice = selectedVoice || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
};

window.toggleAccessibilityPanel = function() {
    const controls = document.querySelector('.accessibility-controls');
    controls.classList.toggle('active');
};

window.toggleTextToSpeech = function() {
    isTTSActive = !isTTSActive;
    const ttsButton = document.getElementById('ttsToggle');
    if (isTTSActive) {
        ttsButton.classList.add('active');
        window.readPageContent();
    } else {
        ttsButton.classList.remove('active');
        window.speechSynthesis.cancel();
    }
};

window.stopTTS = function(external) {
    if (window._ttsStopped) return; // Only allow once
    window._ttsStopped = true;
    isTTSActive = false;
    window.speechSynthesis.cancel();
    const ttsButton = document.getElementById('ttsToggle');
    if (ttsButton) ttsButton.classList.remove('active');
    if (!external) {
        // Broadcast to other tabs
        if (ttsChannel) {
            ttsChannel.postMessage('stop-tts');
        } else {
            localStorage.setItem('tts-stop', '1');
            setTimeout(() => localStorage.removeItem('tts-stop'), 100);
        }
    }
};

window.readPageContent = function() {
    if (!isTTSActive) return;
    // Gather content to read
    const currentLang = document.documentElement.lang || 'en';
    if (currentLang !== 'en') return; // Only use Polly for English for now
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'))
        .map(link => link.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('. ');
    const mainContent = Array.from(document.querySelectorAll('[data-translate]'))
        .filter(el => el.getAttribute('data-lang') === currentLang || !el.getAttribute('data-lang'))
        .map(el => el.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join(' ');
    const text = navLinks + '. ' + mainContent;
    if (!text.trim()) return;
    fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
    .then(res => {
        if (!res.ok) throw new Error('TTS failed');
        return res.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    })
    .catch(err => {
        console.error('TTS error:', err);
    });
};

window.increaseFontSize = function() {
    currentFontSize += 2;
    document.body.style.fontSize = currentFontSize + 'px';
};
window.decreaseFontSize = function() {
    currentFontSize = Math.max(12, currentFontSize - 2);
    document.body.style.fontSize = currentFontSize + 'px';
};

window.toggleContrastTheme = function() {
    // Remove all contrast classes
    document.body.classList.remove('high-contrast', 'dark-mode', 'light-mode', 'color-blind-mode');
    currentContrastTheme = (currentContrastTheme + 1) % contrastThemes.length;
    if (currentContrastTheme > 0) {
        document.body.classList.add(contrastThemes[currentContrastTheme]);
    }
};

window.resetAccessibility = function() {
    currentFontSize = 16;
    document.body.style.fontSize = '';
    document.body.classList.remove('high-contrast', 'dark-mode', 'light-mode', 'color-blind-mode');
    currentContrastTheme = 0;
    isTTSActive = false;
    window.speechSynthesis.cancel();
    const ttsButton = document.getElementById('ttsToggle');
    if (ttsButton) ttsButton.classList.remove('active');
};

document.addEventListener('DOMContentLoaded', () => {
    window.selectTTSVoice(document.documentElement.lang || 'en');
    // Always auto-start TTS on page load
    isTTSActive = true;
    setTimeout(() => window.readPageContent(), 800);
});

// Removed language-related functions as language handling is consolidated in language-handler.js
// function changeLanguage() { ... }
// function applyTranslations(language) { ... }
// function updateDynamicContent(language) { ... }
// document.addEventListener('DOMContentLoaded', () => { ... });

// --- Cross-tab TTS Stop Logic ---
(function() {
    // Use BroadcastChannel if available, else fallback to localStorage events
    let ttsChannel = null;
    if (window.BroadcastChannel) {
        ttsChannel = new BroadcastChannel('tts-control');
        ttsChannel.onmessage = function(e) {
            if (e.data === 'stop-tts') {
                window._externalTTSStop = true;
                window.stopTTS(true); // true = external
            }
        };
    } else {
        window.addEventListener('storage', function(e) {
            if (e.key === 'tts-stop' && e.newValue === '1') {
                window._externalTTSStop = true;
                window.stopTTS(true); // true = external
            }
        });
    }

    // Patch stopTTS to broadcast
    const origStopTTS = window.stopTTS;
    window.stopTTS = function(external) {
        if (window._ttsStopped) return; // Only allow once
        window._ttsStopped = true;
        origStopTTS && origStopTTS();
        if (!external) {
            // Broadcast to other tabs
            if (ttsChannel) {
                ttsChannel.postMessage('stop-tts');
            } else {
                localStorage.setItem('tts-stop', '1');
                setTimeout(() => localStorage.removeItem('tts-stop'), 100);
            }
        }
    };

    // Reset _ttsStopped on page load
    window._ttsStopped = false;
    window._externalTTSStop = false;
    document.addEventListener('DOMContentLoaded', function() {
        window._ttsStopped = false;
        window._externalTTSStop = false;
    });
})();