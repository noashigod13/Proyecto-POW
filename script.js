// Configuración inicial
const avatarUrls = [
    'https://i.ibb.co/0j2m2xXf/Dise-o-sin-t-tulo-10-Photoroom.png',
    'https://i.ibb.co/XfrHsjv0/Dise-o-sin-t-tulo-1-Photoroom.png',
    'https://i.ibb.co/nFsZTWJ/Dise-o-sin-t-tulo-6-Photoroom.png',
    'https://i.ibb.co/cKpYFBFC/Dise-o-sin-t-tulo-11-Photoroom.png',
    'https://i.ibb.co/PGsqZWJ2/Dise-o-sin-t-tulo-12-Photoroom.png',
    'https://i.ibb.co/MDq1Lv7w/Dise-o-sin-t-tulo-15-Photoroom.png', 
    'https://i.ibb.co/hxXRpTMp/Dise-o-sin-t-tulo-17-Photoroom-1.png',
    'https://i.ibb.co/j9SdCqtd/Dise-o-sin-t-tulo-18-Photoroom.png'
];

let selectedAvatar = 0;
const playerProfile = {
    name: '',
    avatar: ''
};

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar solo la pantalla de perfil al inicio
    document.getElementById('profile-setup').style.display = 'block';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-view').style.display = 'none';
    document.getElementById('rules-view').style.display = 'none';
    document.getElementById('powerUps-view').style.display = 'none';
    
    
    const savedProfile = localStorage.getItem('playerProfile');
    
    if (savedProfile) {
        showMainMenu(JSON.parse(savedProfile));
        

    } else {
        setupProfileCreation();
    }
});

// Configuración de la creación de perfil
function setupProfileCreation() {
    generateAvatars();
    setupAvatarSelection();
    setupNameInput();
    setupConfirmButton();
}

function generateAvatars() {
    const container = document.getElementById('avatars-container');
    container.innerHTML = '';
    
    avatarUrls.forEach((url, index) => {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = index === 0 ? 'avatar-option selected' : 'avatar-option';
        avatarDiv.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Avatar ${index + 1}`;
        
        avatarDiv.appendChild(img);
        container.appendChild(avatarDiv);
    });
    
    playerProfile.avatar = avatarUrls[0];
}

function setupAvatarSelection() {
    document.getElementById('avatars-container').addEventListener('click', function(e) {
        const avatarOption = e.target.closest('.avatar-option');
        if (!avatarOption) return;
        
        document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
        avatarOption.classList.add('selected');
        
        selectedAvatar = parseInt(avatarOption.dataset.index);
        playerProfile.avatar = avatarUrls[selectedAvatar];
        
        updateConfirmButton();
    });
}

function setupNameInput() {
    const nameInput = document.getElementById('playerName');
    const charCount = document.getElementById('charCount');
    
    nameInput.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/12`;
        
        // Cambiar color si se acerca al límite
        charCount.style.color = length >= 10 ? 'var(--color-yellow)' : 'var(--color-gray-500)';
        playerProfile.name = this.value.trim();
        
        updateConfirmButton();
    });
}

function setupConfirmButton() {
    const confirmBtn = document.getElementById('confirmBtn');
    
    confirmBtn.addEventListener('click', function() {
        if (!playerProfile.name) return;
        
        // Guardar perfil y mostrar menú principal
        localStorage.setItem('playerProfile', JSON.stringify(playerProfile));
        showMainMenu(playerProfile);
    });
    
    updateConfirmButton();
}

function updateConfirmButton() {
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.disabled = !playerProfile.name;
}

// Funciones de navegación entre vistas
function showMainMenu(profile) {
    // Ocultar todas las vistas
    hideAllViews();
    
    // Mostrar menú principal
    const mainMenu = document.getElementById('main-menu');
    document.getElementById('welcome-message').textContent = `¡Bienvenido, ${profile.name}!`;
    mainMenu.style.display = 'flex';
    mainMenu.classList.add('fade-in');
    
    // Configurar botones del menú
    setupMenuButtons();
}

function showGameView() {
    // Ocultar todas las vistas
    hideAllViews();
    
    // Mostrar vista de juego
    const gameView = document.getElementById('game-view');
    gameView.style.display = 'block';
    gameView.classList.add('fade-in');
}

function showRulesView() {
    // Ocultar todas las vistas
    hideAllViews();
    
    // Mostrar vista de reglas
    const rulesView = document.getElementById('rules-view');
    rulesView.style.display = 'block';
    rulesView.classList.add('fade-in');
    
    // Configurar navegación entre secciones de reglas
    setupRulesNavigation();
}

function showPowerUpsView() {
    // Ocultar todas las vistas
    hideAllViews();
    
    // Mostrar vista de Power Ups
    const powerUpsView = document.getElementById('powerUps-view');
    powerUpsView.style.display = 'block';
    powerUpsView.classList.add('fade-in');
}


function hideAllViews() {
    // Ocultar todas las vistas principales
    document.getElementById('profile-setup').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-view').style.display = 'none';
    document.getElementById('rules-view').style.display = 'none';
    document.getElementById('powerUps-view').style.display = 'none';
}

// Configuración de botones interactivos
function setupMenuButtons() {
    // Botón Jugar Ahora
    document.getElementById('playNowBtn').addEventListener('click', showGameView);
    
    // Botón Reglas
    document.getElementById('rulesBtn').addEventListener('click', showRulesView);

    document.getElementById('powerUpsBtn').addEventListener('click', showPowerUpsView);
    
    // Botón Volver (desde juego)
    document.getElementById('backToMenuBtn').addEventListener('click', function() {
        showMainMenu(playerProfile);
    });
    
    // Botón Volver (desde reglas)
     document.getElementById('backToRulesBtn').addEventListener('click', function() {
        showMainMenu(playerProfile);
    });

     // Botón Volver (desde Power Ups)
    document.getElementById('backToMenuFromPowerUps').addEventListener('click', function() {
        showMainMenu(playerProfile);
    });
}

function setupRulesNavigation() {
    const ruleButtons = document.querySelectorAll('.rules-button');
    
    ruleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.dataset.target;
            
            // Ocultar todas las secciones de reglas
            document.querySelectorAll('.rules-section').forEach(section => {
                section.classList.remove('visible');
            });
            
            // Mostrar la sección seleccionada
            document.getElementById(target).classList.add('visible');
            
            // Resaltar el botón activo
            ruleButtons.forEach(btn => {
                btn.style.color = 'white';
                btn.style.fontWeight = 'normal';
            });
            this.style.color = 'var(--color-secondary)';
            this.style.fontWeight = 'bold';
        });
    });
    
    // Resaltar el primer botón por defecto
    if (ruleButtons.length > 0) {
        ruleButtons[0].style.color = 'var(--color-secondary)';
        ruleButtons[0].style.fontWeight = 'bold';
    }
}
