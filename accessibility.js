// Accessibility Panel Logic
var isTTSActive = false;
var isHighContrast = false;
var currentFontSize = 16;
var currentTTSVoice = null;
var currentContrastTheme = 0; // 0: default, 1: high contrast, 2: orange, 3: blue
const contrastThemes = ['default', 'high-contrast', 'contrast-theme-orange', 'contrast-theme-blue'];

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

window.stopTTS = function() {
    isTTSActive = false;
    window.speechSynthesis.cancel();
    const ttsButton = document.getElementById('ttsToggle');
    if (ttsButton) ttsButton.classList.remove('active');
};

window.readPageContent = function() {
    window.speechSynthesis.cancel(); // Always stop previous speech
    if (!isTTSActive) return;
    const currentLang = document.documentElement.lang || 'en';
    const speakText = (text, rate = 1) => {
        if (!text) return null;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = currentLang;
        if (currentTTSVoice) utterance.voice = currentTTSVoice;
        return utterance;
    };
    const utterances = [];
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const text = link.textContent.replace(/\s+/g, ' ').trim();
        if (text) {
            const utterance = speakText(text, 0.9);
            if (utterance) utterances.push(utterance);
        }
    });
    const mainContent = Array.from(document.querySelectorAll('[data-translate]'))
        .filter(el => el.getAttribute('data-lang') === currentLang || !el.getAttribute('data-lang'))
        .map(el => el.textContent.replace(/\s+/g, ' ').trim())
        .filter(text => text)
        .join(' ');
    if (mainContent) {
        const utterance = speakText(mainContent, 1);
        if (utterance) utterances.push(utterance);
    }
    const speakNext = (index) => {
        if (index < utterances.length) {
            const utterance = utterances[index];
            utterance.onend = () => setTimeout(() => speakNext(index + 1), 500);
            window.speechSynthesis.speak(utterance);
        }
    };
    speakNext(0);
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
    document.body.classList.remove('high-contrast', 'contrast-theme-orange', 'contrast-theme-blue');
    currentContrastTheme = (currentContrastTheme + 1) % contrastThemes.length;
    if (currentContrastTheme > 0) {
        document.body.classList.add(contrastThemes[currentContrastTheme]);
    }
};

window.resetAccessibility = function() {
    currentFontSize = 16;
    document.body.style.fontSize = '';
    document.body.classList.remove('high-contrast', 'contrast-theme-orange', 'contrast-theme-blue');
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