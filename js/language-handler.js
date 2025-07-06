/* The translations object was moved to translations.js to avoid conflicts. */
// Language translations object


// Function to store the selected language in local storage
function storeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
}

// Function to get the selected language from local storage
function getStoredLanguage() {
    return localStorage.getItem('selectedLanguage') || 'en'; // Default to English
}

// Function to update content based on the selected language
function updateContent(lang) {
    console.log('updateContent called with language:', lang); // Log 4
    // Use specific translations object based on the current page
    let translations;
    const path = window.location.pathname;
    console.log('Current path:', path); // Add this for debugging

    // Normalize path for matching
    const decodedPath = decodeURIComponent(path);
    if (decodedPath.includes('report.html') || decodedPath.endsWith('/report')) {
        translations = window.reportTranslations;
        console.log('Using reportTranslations for report.html or /report');
    } else if (decodedPath.includes('donate.html') || decodedPath.endsWith('/donate')) {
        translations = window.donateTranslations;
        console.log('Using donateTranslations for donate.html or /donate');
    } else if (decodedPath.includes('partner.html') || decodedPath.endsWith('/partner')) {
        translations = window.partnerTranslations;
        console.log('Using partnerTranslations for partner.html or /partner');
    } else if (decodedPath.includes('events.html') || decodedPath.endsWith('/events')) {
        translations = window.eventsTranslations;
        console.log('Using eventsTranslations for events.html or /events');
    } else if (decodedPath.includes('news.html') || decodedPath.endsWith('/news')) {
        translations = window.newsTranslations;
        console.log('Using newsTranslations for news.html or /news');
    } else if (decodedPath.includes('resource&support.html') || decodedPath.endsWith('/resource&support')) {
        translations = window.resourcesTranslations;
        console.log('Using resourcesTranslations for resource&support.html or /resource&support');
    } else {
        translations = window.generalTranslations || {}; // Fallback to an empty object if no general translations
        console.log('Using generalTranslations or empty object');
    }

    if (!translations || Object.keys(translations).length === 0) {
        console.error('No translations object found or it is empty for the current page.', translations);
        console.log('Available translation objects:', {
            generalTranslations: !!window.generalTranslations,
            resourcesTranslations: !!window.resourcesTranslations,
            eventsTranslations: !!window.eventsTranslations,
            newsTranslations: !!window.newsTranslations,
            partnerTranslations: !!window.partnerTranslations,
            donateTranslations: !!window.donateTranslations,
            reportTranslations: !!window.reportTranslations
        });
        return; // Exit if no translations object is found or it's empty
    }

    // Check if the specific language exists in the translations object
    if (!translations[lang]) {
        console.error(`Language '${lang}' not found in translations object. Available languages:`, Object.keys(translations));
        // Fallback to English if available, otherwise use the first available language
        const fallbackLang = translations.en ? 'en' : Object.keys(translations)[0];
        if (fallbackLang) {
            console.log(`Falling back to language: ${fallbackLang}`);
            lang = fallbackLang;
        } else {
            console.error('No fallback language available');
            return;
        }
    }

    console.log('Resolved translations object:', translations); // Log 6
    console.log('Translations for selected language:', translations ? translations[lang] : 'undefined'); // Log 7
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        // Use the appropriate translations object
        let text = translations[lang] && translations[lang][key];

        // If the element has data-html="true", innerHTML, otherwise textContent
        if (element.hasAttribute('data-html') && text) {
            element.innerHTML = text;
        } else if (text) {
            element.textContent = text;
        } else {
            // Fallback for missing translations: use English or key name
            if (translations.en[key]) {
                element.textContent = translations.en[key];
            } else {
                console.warn(`Missing translation for key: ${key} in language: ${lang}`);
                element.textContent = key; // Fallback to the key name itself
            }
        }
    });

    // Update the HTML lang attribute for accessibility and voice selection
    document.documentElement.lang = lang;

    // Update hero section navigation buttons
    const backButton = document.querySelector('.btns button:first-child');
    const nextButton = document.querySelector('.btns button:last-child');
    if (backButton && translations[lang].back_button) {
        backButton.textContent = translations[lang].back_button;
    }
    if (nextButton && translations[lang].next_button) {
        nextButton.textContent = translations[lang].next_button;
    }
    // Update quiz navigation buttons
    const prevQuizButton = document.getElementById('prev');
    const nextQuizButton = document.getElementById('next');
    if (prevQuizButton && translations[lang].prev_button) {
        prevQuizButton.textContent = translations[lang].prev_button;
    }
    if (nextQuizButton && translations[lang].next_button_quiz) {
        nextQuizButton.textContent = translations[lang].next_button_quiz;
    }
    // Update quiz submit buttons
    const submitBasicQuizButton = document.getElementById('submit-basic');
    const submitIntermediateQuizButton = document.getElementById('submit-intermediate');
    const retryQuizButton = document.getElementById('retry-quiz');
    const goToIntermediateButton = document.getElementById('go-intermediate');
    if (submitBasicQuizButton && translations[lang].submit_basic_quiz) {
        submitBasicQuizButton.textContent = translations[lang].submit_basic_quiz;
    }
    if (submitIntermediateQuizButton && translations[lang].submit_intermediate_quiz) {
        submitIntermediateQuizButton.textContent = translations[lang].submit_intermediate_quiz;
    }
    if (retryQuizButton && translations[lang].try_again_button) {
        retryQuizButton.textContent = translations[lang].try_again_button;
    }
    if (goToIntermediateButton && translations[lang].go_intermediate_quiz) {
        goToIntermediateButton.textContent = translations[lang].go_intermediate_quiz;
    }

    // Update the placeholder for the mailing list email input
    const mailingEmailInput = document.getElementById('mailingEmail');
    if (mailingEmailInput) {
        if (lang === 'en') {
            mailingEmailInput.placeholder = "Enter your email";
        } else if (lang === 'sw') {
            mailingEmailInput.placeholder = "Weka barua pepe yako";
        } else if (lang === 'fr') {
            mailingEmailInput.placeholder = "Entrez votre e-mail";
        } else if (lang === 'ar') {
            mailingEmailInput.placeholder = "أدخل بريدك الإلكتروني";
        }
    }

    // Update the placeholder for the contact form inputs
    const contactNameInput = document.querySelector('#contactForm input[name="name"]');
    const contactEmailInput = document.querySelector('#contactForm input[name="email"]');
    const contactMessageInput = document.querySelector('#contactForm textarea[name="message"]');

    if (contactNameInput) {
        if (lang === 'en') {
            contactNameInput.placeholder = "Your Name";
        } else if (lang === 'sw') {
            contactNameInput.placeholder = "Jina Lako";
        } else if (lang === 'fr') {
            contactNameInput.placeholder = "Votre Nom";
        } else if (lang === 'ar') {
            contactNameInput.placeholder = "اسمك";
        }
    }
    if (contactEmailInput) {
        if (lang === 'en') {
            contactEmailInput.placeholder = "Your Email";
        } else if (lang === 'sw') {
            contactEmailInput.placeholder = "Barua Pepe Yako";
        } else if (lang === 'fr') {
            contactEmailInput.placeholder = "Votre E-mail";
        } else if (lang === 'ar') {
            contactEmailInput.placeholder = "بريدك الإلكتروني";
        }
    }
    if (contactMessageInput) {
        if (lang === 'en') {
            contactMessageInput.placeholder = "Your Message";
        } else if (lang === 'sw') {
            contactMessageInput.placeholder = "Ujumbe Wako";
        } else if (lang === 'fr') {
            contactMessageInput.placeholder = "Votre Message";
        } else if (lang === 'ar') {
            contactMessageInput.placeholder = "رسالتك";
        }
    }

    // Update dynamic card navigation buttons
    const digitalSafetyBtn = document.querySelector('.card-nav-btn[data-card="digital-safety"]');
    const tfgbvProtectionBtn = document.querySelector('.card-nav-btn[data-card="tfgbv"]');
    const quickAccessBtn = document.querySelector('.card-nav-btn[data-card="quick-access"]');

    if (digitalSafetyBtn && translations[lang].digital_safety) {
        digitalSafetyBtn.textContent = translations[lang].digital_safety;
    }
    if (tfgbvProtectionBtn && translations[lang].tfgbv_protection) {
        tfgbvProtectionBtn.textContent = translations[lang].tfgbv_protection;
    }
    if (quickAccessBtn && translations[lang].quick_access) {
        quickAccessBtn.textContent = translations[lang].quick_access;
    }

    // Update dynamic card content titles and descriptions (front and back)
    document.querySelectorAll('.dynamic-card .card-item').forEach(cardItem => {
        const cardFront = cardItem.querySelector('.card-front');
        const cardBack = cardItem.querySelector('.card-back');

        // Extract data-translate keys from the front of the card
        const titleFrontKey = cardFront.querySelector('h4')?.getAttribute('data-translate');
        const descFrontKey = cardFront.querySelector('p')?.getAttribute('data-translate');

        // Extract data-translate keys from the back of the card (if any)
        const titleBackKey = cardBack?.querySelector('h4')?.getAttribute('data-translate');
        const descBackKey = cardBack?.querySelector('p')?.getAttribute('data-translate');

        // Update front of the card
        if (titleFrontKey && translations[lang][titleFrontKey]) {
            cardFront.querySelector('h4').textContent = translations[lang][titleFrontKey];
        }
        if (descFrontKey && translations[lang][descFrontKey]) {
            cardFront.querySelector('p').textContent = translations[lang][descFrontKey];
        }

        // Update back of the card (if it exists)
        if (cardBack) {
            if (titleBackKey && translations[lang][titleBackKey]) {
                cardBack.querySelector('h4').textContent = translations[lang][titleBackKey];
            }
            if (descBackKey && translations[lang][descBackKey]) {
                cardBack.querySelector('p').textContent = translations[lang][descBackKey];
            }
            // Update list items on the back of the card
            cardBack.querySelectorAll('li[data-translate-list]').forEach(li => {
                const liKey = li.getAttribute('data-translate-list');
                if (translations[lang][liKey]) {
                    li.textContent = translations[lang][liKey];
                }
            });
        }
    });

    // Update report form translations on `report.html`
    const reportPageTitle = document.querySelector('[data-translate="report_incident_modal_title"]');
    if (reportPageTitle && translations[lang].report_incident_modal_title) {
        reportPageTitle.textContent = translations[lang].report_incident_modal_title;
    }
    const reporterNameLabel = document.querySelector('[data-translate="your_name_label"]');
    if (reporterNameLabel && translations[lang].reporter_name_label) {
        reporterNameLabel.textContent = translations[lang].reporter_name_label;
    }
    const incidentDescriptionLabel = document.querySelector('[data-translate="incident_description_label"]');
    if (incidentDescriptionLabel && translations[lang].incident_description_label) {
        incidentDescriptionLabel.textContent = translations[lang].incident_description_label;
    }
    const reporterEmailLabel = document.querySelector('[data-translate="email_address_label"]');
    if (reporterEmailLabel && translations[lang].email_address_label) {
        reporterEmailLabel.textContent = translations[lang].email_address_label;
    }
    const contactPermissionLabel = document.querySelector('[data-translate="contact_permission_label"]');
    if (contactPermissionLabel && translations[lang].contact_permission_label) {
        contactPermissionLabel.textContent = translations[lang].contact_permission_label;
    }
    const submitReportButton = document.querySelector('[data-translate="submit_report_button"]');
    if (submitReportButton && translations[lang].submit_report_button) {
        submitReportButton.textContent = translations[lang].submit_report_button;
    }
    const floatingReportButton = document.querySelector('[data-translate="floating_report_button"]');
    if (floatingReportButton && translations[lang].floating_report_button) {
        floatingReportButton.textContent = translations[lang].floating_report_button;
    }

    // Update accessibility panel titles if they have data-translate attributes
    const ttsToggle = document.getElementById('ttsToggle');
    const contrastToggle = document.getElementById('contrastToggle');
    const resetAccessibilityBtn = document.querySelector('.accessibility-controls button:last-child');
    
    if (ttsToggle && translations[lang].tts_toggle) {
        ttsToggle.textContent = translations[lang].tts_toggle;
    }
    if (contrastToggle && translations[lang].contrast_toggle) {
        contrastToggle.textContent = translations[lang].contrast_toggle;
    }
    if (resetAccessibilityBtn && translations[lang].reset_accessibility) {
        resetAccessibilityBtn.textContent = translations[lang].reset_accessibility;
    }

    // Re-select TTS voice based on new language
    if (window.selectTTSVoice) {
        window.selectTTSVoice(lang);
    }
    // Re-read content if TTS is active
    if (window.isTTSActive && window.readPageContent) {
        window.speechSynthesis.cancel(); // Stop current speech
        window.readPageContent(); // Start reading in new language
    }

    // Handle RTL direction for Arabic
    if (lang === 'ar') {
        document.documentElement.style.direction = 'ltr'; // Keep HTML document LTR for layout
        document.documentElement.style.textAlign = 'right'; // Align text to the right for RTL
        
        // Explicitly override elements that must remain LTR
        document.querySelectorAll('[data-ltr-direction="true"]').forEach(el => {
            el.style.direction = 'ltr';
            el.style.textAlign = 'left';
        });
    } else {
        // Reset to LTR for other languages
        document.documentElement.style.direction = 'ltr'; // Reset HTML direction to LTR
        document.documentElement.style.textAlign = 'left'; // Reset text alignment to left
        
        // Ensure LTR override is not applied when not Arabic
        document.querySelectorAll('[data-ltr-direction="true"]').forEach(el => {
            el.style.direction = ''; // Remove inline style to default to CSS
            el.style.textAlign = ''; // Remove inline style to default to CSS
        });
    }
}


// Function to change the language
function changeLanguage(lang) {
    console.log('changeLanguage called with:', lang); // Log 1
    storeLanguage(lang); // Store the selected language
    updateContent(lang); // Update the content
    updateLanguageSelectorDisplay(lang);
}

// Alias function for setLanguage (for compatibility)
function setLanguage(lang) {
    changeLanguage(lang);
}

// Make setLanguage globally available
window.setLanguage = setLanguage;

// Initialize language selector buttons
function initializeLanguageSelector() {
    console.log('initializeLanguageSelector called.'); // Log 2
    document.querySelectorAll('.language-switcher .dropdown-content a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const lang = this.getAttribute('data-lang');
            console.log('Language link clicked, data-lang:', lang); // Log 3
            changeLanguage(lang);
        });
    });

    // Set initial language based on stored preference or default
    const initialLang = getStoredLanguage();
    updateContent(initialLang);
    // Use short code for initial display
    updateLanguageSelectorDisplay(initialLang);
}

// DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all translation objects are loaded
    setTimeout(() => {
        initializeLanguageSelector();
    }, 100);
});

// Update the function that sets the language switcher display
function updateLanguageSelectorDisplay(lang) {
  // For custom dropdown
  const selectedLanguageSpan = document.querySelector('.selected-language');
  const dropdownOptions = document.querySelectorAll('.dropdown-option');
  
  if (selectedLanguageSpan) {
    const languageShortCodes = {
      en: 'ENG',
      sw: 'KS',
      fr: 'FR',
      ar: 'AR'
    };
    
    selectedLanguageSpan.textContent = languageShortCodes[lang] || 'ENG';
    
    // Update selected state in dropdown options
    dropdownOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('selected');
      }
    });
  }
  
  // Fallback for old dropdown (if it exists)
  const switcher = document.querySelector('.language-switcher > a[aria-expanded]');
  if (switcher) {
    const languageShortCodes = {
      en: 'ENG',
      sw: 'KS',
      fr: 'FR',
      ar: 'AR'
    };
    switcher.innerHTML = languageShortCodes[lang] + ' <i class="fas fa-chevron-down"></i>';
  }
}

// Ensure this function is called after language change