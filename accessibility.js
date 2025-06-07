// Accessibility Widget
class AccessibilityWidget {
    constructor() {
        this.createWidget();
        this.initializeScreenReader();
        this.addARIALabels();
        this.setupImageDescriptions();
        this.isReading = false;
        this.currentUtterance = null;
        this.readingQueue = [];
        this.currentIndex = 0;
        this.isPaused = false;
        
        // Auto-start screen reader when page loads
        this.autoStartScreenReader();
    }

    getKenyanVoice() {
        const voices = speechSynthesis.getVoices();
        
        // First try to find a Kenyan English voice
        let kenyanVoice = voices.find(voice => 
            voice.lang.includes('en-KE') || 
            voice.name.toLowerCase().includes('kenya')
        );

        // If no Kenyan voice is found, try to find an East African English voice
        if (!kenyanVoice) {
            kenyanVoice = voices.find(voice => 
                voice.lang.includes('en-UG') || 
                voice.lang.includes('en-TZ') ||
                voice.name.toLowerCase().includes('africa')
            );
        }

        // If still no voice found, try to find a British English voice (closer to Kenyan English)
        if (!kenyanVoice) {
            kenyanVoice = voices.find(voice => 
                voice.lang.includes('en-GB') || 
                voice.name.toLowerCase().includes('british')
            );
        }

        // If no suitable voice is found, use the default voice
        return kenyanVoice || voices[0];
    }

    autoStartScreenReader() {
        // Wait for voices to be loaded
        if (speechSynthesis.getVoices().length > 0) {
            this.startReading();
        } else {
            // If voices aren't loaded yet, wait for them
            speechSynthesis.onvoiceschanged = () => {
                this.startReading();
            };
        }
    }

    startReading() {
        // Get all readable content
        const mainContent = document.querySelector('main') || document.body;
        const content = this.getReadableContent(mainContent);
        
        // Start reading with Kenyan voice
        this.readingQueue = content;
        this.currentIndex = 0;
        this.readNextInQueue();
        
        // Show reading controls
        document.getElementById('reading-controls').style.display = 'flex';
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
                <button id="readPage" aria-label="Read entire page">
                    <i class="fas fa-book-reader"></i> Read Page
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

        // Create reading controls
        const controls = document.createElement('div');
        controls.id = 'reading-controls';
        controls.style.display = 'none';
        controls.innerHTML = `
            <button id="pauseReading" aria-label="Pause reading">
                <i class="fas fa-pause"></i>
            </button>
            <button id="resumeReading" aria-label="Resume reading" style="display: none;">
                <i class="fas fa-play"></i>
            </button>
            <button id="stopReading" aria-label="Stop reading">
                <i class="fas fa-stop"></i>
            </button>
        `;
        document.body.appendChild(controls);

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

        document.getElementById('readPage').addEventListener('click', () => {
            this.readEntirePage();
            document.getElementById('reading-controls').style.display = 'flex';
        });

        document.getElementById('pauseReading').addEventListener('click', () => {
            this.pauseReading();
        });

        document.getElementById('resumeReading').addEventListener('click', () => {
            this.resumeReading();
        });

        document.getElementById('stopReading').addEventListener('click', () => {
            this.stopReading();
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

    readEntirePage() {
        this.stopSpeaking();
        this.readingQueue = [];
        this.currentIndex = 0;
        
        // Get all readable content in order
        const contentNodes = this.getReadableContent(document.body);
        this.readingQueue = contentNodes;
        
        // Start reading
        this.readNextInQueue();
        
        // Show reading controls
        document.getElementById('reading-controls').style.display = 'flex';
    }

    getReadableContent(element) {
        const readableElements = [];
        
        // Helper function to check if text is meaningful
        const isMeaningfulText = (text) => {
            return text.trim().length > 0 && !/^[\s\r\n]+$/.test(text);
        };

        // Helper function to get element's display style
        const isVisible = (elem) => {
            return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        };

        // Recursively gather readable content
        const traverse = (node) => {
            // Skip hidden elements
            if (node.nodeType === Node.ELEMENT_NODE && !isVisible(node)) {
                return;
            }

            // Handle text nodes
            if (node.nodeType === Node.TEXT_NODE && isMeaningfulText(node.textContent)) {
                readableElements.push({
                    type: 'text',
                    content: node.textContent.trim(),
                    element: node.parentElement
                });
                return;
            }

            // Handle images
            if (node.nodeName === 'IMG') {
                const description = node.getAttribute('data-description') || node.alt;
                if (description) {
                    readableElements.push({
                        type: 'image',
                        content: `Image: ${description}`,
                        element: node
                    });
                }
                return;
            }

            // Handle form elements
            if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(node.nodeName)) {
                const label = node.getAttribute('aria-label') || node.placeholder || node.value;
                if (label) {
                    readableElements.push({
                        type: 'form',
                        content: `${node.nodeName.toLowerCase()}: ${label}`,
                        element: node
                    });
                }
                return;
            }

            // Recursively process child nodes
            if (node.childNodes) {
                Array.from(node.childNodes).forEach(traverse);
            }
        };

        traverse(element);
        return readableElements;
    }

    readNextInQueue() {
        if (this.isPaused || this.currentIndex >= this.readingQueue.length) {
            if (this.currentIndex >= this.readingQueue.length) {
                this.stopReading();
            }
            return;
        }

        const item = this.readingQueue[this.currentIndex];
        const utterance = new SpeechSynthesisUtterance(item.content);
        
        // Set Kenyan voice
        utterance.voice = this.getKenyanVoice();
        
        // Adjust speech parameters for better clarity
        utterance.rate = 0.9; // Slightly slower for better understanding
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Highlight current element being read
        if (item.element) {
            item.element.classList.add('currently-reading');
        }

        utterance.onend = () => {
            if (item.element) {
                item.element.classList.remove('currently-reading');
            }
            this.currentIndex++;
            this.readNextInQueue();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.currentIndex++;
            this.readNextInQueue();
        };

        window.speechSynthesis.speak(utterance);
        this.currentUtterance = utterance;
    }

    pauseReading() {
        this.isPaused = true;
        window.speechSynthesis.pause();
        document.getElementById('pauseReading').style.display = 'none';
        document.getElementById('resumeReading').style.display = 'block';
    }

    resumeReading() {
        this.isPaused = false;
        window.speechSynthesis.resume();
        document.getElementById('pauseReading').style.display = 'block';
        document.getElementById('resumeReading').style.display = 'none';
        this.readNextInQueue();
    }

    stopReading() {
        this.stopSpeaking();
        this.readingQueue = [];
        this.currentIndex = 0;
        this.isPaused = false;
        document.getElementById('reading-controls').style.display = 'none';
        
        // Remove any highlighting
        const highlighted = document.querySelectorAll('.currently-reading');
        highlighted.forEach(el => el.classList.remove('currently-reading'));
    }
}

// Initialize the widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityWidget();
}); 