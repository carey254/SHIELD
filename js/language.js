// Language translations
const languages = {
    'en': 'English',
    'ar': 'العربية',
    'sw': 'Kiswahili'
};

// Function to update content based on selected language
function updateContent(lang) {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update the main language display in the dropdown
    const mainLangDisplay = document.querySelector('.language-switcher > a[aria-expanded]');
    if (mainLangDisplay && languages[lang]) {
        mainLangDisplay.textContent = languages[lang] + ' ';
        const icon = document.createElement('i');
        icon.className = 'fas fa-chevron-down';
        mainLangDisplay.appendChild(icon);
    }
}

// Function to change language
function changeLanguage(lang) {
    // Store the selected language
    localStorage.setItem('selectedLanguage', lang);
    
    // Update all translatable elements and the main language display
    updateContent(lang);

    // Reorder language options in the dropdown
    const dropdownContent = document.querySelector('.language-switcher .dropdown-content');
    if (!dropdownContent) return;

    // Get all language links
    const langLinks = Array.from(dropdownContent.querySelectorAll('a[data-lang]'));

    // Sort them to put the selected language first
    langLinks.sort((a, b) => {
        if (a.getAttribute('data-lang') === lang) return -1;
        if (b.getAttribute('data-lang') === lang) return 1;
        return 0;
    });

    // Clear and re-append to reorder
    dropdownContent.innerHTML = '';
    langLinks.forEach(link => dropdownContent.appendChild(link));
}

// Initialize language switcher
function initializeLanguageSelector() {
    const languageSwitcher = document.querySelector('.language-switcher');
    if (!languageSwitcher) return;

    // Get stored language or default to English
    const storedLang = localStorage.getItem('selectedLanguage') || 'en';

    // Set initial language
    changeLanguage(storedLang);

    // Add click event listeners to language options
    languageSwitcher.querySelectorAll('.dropdown-content a[data-lang]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage(e.target.getAttribute('data-lang'));
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLanguageSelector); 