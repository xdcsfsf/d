// WebSim Database Integration
const room = new WebsimSocket();

// Global State
let currentUser = null;
let isDarkMode = false;
let demoLinksCount = parseInt(localStorage.getItem('demoLinksCount') || '0');
let isUpgradeRequired = localStorage.getItem('upgradeRequired') === 'true';

// DOM Elements
const authSection = document.getElementById('auth-section');
const generatorSection = document.getElementById('generator');
const userDashboard = document.getElementById('user-dashboard');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const phoneNumber = document.getElementById('phone-number');
const messageText = document.getElementById('message-text');
const campaignName = document.getElementById('campaign-name');
const livePreview = document.getElementById('live-preview');
const generatedLinkSection = document.getElementById('generated-link-section');
const generatedLink = document.getElementById('generated-link');
const copyLinkBtn = document.getElementById('copy-link-btn');
const testLinkBtn = document.getElementById('test-link-btn');
const aiOptimizeBtn = document.getElementById('ai-optimize-btn');
const charCount = document.getElementById('char-count');

const demoLimitModal = document.getElementById('demo-limit-modal');
const closeDemoModal = document.getElementById('close-demo-modal');
const closeDemoModalBtn = document.getElementById('close-demo-modal-btn');
const upgradeBtn = document.getElementById('upgrade-btn');

// Enhanced country data with more countries
const countries = [
    { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+1', country: 'Canadá', flag: '🇨🇦' },
    { code: '+52', country: 'México', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+55', country: 'Brasil', flag: '🇧🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+51', country: 'Perú', flag: '🇵🇪' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
    { code: '+34', country: 'España', flag: '🇪🇸' },
    { code: '+33', country: 'Francia', flag: '🇫🇷' },
    { code: '+49', country: 'Alemania', flag: '🇩🇪' },
    { code: '+39', country: 'Italia', flag: '🇮🇹' },
    { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+31', country: 'Países Bajos', flag: '🇳🇱' },
    { code: '+32', country: 'Bélgica', flag: '🇧🇪' },
    { code: '+41', country: 'Suiza', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+45', country: 'Dinamarca', flag: '🇩🇰' },
    { code: '+46', country: 'Suecia', flag: '🇸🇪' },
    { code: '+47', country: 'Noruega', flag: '🇳🇴' },
    { code: '+358', country: 'Finlandia', flag: '🇫🇮' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japón', flag: '🇯🇵' },
    { code: '+82', country: 'Corea del Sur', flag: '🇰🇷' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'Nueva Zelanda', flag: '🇳🇿' },
    { code: '+90', country: 'Turquía', flag: '🇹🇷' },
    { code: '+7', country: 'Rusia', flag: '🇷🇺' },
    { code: '+48', country: 'Polonia', flag: '🇵🇱' },
    { code: '+420', country: 'República Checa', flag: '🇨🇿' },
    { code: '+36', country: 'Hungría', flag: '🇭🇺' },
    { code: '+40', country: 'Rumania', flag: '🇷🇴' },
    { code: '+30', country: 'Grecia', flag: '🇬🇷' },
    { code: '+385', country: 'Croacia', flag: '🇭🇷' },
    { code: '+27', country: 'Sudáfrica', flag: '🇿🇦' },
    { code: '+20', country: 'Egipto', flag: '🇪🇬' },
    { code: '+971', country: 'Emiratos Árabes Unidos', flag: '🇦🇪' },
    { code: '+966', country: 'Arabia Saudí', flag: '🇸🇦' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+65', country: 'Singapur', flag: '🇸🇬' },
    { code: '+60', country: 'Malasia', flag: '🇲🇾' },
    { code: '+66', country: 'Tailandia', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+63', country: 'Filipinas', flag: '🇵🇭' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' }
];

// Country selector variables
const countrySelectorBtn = document.getElementById('country-selector-btn');
const countryDropdown = document.getElementById('country-dropdown');
const countrySearchInput = document.getElementById('country-search-input');
const countryList = document.getElementById('country-list');
let selectedCountry = countries.find(c => c.code === '+54'); // Default to Argentina
let filteredCountries = [...countries];
let highlightedIndex = -1;

// Initialize Firebase Auth Observer
const initializeFirebaseAuth = () => {
    // Wait for Firebase to be fully loaded
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebase not ready, retrying...');
        setTimeout(initializeFirebaseAuth, 100);
        return;
    }

    try {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                showAuthenticatedUI();
                loadUserLinks();
            } else {
                currentUser = null;
                showUnauthenticatedUI();
            }
        });
    } catch (error) {
        console.error('Error initializing auth:', error);
        setTimeout(initializeFirebaseAuth, 1000);
    }
};

// Authentication Functions
const signInWithGoogle = async () => {
    if (!firebase || !firebase.auth) {
        console.error('Firebase not properly initialized');
        showNotification('Error de configuración. Intenta recargar la página.', 'error');
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        showNotification('¡Sesión iniciada correctamente!', 'success');
        return result.user;
    } catch (error) {
        console.error('Error signing in:', error);
        if (error.code === 'auth/popup-blocked') {
            showNotification('El popup fue bloqueado. Permite popups para este sitio.', 'error');
        } else if (error.code === 'auth/cancelled-popup-request') {
            showNotification('Operación cancelada', 'info');
        } else {
            showNotification('Error al iniciar sesión. Intenta de nuevo.', 'error');
        }
        throw error;
    }
};

const logout = async () => {
    if (!firebase || !firebase.auth) {
        showNotification('Firebase no está inicializado correctamente', 'error');
        return;
    }
    
    try {
        await firebase.auth().signOut();
        showNotification('Sesión cerrada correctamente', 'success');
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
};

// UI Functions
const showAuthenticatedUI = () => {
    authSection.innerHTML = `
        <button id="user-profile-btn" class="unique-profile-btn">
            <img src="${currentUser.photoURL}" alt="Profile" class="profile-avatar">
            <span class="profile-name hidden md:block">${currentUser.displayName}</span>
            <i class="fas fa-chevron-down profile-chevron"></i>
        </button>
    `;
    
    document.getElementById('user-profile-btn').addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    // Show generator and dashboard
    generatorSection.classList.remove('hidden');
    userDashboard.classList.remove('hidden');
    
    // Hide hero buttons and show generator info
    const heroButtons = document.querySelector('#main-content .flex.flex-col.sm\\:flex-row');
    if (heroButtons) {
        heroButtons.style.display = 'none';
    }
    
    // Add generator info below hero
    addGeneratorInfo();
};

const showUnauthenticatedUI = () => {
    // Always show login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.style.display = 'flex';
        loginBtn.addEventListener('click', signInWithGoogle);
    }
    
    // Hide generator and dashboard
    generatorSection.classList.add('hidden');
    userDashboard.classList.add('hidden');
    
    // Show hero buttons
    const heroButtons = document.querySelector('#main-content .flex.flex-col.sm\\:flex-row');
    if (heroButtons) {
        heroButtons.style.display = 'flex';
    }
    
    // Remove generator info
    removeGeneratorInfo();
};

const addGeneratorInfo = () => {
    const heroSection = document.querySelector('#main-content .text-white.slide-in');
    if (heroSection && !document.getElementById('generator-info')) {
        const generatorInfo = document.createElement('div');
        generatorInfo.id = 'generator-info';
        generatorInfo.className = 'mt-8 p-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl border border-white border-opacity-20';
        generatorInfo.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <i class="fas fa-magic text-white text-xl"></i>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-white">Generador Activo</h3>
                    <p class="text-white text-opacity-80">Crea enlaces personalizados con IA y analytics avanzados</p>
                </div>
            </div>
            <button onclick="scrollToGenerator()" class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                <i class="fas fa-arrow-down mr-2"></i>Ir al Generador
            </button>
        `;
        heroSection.appendChild(generatorInfo);
    }
};

const removeGeneratorInfo = () => {
    const generatorInfo = document.getElementById('generator-info');
    if (generatorInfo) {
        generatorInfo.remove();
    }
};

// Settings Functions
const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    showNotification(`Modo ${isDarkMode ? 'oscuro' : 'claro'} activado`, 'success');
};

const logoutUser = async () => {
    try {
        await logout();
        settingsModal.classList.add('hidden');
        showNotification('Sesión cerrada correctamente', 'success');
    } catch (error) {
        showNotification('Error al cerrar sesión', 'error');
    }
};

const loadSettings = () => {
    isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
};

// Demo Mode Functions
const checkDemoLimit = () => {
    if (!currentUser && demoLinksCount >= 5) {
        return true;
    }
    return false;
};

const showDemoLimitModal = () => {
    demoLimitModal.classList.remove('hidden');
};

const hideDemoLimitModal = () => {
    demoLimitModal.classList.add('hidden');
};

// Enhanced Generate Link Function with Demo Limit
const generateLinkFunction = async () => {
    // Check demo limit for non-authenticated users
    if (!currentUser) {
        if (checkDemoLimit()) {
            showDemoLimitModal();
            return;
        }
    }

    if (!validateForm()) {
        return;
    }

    const generateBtn = document.getElementById('generate-link-btn');
    
    // Add loading state
    generateBtn.classList.add('loading-state');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';

    try {
        const phone = selectedCountry.code + phoneNumber.value.replace(/\D/g, '');
        const message = messageText.value.trim();
        const campaign = campaignName.value.trim() || 'Sin nombre';

        const whatsappUrl = generateWhatsAppLink(phone, message);
        
        if (currentUser) {
            // Save to WebSim database for authenticated users
            await room.collection('whatsapp_links').create({
                phone: phone,
                message: message,
                campaign: campaign,
                whatsapp_url: whatsappUrl,
                clicks: 0,
                country: selectedCountry.country,
                country_code: selectedCountry.code,
                country_flag: selectedCountry.flag,
                user_email: currentUser.email,
                user_name: currentUser.displayName
            });
            
            loadUserLinks();
        } else {
            // Demo mode - increment counter
            demoLinksCount++;
            localStorage.setItem('demoLinksCount', demoLinksCount.toString());
            
            // Show remaining demo links
            showNotification(`Demo: ${5 - demoLinksCount} enlaces restantes`, 'info');
        }

        // Show generated link with enhanced animation
        generatedLink.value = whatsappUrl;
        generatedLinkSection.classList.remove('hidden');
        generatedLinkSection.style.animation = 'slideIn 0.5s ease-out';
        
        // Focus on the generated link for better accessibility
        setTimeout(() => {
            generatedLink.focus();
            generatedLink.select();
        }, 500);
        
        showNotification('¡Enlace generado exitosamente!', 'success');
        
    } catch (error) {
        console.error('Error generating link:', error);
        showNotification('Error al generar el enlace. Intenta nuevamente.', 'error');
    } finally {
        // Remove loading state
        generateBtn.classList.remove('loading-state');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-link mr-2"></i>Generar Enlace Premium';
    }
};

// Enhanced Focus Management
const initializeFocusManagement = () => {
    // Add focus rings to interactive elements
    const interactiveElements = document.querySelectorAll('button, input, textarea, select, [tabindex]');
    interactiveElements.forEach(element => {
        element.classList.add('focus-ring');
    });

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
        
        // Escape key handling
        if (e.key === 'Escape') {
            if (settingsModal && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
            }
            if (countryDropdown && countryDropdown.classList.contains('show')) {
                hideCountryDropdown();
            }
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
};

// Enhanced Form Validation with Visual Feedback
const validateForm = () => {
    const phone = phoneNumber.value.trim();
    const message = messageText.value.trim();
    let isValid = true;

    // Reset states
    phoneNumber.classList.remove('error-state', 'success-state');
    messageText.classList.remove('error-state', 'success-state');

    if (!phone) {
        phoneNumber.classList.add('error-state');
        showNotification('Por favor ingresa un número de teléfono', 'error');
        phoneNumber.focus();
        isValid = false;
    } else {
        phoneNumber.classList.add('success-state');
    }

    if (!message) {
        messageText.classList.add('error-state');
        showNotification('Por favor ingresa un mensaje', 'error');
        if (isValid) messageText.focus();
        isValid = false;
    } else {
        messageText.classList.add('success-state');
    }

    return isValid;
};

// Enhanced Copy Function with Better Feedback
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        
        // Enhanced visual feedback
        const copyBtn = event.target.closest('button');
        if (copyBtn) {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check text-green-500"></i>';
            copyBtn.classList.add('success-state');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('success-state');
            }, 2000);
        }
        
        showNotification('¡Enlace copiado al portapapeles!', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotification('Error al copiar enlace', 'error');
    }
};

// Enhanced Notification System
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Enhanced entrance animation
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Link Generation
const generateWhatsAppLink = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// Load User's Links
const loadUserLinks = async () => {
    if (!currentUser) return;

    try {
        const userLinks = room.collection('whatsapp_links')
            .filter({ user_email: currentUser.email })
            .getList();
        
        displayUserLinks(userLinks);
        
        // Subscribe to updates
        room.collection('whatsapp_links')
            .filter({ user_email: currentUser.email })
            .subscribe(displayUserLinks);
            
    } catch (error) {
        console.error('Error loading user links:', error);
    }
};

const displayUserLinks = (links) => {
    const userLinksContainer = document.getElementById('user-links');
    if (!userLinksContainer) return;

    if (links.length === 0) {
        userLinksContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-link text-4xl mb-4"></i>
                <p>Aún no has creado ningún enlace. ¡Comienza generando tu primer enlace arriba!</p>
            </div>
        `;
        return;
    }

    userLinksContainer.innerHTML = links.map(link => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${link.campaign}</h4>
                    <p class="text-sm text-gray-600 mt-1">${link.message}</p>
                    <div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span><i class="fas fa-phone mr-1"></i>${link.phone}</span>
                        <span><i class="fas fa-mouse-pointer mr-1"></i>${link.clicks || 0} clicks</span>
                        <span><i class="fas fa-calendar mr-1"></i>${new Date(link.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="copyToClipboard('${link.whatsapp_url}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="window.open('${link.whatsapp_url}', '_blank')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button onclick="deleteLink('${link.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

// Utility Functions
const deleteLink = async (linkId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este enlace?')) return;
    
    try {
        await room.collection('whatsapp_links').delete(linkId);
        showNotification('Enlace eliminado correctamente', 'success');
    } catch (error) {
        console.error('Error deleting link:', error);
        showNotification('Error al eliminar enlace', 'error');
    }
};

// Live Preview Update
const updateLivePreview = () => {
    const message = messageText.value.trim();
    
    if (message) {
        livePreview.textContent = message;
        livePreview.className = 'message-bubble';
    } else {
        livePreview.textContent = 'Escribe tu mensaje para ver la vista previa...';
        livePreview.className = '';
    }
    
    // Update character count
    if (charCount) {
        charCount.textContent = message.length;
    }
};

// AI Message Optimization (Mock)
const optimizeMessage = () => {
    const originalMessage = messageText.value.trim();
    if (!originalMessage) {
        alert('Escribe un mensaje primero para optimizarlo');
        return;
    }

    const optimizedMessages = [
        `¡Hola! 👋 Me interesa conocer más sobre tus servicios. ¿Podrías enviarme información?`,
        `¡Buenos días! 🌟 Vi tu producto y me gustaría recibir más detalles. ¡Gracias!`,
        `¡Hola! 😊 Estoy interesado/a en tu propuesta. ¿Podemos conversar?`,
        `¡Saludos! 🚀 Me llamó la atención tu oferta. ¿Podrías contarme más?`
    ];

    const randomOptimized = optimizedMessages[Math.floor(Math.random() * optimizedMessages.length)];
    messageText.value = randomOptimized;
    updateLivePreview();
    showNotification('¡Mensaje optimizado con IA!', 'success');
};

// Country selector functions
function populateCountryDropdown(countriesToShow = countries) {
    filteredCountries = countriesToShow;
    
    if (countriesToShow.length === 0) {
        countryList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <div>No se encontraron países</div>
                <small>Intenta con otro término de búsqueda</small>
            </div>
        `;
        return;
    }

    countryList.innerHTML = countriesToShow.map((country, index) => `
        <div class="country-option" data-index="${index}" data-code="${country.code}" data-flag="${country.flag}" data-country="${country.country}">
            <span class="country-flag">${country.flag}</span>
            <span class="flex-1">${country.country}</span>
            <span class="text-gray-500 text-sm">${country.code}</span>
        </div>
    `).join('');

    // Add click handlers
    countryList.querySelectorAll('.country-option').forEach((option, index) => {
        option.addEventListener('click', function() {
            const code = this.dataset.code;
            const flag = this.dataset.flag;
            const country = this.dataset.country;
            
            selectedCountry = { code, flag, country };
            updateCountrySelector();
            hideCountryDropdown();
        });

        option.addEventListener('mouseenter', function() {
            clearHighlight();
            this.classList.add('highlighted');
            highlightedIndex = index;
        });
    });
}

function updateCountrySelector() {
    countrySelectorBtn.innerHTML = `
        <span class="country-flag">${selectedCountry.flag}</span>
        <span class="ml-2">${selectedCountry.code}</span>
        <i class="fas fa-chevron-down ml-2 text-xs"></i>
    `;
}

function showCountryDropdown() {
    countryDropdown.classList.add('show');
    setTimeout(() => {
        countrySearchInput.focus();
    }, 100);
    populateCountryDropdown();
    highlightedIndex = -1;
}

function hideCountryDropdown() {
    countryDropdown.classList.remove('show');
    countrySearchInput.value = '';
    highlightedIndex = -1;
}

function clearHighlight() {
    countryList.querySelectorAll('.country-option').forEach(option => {
        option.classList.remove('highlighted');
    });
}

function highlightOption(index) {
    clearHighlight();
    const options = countryList.querySelectorAll('.country-option');
    if (options[index]) {
        options[index].classList.add('highlighted');
        options[index].scrollIntoView({ block: 'nearest' });
        highlightedIndex = index;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load settings first
    loadSettings();

    // Wait for Firebase to load before initializing auth
    if (typeof firebase !== 'undefined') {
        initializeFirebaseAuth();
    } else {
        // Firebase not loaded yet, wait for it
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkFirebase);
                initializeFirebaseAuth();
            }
        }, 100);
    }

    // Settings modal events
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    darkModeToggle.addEventListener('change', toggleDarkMode);

    // Logout button event
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Message input events
    if (messageText) {
        messageText.addEventListener('input', updateLivePreview);
    }
    
    // Button events
    const generateLinkBtn = document.getElementById('generate-link-btn');
    if (generateLinkBtn) {
        generateLinkBtn.addEventListener('click', generateLinkFunction);
    }
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => copyToClipboard(generatedLink.value));
    }
    if (testLinkBtn) {
        testLinkBtn.addEventListener('click', () => window.open(generatedLink.value, '_blank'));
    }
    if (aiOptimizeBtn) {
        aiOptimizeBtn.addEventListener('click', optimizeMessage);
    }

    // Phone number formatting
    if (phoneNumber) {
        phoneNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
            
            // Remove error state when user starts typing
            if (e.target.classList.contains('error-state')) {
                e.target.classList.remove('error-state');
            }
        });
    }

    if (messageText) {
        messageText.addEventListener('input', (e) => {
            updateLivePreview();
            
            // Remove error state when user starts typing
            if (e.target.classList.contains('error-state')) {
                e.target.classList.remove('error-state');
            }
        });
    }

    // Country selector events
    if (countrySearchInput) {
        countrySearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = countries.filter(country => 
                country.country.toLowerCase().includes(searchTerm) ||
                country.code.includes(searchTerm)
            );
            populateCountryDropdown(filtered);
            highlightedIndex = -1;
        });

        countrySearchInput.addEventListener('keydown', function(e) {
            const options = countryList.querySelectorAll('.country-option');
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (highlightedIndex < options.length - 1) {
                        highlightOption(highlightedIndex + 1);
                    } else {
                        highlightOption(0);
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (highlightedIndex > 0) {
                        highlightOption(highlightedIndex - 1);
                    } else {
                        highlightOption(options.length - 1);
                    }
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && options[highlightedIndex]) {
                        options[highlightedIndex].click();
                    }
                    break;
                    
                case 'Escape':
                    hideCountryDropdown();
                    break;
            }
        });
    }

    if (countrySelectorBtn) {
        countrySelectorBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (countryDropdown.classList.contains('show')) {
                hideCountryDropdown();
            } else {
                showCountryDropdown();
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (countryDropdown && countrySelectorBtn && 
            !countryDropdown.contains(e.target) && !countrySelectorBtn.contains(e.target)) {
            hideCountryDropdown();
        }
    });

    // Close settings modal when clicking outside
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Prevent dropdown from closing when clicking inside
    if (countryDropdown) {
        countryDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Initialize country selector
    populateCountryDropdown();
    updateCountrySelector();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Entrance animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // Demo modal events
    if (closeDemoModal) {
        closeDemoModal.addEventListener('click', hideDemoLimitModal);
    }
    if (closeDemoModalBtn) {
        closeDemoModalBtn.addEventListener('click', hideDemoLimitModal);
    }
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            showNotification('Redirigiendo a la página de pago...', 'info');
            // Here you would redirect to payment page
            hideDemoLimitModal();
        });
    }

    // Hero buttons functionality
    const startFreeBtn = document.getElementById('start-free-btn');
    const demoBtn = document.getElementById('demo-btn');
    
    if (startFreeBtn) {
        startFreeBtn.addEventListener('click', async () => {
            if (currentUser) {
                document.getElementById('generator').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                try {
                    await signInWithGoogle();
                } catch (error) {
                    console.error('Error signing in:', error);
                }
            }
        });
    }
    
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            // Show generator for demo mode
            generatorSection.classList.remove('hidden');
            document.getElementById('generator').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Show demo info
            setTimeout(() => {
                showNotification('Modo Demo: Puedes generar hasta 5 enlaces gratuitos', 'info');
            }, 1000);
        });
    }

    // Enhanced navbar scroll behavior
    let lastScrollTop = 0;
    let navbarVisible = true;

    const handleNavbarScroll = () => {
        const navbar = document.getElementById('navbar');
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100 && navbarVisible) {
            // Scrolling down - hide navbar
            navbar.classList.remove('navbar-slide-down');
            navbar.classList.add('navbar-slide-up');
            navbarVisible = false;
        } else if (scrollTop < lastScrollTop && !navbarVisible) {
            // Scrolling up - show navbar
            navbar.classList.remove('navbar-slide-up');
            navbar.classList.add('navbar-slide-down');
            navbarVisible = true;
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleNavbarScroll);

    // Initialize focus management
    initializeFocusManagement();
    
    // Enhance country dropdown
    function enhanceCountryDropdown() {
        if (countrySearchInput) {
            countrySearchInput.addEventListener('keydown', function(e) {
                const options = countryList.querySelectorAll('.country-option');
                
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (highlightedIndex < options.length - 1) {
                            highlightOption(highlightedIndex + 1);
                        } else {
                            highlightOption(0);
                        }
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        if (highlightedIndex > 0) {
                            highlightOption(highlightedIndex - 1);
                        } else {
                            highlightOption(options.length - 1);
                        }
                        break;
                        
                    case 'Enter':
                        e.preventDefault();
                        if (highlightedIndex >= 0 && options[highlightedIndex]) {
                            options[highlightedIndex].click();
                        }
                        break;
                        
                    case 'Escape':
                        e.preventDefault();
                        hideCountryDropdown();
                        countrySelectorBtn.focus();
                        break;
                        
                    case 'Tab':
                        hideCountryDropdown();
                        break;
                }
            });
        }
    }

    enhanceCountryDropdown();

    // Initialize with unauthenticated UI (this ensures login button shows)
    showUnauthenticatedUI();

    // Create floating particles
    const createFloatingParticles = () => {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) return;

        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positioning
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            
            // Click event for explosion
            particle.addEventListener('click', function() {
                this.classList.add('exploding');
                setTimeout(() => {
                    this.remove();
                    // Create a new particle to replace the exploded one
                    setTimeout(() => createSingleParticle(), 1000);
                }, 600);
            });
            
            particlesContainer.appendChild(particle);
        }
    };

    const createSingleParticle = () => {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) return;
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = '0s';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        particle.addEventListener('click', function() {
            this.classList.add('exploding');
            setTimeout(() => {
                this.remove();
                setTimeout(() => createSingleParticle(), 1000);
            }, 600);
        });
        
        particlesContainer.appendChild(particle);
    };

    // Initialize floating particles
    createFloatingParticles();
});

// Scroll to generator function
window.scrollToGenerator = () => {
    document.getElementById('generator').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};

// Global functions for inline event handlers
window.copyToClipboard = copyToClipboard;
window.deleteLink = deleteLink;