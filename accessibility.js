// Accessibility Widget
class AccessibilityWidget {
    constructor() {
        this.createWidget();
        this.initializeScreenReader();
        this.addARIALabels();
        this.setupImageDescriptions();
        this.isReading = false;
        this.currentUtterance = null;
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'accessibility-widget';
        widget.innerHTML = `
            <button aria-label="Open accessibility menu" class="accessibility-toggle">
                <i class="fas fa-universal-access"></i>
            </button>
            <div class="accessibility-menu">
                <h3>Accessibility Options</h3>
                <button id="screenReader" aria-label="Toggle screen reader">
                    <i class="fas fa-headphones"></i> Screen Reader
                </button>
                <button id="highContrast" aria-label="Toggle high contrast">
                    <i class="fas fa-adjust"></i> High Contrast
                </button>
                <button id="lightMode" aria-label="Toggle light mode">
                    <i class="fas fa-sun"></i> Light Mode
                </button>
                <button id="readingGuide" aria-label="Toggle reading guide">
                    <i class="fas fa-ruler-horizontal"></i> Reading Guide
                </button>
                <button id="increaseText" aria-label="Increase text size">
                    <i class="fas fa-plus"></i> Increase Text Size
                </button>
                <button id="decreaseText" aria-label="Decrease text size">
                    <i class="fas fa-minus"></i> Decrease Text Size
                </button>
                <button id="resetAll" aria-label="Reset all accessibility settings">
                    <i class="fas fa-undo"></i> Reset All
                </button>
            </div>
        `;
        document.body.appendChild(widget);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const toggle = document.querySelector('.accessibility-toggle');
        const menu = document.querySelector('.accessibility-menu');
        
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
        });

        document.getElementById('screenReader').addEventListener('click', (e) => {
            this.toggleScreenReader();
            e.target.classList.toggle('active');
        });

        document.getElementById('highContrast').addEventListener('click', (e) => {
            document.body.classList.toggle('high-contrast');
            e.target.classList.toggle('active');
        });

        document.getElementById('lightMode').addEventListener('click', (e) => {
            document.body.classList.toggle('light-mode');
            e.target.classList.toggle('active');
        });

        document.getElementById('readingGuide').addEventListener('click', (e) => {
            this.toggleReadingGuide();
            e.target.classList.toggle('active');
        });

        document.getElementById('increaseText').addEventListener('click', () => {
            this.adjustTextSize(1.1);
        });

        document.getElementById('decreaseText').addEventListener('click', () => {
            this.adjustTextSize(0.9);
        });

        document.getElementById('resetAll').addEventListener('click', () => {
            this.resetAllSettings();
        });
    }

    toggleScreenReader() {
        if (!window.speechSynthesis) {
            alert('Screen reader is not supported in your browser');
            return;
        }
        
        const isActive = document.body.classList.toggle('screen-reader-active');
        if (isActive) {
            document.addEventListener('mouseover', this.speakElement);
            document.addEventListener('click', this.handleClick.bind(this));
        } else {
            document.removeEventListener('mouseover', this.speakElement);
            document.removeEventListener('click', this.handleClick.bind(this));
            this.stopSpeaking();
        }
    }

    handleClick(event) {
        const element = event.target;
        if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
            this.readSection(element);
        }
    }

    readSection(headerElement) {
        this.stopSpeaking();
        
        let textToRead = headerElement.textContent + '. ';
        let nextElement = headerElement.nextElementSibling;
        
        while (nextElement && !['H1', 'H2', 'H3'].includes(nextElement.tagName)) {
            if (nextElement.textContent.trim()) {
                textToRead += nextElement.textContent + '. ';
            }
            nextElement = nextElement.nextElementSibling;
        }

        const utterance = new SpeechSynthesisUtterance(textToRead);
        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    stopSpeaking() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    speakElement = (event) => {
        const element = event.target;
        let textToSpeak = '';

        // Handle different element types
        if (element.tagName === 'IMG') {
            textToSpeak = element.alt || element.getAttribute('aria-label') || 'Image';
            const description = element.getAttribute('data-description');
            if (description) {
                textToSpeak += ': ' + description;
            }
        } else if (element.tagName === 'FORM') {
            textToSpeak = 'Form: ' + (element.getAttribute('aria-label') || 'Please fill out this form');
        } else if (element.tagName === 'INPUT') {
            textToSpeak = (element.getAttribute('aria-label') || element.placeholder || element.type) + ' input field';
        } else if (element.tagName === 'BUTTON') {
            textToSpeak = 'Button: ' + (element.getAttribute('aria-label') || element.textContent);
        } else if (element.tagName === 'A') {
            textToSpeak = 'Link: ' + (element.getAttribute('aria-label') || element.textContent);
        } else {
            textToSpeak = element.textContent;
        }

        if (textToSpeak && window.speechSynthesis && !this.isReading) {
            this.isReading = true;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onend = () => {
                this.isReading = false;
            };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }

    setupImageDescriptions() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt) {
                const src = img.src.split('/').pop();
                img.alt = this.generateImageDescription(src);
            }
            
            // Add detailed descriptions for important images
            if (img.classList.contains('logo')) {
                img.setAttribute('data-description', 'Shield Maidens organization logo, representing our commitment to protecting and empowering women in digital spaces');
            }
            if (img.src.includes('hero') || img.src.includes('banner')) {
                img.setAttribute('data-description', 'A banner image showcasing our mission of digital safety and empowerment');
            }
        });
    }

    generateImageDescription(filename) {
        // Convert filename to readable description
        return filename
            .replace(/[_-]/g, ' ')
            .replace(/\.\w+$/, '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    toggleReadingGuide() {
        if (document.getElementById('reading-guide')) {
            document.getElementById('reading-guide').remove();
        } else {
            const guide = document.createElement('div');
            guide.id = 'reading-guide';
            document.body.appendChild(guide);
            
            document.addEventListener('mousemove', (e) => {
                guide.style.top = `${e.pageY - 20}px`;
            });
        }
    }

    adjustTextSize(factor) {
        const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
        document.body.style.fontSize = `${currentSize * factor}px`;
    }

    resetAllSettings() {
        document.body.classList.remove('high-contrast', 'light-mode', 'screen-reader-active');
        document.body.style.fontSize = '';
        if (document.getElementById('reading-guide')) {
            document.getElementById('reading-guide').remove();
        }
        this.stopSpeaking();
        
        // Reset all buttons to inactive state
        const buttons = document.querySelectorAll('.accessibility-menu button');
        buttons.forEach(button => button.classList.remove('active'));
    }

    initializeScreenReader() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', element.textContent || element.placeholder || element.value || element.type);
            }
        });
    }

    addARIALabels() {
        // Add ARIA labels to forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.getAttribute('aria-label')) {
                form.setAttribute('aria-label', 'Form');
            }
            
            // Label form fields
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (!input.getAttribute('aria-label')) {
                    const label = input.previousElementSibling;
                    if (label && label.tagName === 'LABEL') {
                        input.setAttribute('aria-label', label.textContent);
                    } else {
                        input.setAttribute('aria-label', input.placeholder || input.name || input.type);
                    }
                }
            });
        });

        // Add ARIA labels to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', button.textContent);
            }
        });

        // Add roles to navigation elements
        const navElements = document.querySelectorAll('nav, header, main, footer');
        navElements.forEach(element => {
            if (!element.getAttribute('role')) {
                element.setAttribute('role', element.tagName.toLowerCase());
            }
        });
    }
}

// Initialize the widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityWidget();
}); 