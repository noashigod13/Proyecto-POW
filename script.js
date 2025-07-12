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

// Variables para la ventana emergente
let gameVentanaEmergente;
let gameVentana;
let ventanaTitle;
let ventanaBody;
let isVentanaActive = false;

//Variables globales
let deck = [];
let discardPile = [];
const colors = ['red', 'green', 'blue', 'yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const specialCards = ['jump', 'reverse', 'draw2'];
const wildCards = ['wild', 'wildDraw4'];

//Variables de control del juego
let players = [];
let currentPlayerIndex = 0;
let direction = 1;

const restartButton = document.getElementById('restart');
let timeNextPlay = 1500;
let waitingForColorSelection = false;
let lastOffset = 1;
let isGamePaused = false;


/*//Carta (No lo usamos, pero lo dejamos por si acaso)
const card = {
    id: 'R-5',
    color: 'red',
    type: 'number',
    value: 5,
}*/

/*const player = {
    id: 'player1',
    name: 'Jugador 1',
    cards: [],
    points: 0,
    saidUNO: false,
    isHuman: true, 
}*/

//Botones
const drawBtn = document.getElementById('descarte');
const unoBtn = document.getElementById('uno');

//Variables para las flechas
let topDirectionIndicator;
let bottomDirectionIndicator;
//Funcion para las notificaciones
function getCardName(card) {
    const cardNames = {
        'draw2': '+2',
        'jump': 'Salto',
        'reverse': 'Reversa', 
        'wild': 'Comodín',
        'wildDraw4': '+4'
    };
    return cardNames[card.value] || `${card.color} ${card.value}`;
}
//FUncion para activar la caja de notificaciones
function addNotification(message, type = '') {
    const notificationsContent = document.getElementById('avisos-content');
    const notification = document.createElement('div');
    notification.className = `aviso ${type}`;
    notification.textContent = message;
    notificationsContent.prepend(notification);
    // Limitar el número de notificaciones visibles
    while (notificationsContent.children.length > 4) {
        notificationsContent.removeChild(notificationsContent.lastChild);
    }
}
// Arreglo con los efcetos de sonido
const soundEffects = {
   draw2Sound: new Audio('./assets/sounds/draw2-sound.mp3'),
   draw4Sound: new Audio('./assets/sounds/draw4-sound.mp3'),
   shuffle: new Audio('./assets/sounds/shuffling-cards-1.mp3'),
   skipSound: new Audio('./assets/sounds/skip-sound.mp3'),
   unoCall: new Audio('./assets/sounds/uno-sound-1.mp3'),
   wildSound: new Audio('./assets/sounds/wild-sound.mp3')
};
// Función para reproducir sonidos
function playSound(sound) {
   try {
       soundEffects[sound].currentTime = 0; // Reinicia el sonido si ya está reproduciéndose
       soundEffects[sound].play();
   } catch (e) {
       console.error("Error al reproducir sonido:", e);
   }
};
//Como este es un sonido de fondo que siempre está presente se colocó como una constante aparte
const gameMusic = new Audio('./assets/sounds/game-bg-music.mp3');
gameMusic.loop = true;
gameMusic.volume = 0.5;
let isMusicEnabled = true;
//La música inicia automático
function startBackgroundMusic() {
   const playPromise = gameMusic.play();
   if (playPromise !== undefined) {
       playPromise.catch(error => {
           console.log("Reproducción automática prevenida:", error);
       });
   }
}
// Control de música, si está encendida o pagada
const musicToggle = document.getElementById('musicToggle');
function musicSound(){
   startBackgroundMusic();
   if (musicToggle) {
       musicToggle.addEventListener('click', function() {
           isMusicEnabled = !isMusicEnabled;
          
           if (isMusicEnabled) {
               gameMusic.volume = 0.5;
               startBackgroundMusic();
               this.classList.remove('muted');
           } else {
               gameMusic.pause();
               this.classList.add('muted');
           }
       });
   }
}
const playAgainCallback = () => { // Usamos 'let' para poder reasignarla si es necesario, aunque aquí no lo sería
    hideGameVentana();
    isGamePaused = false;
    currentPlayerIndex = 0;
    direction = 1;
    deck = [];
    discardPile = [];
    initializeDeck();
    dealCards();
    players.forEach(p => {
        p.cards = []; // Limpiar las cartas de cada jugador
        p.saidUNO = false; // Resetear el estado UNO
        // NOTA: Los puntos (player.points) se mantienen acumulados,
        // si quieres resetear los puntos para un juego completamente nuevo,
        // añade 'p.points = 0;' aquí también.
    });
    startGame();
};
function fullResetCallback() {
    // Reinicia completamente los puntos
    players.forEach(p => {
        p.points = 0;
    });
    playAgainCallback();
}
//estado inicial del juego
const game = {
    players,
    deck,
    discardPile,
    //turn: currentPlayerIndex, no la usamos
    direction,
    currentColor: null,
    waitingForColor: false,
    roundWinner: null
};

document.addEventListener('DOMContentLoaded', function() {
    const welcomePage = document.getElementById('profile-setup');
    const gamePage = document.getElementById('game-grid-container');
    if (welcomePage) {
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
    } else if (gamePage) {
        setupGamePage();
        startGame(4);
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
        localStorage.setItem('selectedAvatar', playerProfile.avatar)
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
    document.getElementById('playNowBtn').addEventListener('click', function() {
        window.location.href = 'game.html';
    });
    
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

// Funciones del juego
function setupGamePage() {
    const jmainInfo = document.getElementById('jmain-info');
    const outBtn = document.getElementById('out');

    
    //Obtemos los ID para las flechas
    topDirectionIndicator = document.getElementById('indicador-direccion-top');
    bottomDirectionIndicator = document.getElementById('indicador-direccion-bottom');

    const savedProfile = localStorage.getItem('playerProfile');
    if (savedProfile) {
        profile = JSON.parse(savedProfile);
    }

    jmainInfo.innerHTML = `
        <div id="avatar" style="background-image: url('${profile.avatar}');"></div>
        <div id="name">${profile.name}</div>
        <div class="status-box" id="status-main"></div>
    `;
    
    outBtn.addEventListener('click', () => window.location.href = 'bienvenida.html');
    //ENcuentra todo los que tiene que ver con la ventana emergente
    gameVentanaEmergente = document.getElementById('game-ventana-emergente');
    gameVentana = document.getElementById('game-ventana');
    ventanaTitle = document.getElementById('ventana-title');
    ventanaBody = document.getElementById('ventana-body');
}
//FUncion para mostrara la ventana emergente
function displayGameVentana(title, bodyHtml, continueText = '', restartText = '', continueCallback = null, restartCallback = null) {
    ventanaTitle.textContent = title;
    ventanaBody.innerHTML = bodyHtml;
    
    // Limpiar cualquier botón existente primero
    const existingButtonContainer = ventanaBody.querySelector('.ventana-button-container');
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Crear contenedor de botones solo si se proporcionan
    if (continueText || restartText) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ventana-button-container';
        
        if (continueText && continueCallback) {
            const continueButton = document.createElement('button');
            continueButton.className = 'ventana-button continue';
            continueButton.textContent = continueText;
            continueButton.onclick = continueCallback;
            buttonContainer.appendChild(continueButton);
        }

        if (restartText && restartCallback) {
            const restartButton = document.createElement('button');
            restartButton.className = 'ventana-button restart';
            restartButton.textContent = restartText;
            restartButton.onclick = restartCallback;
            buttonContainer.appendChild(restartButton);
        }

        ventanaBody.appendChild(buttonContainer);
    }

    gameVentanaEmergente.classList.add('visible');
    isGamePaused = true;
}
//FUncion paa esconder la ventana emergente
function hideGameVentana() {
    gameVentanaEmergente.classList.remove('visible');
    ventanaTitle.textContent = '';
    ventanaBody.innerHTML = '';
    isGamePaused = false;
}
//Muestra el contenido de la ventana emergente par el color
function showColorSelectionVentana() {
    const colorOptionsHtml = `
        <div class="color-options">
            <div class="color-option red" data-color="red"></div>
            <div class="color-option blue" data-color="blue"></div>
            <div class="color-option green" data-color="green"></div>
            <div class="color-option yellow" data-color="yellow"></div>
        </div>
    `;
    displayGameVentana("Selecciona un nuevo color:", colorOptionsHtml);
    document.querySelectorAll('#ventana-body .color-option').forEach(option => {
        option.addEventListener('click', selectNewColor);
    });
}
//FUncion para selecionar el color en la ventana emergente
function selectNewColor(event) {
    const selectedColor = event.target.dataset.color;
    if (selectedColor) {
        game.currentColor = selectedColor;
        updateCurrentColorDisplay();
        hideGameVentana();
        addNotification(`${players[currentPlayerIndex].name} cambia el color a ${game.currentColor}`, 'color-changed');
        if (waitingForColorSelection) {
            waitingForColorSelection = false;
            setTimeout(() => nextTurn(lastOffset), timeNextPlay);
        }
    }
}
//Funcion para inicializar/actualizar el color e inicializar/actualizar la direccion de las flechas
function updateCurrentColorDisplay() {
    const color = game.currentColor === 'wild' ? 'grey' : game.currentColor;
    const topArrow = topDirectionIndicator.querySelector('.forma-flecha');
    const bottomArrow = bottomDirectionIndicator.querySelector('.forma-flecha');
    //Actualiza color de las flechas
    topArrow.style.borderLeftColor = color;
    bottomArrow.style.borderLeftColor = color;
    //Actuliza dirreccion
    if (direction === 1) {//sintido horario
        topDirectionIndicator.classList.add('reverse');
        bottomDirectionIndicator.classList.remove('reverse');
    } else {//sentido antihorario
        topDirectionIndicator.classList.remove('reverse');
        bottomDirectionIndicator.classList.add('reverse');
    }
}
//Funcion para obtener el index de todos los jugadores, se agregó porque en un principio solo obtenia el del humano
function getPlayerInfoElementId(playerIndex) {
    if (players[playerIndex].isHuman) {
        return 'jmain-info';
    } else {
        switch (playerIndex) {
            case 1:
                return 'jright-info';
            case 2:
                return 'jtop-info';
            case 3:
                return 'jleft-info';
            default:
                return null;
        }
    }
}
//Se obtine el status del jugador
function getPlayerStatusElementId(playerIndex) {
    if (players[playerIndex].isHuman) {
        return 'status-main';
    } else {
        switch (playerIndex) {
            case 1:
                return 'status-right';
            case 2:
                return 'status-top';
            case 3:
                return 'status-left';
            default:
                return null;
        }
    }
}

function startGame(numPlayers) {
    //Esta función hace que inicie al música y también la apaga clikeando el boton
    musicSound();
    //En caso de reiniciar la pertida quita el color de los bordes del jugador anterior
    if (players[currentPlayerIndex]) {
        const prevPlayerInfoElementId = getPlayerInfoElementId(currentPlayerIndex);
        const prevPlayerInfoElement = document.getElementById(prevPlayerInfoElementId);
        if (prevPlayerInfoElement) {
            prevPlayerInfoElement.classList.remove('current-player-highlight');
        }
    }
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            id: `player-${i + 1}`,
            name: `Jugador ${i + 1}`,
            cards: [],
            points: 0,
            saidUNO: false,
            isHuman: i === 0 //Solo es verdadero para el primer jugador
        });
    }
    initializeDeck();
    dealCards(numPlayers);

    //Ignorar. Es para verificar que las cartas se reparten correctamente
    players.forEach(p => {
        //console.log(`${p.name} tiene:`, p.cards);
        console.log(`${p.name} tiene:`, p.cards.map(c => `${c.color}-${c.value}-${c.id}`));
    });

    // Activar el resaltado para el primer jugador al inicio del juego
    const initialPlayerInfoElementId = getPlayerInfoElementId(currentPlayerIndex);
    const initialPlayerInfoElement = document.getElementById(initialPlayerInfoElementId);
    if (initialPlayerInfoElement) {
        initialPlayerInfoElement.classList.add('current-player-highlight');
    }

    //activar click del mazo
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            if (currentPlayerIndex === 0) {
                drawCard(0);
            } else {
                console.log("No es tu turno.");
            }
        });    
    }
    //activar click del boton de uno
    if (unoBtn) {
        unoBtn.addEventListener('click', unoButtonClick);
        //se pasa unoButtonClick sin parentesis para que no se ejecute inmediatamente
    } 
    updateScoreDisplay();
    //Se limpian las notificaciones al iniciar la partida
    document.getElementById('avisos-content').innerHTML = ''; 
}

function initializeDeck() {
    /*Uno utiliza un mazo de 108 cartas. Cada color consta de 25 cartas, numeradas del
     0 al 9, incluyendo dos cartas de cada número. Además, hay ocho cartas cambiar 
     dirección (dos de cada color), ocho cartas salto (dos de cada color) y 
     ocho cartas toma dos (dos de cada color).hay cuatro cartas cambio de color y 
     cuatro cartas cambio de color y toma cuatro.*/

    // Cartas comunes (2 de cada una excepto el 0)
    colors.forEach(color => {
        values.forEach(value => {
            deck.push({ color, value, id: `${color}-${value}-1` });
            if (value !== '0') {
                deck.push({ color, value, id: `${color}-${value}-2` });
            }
        });

        // Cartas especiales por color: 2 de cada una
        specialCards.forEach(special => {
            deck.push({ color, value: special, id: `${color}-${special}-1` });
            deck.push({ color, value: special, id: `${color}-${special}-2` });
        });
    });
    //Comodines. 4 de cada uno
    wildCards.forEach(special => {
        for (let i = 1; i <=4; i++) {
            deck.push({color: 'wild',value: special, id: `wild-${special}-${i}`}); 
        }
    });

    //Algoritmo de mezcla (Fisher-Yates), lo busque por internet jeje
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    //Ignorar. Es para verificar que las cartas se mezclan correctamente
    console.log(deck);
}

function dealCards() {
    // Repartimos 7 cartas a cada jugador
    players.forEach(player => {
        player.cards = [];
        for (let i = 0; i < 7; i++) {
            //El mazo de cartas funciona como una pila literalmente, con pop y push
            const card = deck.pop();
            if (card) {
                player.cards.push(card);
            }
        }
    });

    // Primera carta al descarte
    let firstCard = deck.pop();
    
    //Montamos la pila de descarte
    discardPile.push(firstCard);

    //Definimos el color actual del juego
    game.currentColor = firstCard.color; 

    //Entregar cartas a los jugadores y colocar la primera carta en el descarte
    renderDiscardPile(firstCard);
    renderCardsHuman();
    for (i = 1; i < players.length; i++) {
        renderCardsCpu(i);
    }
    //Se inicializa el color y direccion 
    updateCurrentColorDisplay();  
}

function renderDiscardPile(firstCard){
     //Colocar imagen de la primera carta en el descarte
    const pila = document.getElementById('pila');
    pila.innerHTML = ''; 

    const pilaCard = document.createElement('div');
    pilaCard.classList.add('carta-img');
    pilaCard.innerHTML = 
    `<img src="./assets/cartas/${firstCard.color}-${firstCard.value}.jpeg" alt="${firstCard.color}-${firstCard.value}" class="card-img">`;
    pila.appendChild(pilaCard);
}

function renderCardsHuman(){
    //Repartir visualmente las cartas de cada jugador
    const container = document.getElementById('player-cards');
    container.innerHTML = ''; 

    //cartas ordenadas por color
    sortCardByColor(players[0].cards);

    players[0].cards.forEach(card => {
        const playerCard = document.createElement('div');
        playerCard.classList.add('carta-img');
        playerCard.innerHTML = 
        `<img src="./assets/cartas/${card.color}-${card.value}.jpeg" alt="${card.color}-${card.value}" id="${card.id}" class="card-img">`;
        container.appendChild(playerCard);
    });
    activeClickCard(); 
}

function renderCardsCpu(playerIndex) {   
    if (playerIndex === 1) {
        const container = document.getElementById('jright');
        container.innerHTML = ''; 
        players[playerIndex].cards.forEach(card => {
            const  cpuCard= document.createElement('div');
            cpuCard.classList.add('carta');
            container.appendChild(cpuCard);
        });
    } else if (playerIndex === 2) {
        const container = document.getElementById('jtop');
        container.innerHTML = ''; 
        players[playerIndex].cards.forEach(card => {
            const  cpuCard= document.createElement('div');
            cpuCard.classList.add('carta');
            container.appendChild(cpuCard);
        });
    }else if (playerIndex === 3) {
        const container = document.getElementById('jleft');
        container.innerHTML = ''; 
        players[playerIndex].cards.forEach(card => {
            const  cpuCard= document.createElement('div');
            cpuCard.classList.add('carta');
            container.appendChild(cpuCard);
        });
    }
}

function sortCardByColor(){
    //cartas ordenadas por color
    const order = ['wild', 'red', 'yellow', 'green', 'blue'];
    const valueOrder = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'draw2', 'jump', 'reverse', 'wild', 'wildDraw4'];
    players[0].cards.sort((a, b) => {  
        const sort = order.indexOf(a.color) - order.indexOf(b.color);
        if (sort !== 0) return sort;
        return valueOrder.indexOf(a.value) - valueOrder.indexOf(b.value);
    });
    //players[0].cards.sort((a, b) => order.indexOf(a.color) - order.indexOf(b.color));
}

function activeClickCard(){
    console.log("Activando listeners de cartas..."); // Para depuración
    //Comprueba que en la mano del jugador principal se muestre la carta a la que se le hace click
    const cartas = document.querySelectorAll('.card-img');
    console.log(`Encontradas ${cartas.length} cartas`); // Para depuración
    cartas.forEach(img => {
        img.addEventListener('click', () => {
            console.log("Carta clickeada:", img.id); // Para depuración
            const id = img.id;
            const carta = players[0].cards.find(c => c.id === id);
            if (carta && currentPlayerIndex === 0) {
                playCard(0, carta);
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const restartButton = document.getElementById('restart');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            displayConfirmationVentana();
        });
    }
});
function displayConfirmationVentana() {
    const title = "¿Reiniciar partida?";
    const bodyHtml = `
        <p>¿Estás seguro que quieres reiniciar la partida?</p>
        <p>Todos los progresos y puntuaciones se perderán.</p>
    `;
    
    displayGameVentana(
        title,
        bodyHtml,
        "Continuar", // Texto botón continuar
        "Reiniciar", // Texto botón reiniciar
        () => { // Callback para Continuar
            hideGameVentana();
            // Si el juego había terminado, pasar a siguiente ronda
            if (players.some(p => p.cards.length === 0)) {
                playAgainCallback();
            }
        },
        () => { // Callback para Reiniciar
            fullResetCallback();
        }
    );
}
function playCard(playerIndex, card) {
    const jugador = players[playerIndex];
    const tope = discardPile[discardPile.length - 1];
    addNotification(`${players[playerIndex].name} juega ${getCardName(card)}`, 'card-played');
    const esValida = (card.color === tope.color || 
        card.value === tope.value  || 
        card.color === 'wild' ||
        (tope.color === 'wild' && card.color === game.currentColor)
    );
    if (!esValida) {
        console.log("Carta inválida.");
        return;
    }

    //Elimina la carta de la mano del jugador y la agrega al descarte
    jugador.cards = jugador.cards.filter(c => c.id !== card.id);
    discardPile.push(card);
    
    renderDiscardPile(card);
    if (playerIndex === 0) {
        renderCardsHuman();
    } else {
        renderCardsCpu(playerIndex);
    }

    //Por default el CPU siempre dice uno
    if (!players[currentPlayerIndex].isHuman && players[currentPlayerIndex].cards.length === 1) {
        players[currentPlayerIndex].saidUNO = true;
        //Indica que el CPU tiene UNO
        showPlayerStatus(currentPlayerIndex, 'UNO');
    }
    let offset = 1;
    if (card.color !== 'wild') {
        game.currentColor = card.color;
    } else if(currentPlayerIndex === 0) {
        waitingForColorSelection = true;
        lastOffset = offset;
        showColorSelectionVentana();
        updateCurrentColorDisplay();
        colorChange=true; //para enviar el mensaje en el momento correcto
    }
    switch (card.value) {
    case 'draw2':
        showPlayerStatus(getNextPlayerIndex(1), '+2');
        drawCard2(getNextPlayerIndex(1), 2);
        addNotification(`${players[getNextPlayerIndex(1)].name} roba 2 cartas y pierde el turno!`, 'cards-drawn');
        offset = 2;
    break;
    case 'jump':
        showPlayerStatus(getNextPlayerIndex(1), '🚫');
        addNotification(`${players[getNextPlayerIndex(1)].name} pierde turno!`, 'turn-skipped');
        offset = 2;
    break;
    case 'reverse':
        direction *= -1;
        offset = 1;
    break;
    case 'wildDraw4':
        showPlayerStatus(getNextPlayerIndex(1), '+4');
        drawCard2(getNextPlayerIndex(1), 4);
        offset= 2;
        if (currentPlayerIndex === 0) {
            waitingForColorSelection = true;
            lastOffset = offset;
            showColorSelectionVentana();
            updateCurrentColorDisplay();
            colorChange=true; //para enviar el mensaje en el momento correcto
            addNotification(`${players[getNextPlayerIndex(1)].name} roba 4 cartas y pierde el turno!`, 'cards-drawn');
            return;
        }
    break;
}
    console.log("El " + jugador.name + " juega la carta: " + card.color + "-" + card.value );
    /* Se movió hacia arriba
    renderDiscardPile(card);*/
    //Se actuliza el color y direccion de las flechas en caso de necesitarlo
    updateCurrentColorDisplay();
    checkUNO(playerIndex);
    /*if (playerIndex === 0) { Se movió a arriba
        renderCardsHuman();
    } else {
        renderCardsCpu(playerIndex);
    }*/
    //setTimeout(() => nextTurn(offset), 800); Se cambia esta línea por el if debajo
    if (!isGamePaused) {
        setTimeout(() => nextTurn(offset), timeNextPlay);
    }
}

function getNextPlayerIndex(offset) {
    const total = players.length;
    return (currentPlayerIndex + direction * offset + total) % total;
}

function unoButtonClick() {
    const jugador= players[currentPlayerIndex];
    if (jugador.cards.length === 2) {
        jugador.saidUNO = true;
        unoBtn.classList.remove('disabled');
        console.log(`${jugador.name} gritó ¡UNO!`);
        showPlayerStatus(currentPlayerIndex, 'UNO');
        addNotification(`¡${jugador.name} gritó UNO!`, 'uno-called');
    } else {
        console.log(`${jugador.name} no puede gritar UNO ahora`);
    }
}

function drawCard(playerIndex){
    //se verifica que el jugador pueda robar una carta, solo se usa para el humano
    //porque el CPU siempre roba una carta si no tiene jugables
    let tope = discardPile[discardPile.length - 1];
    if (currentPlayerIndex === 0) {
        const cartaJugable = players[currentPlayerIndex].cards.find(card =>
            card.color === tope.color || 
            card.value === tope.value  || 
            card.color === 'wild' ||
            (tope.color === 'wild' && card.color === game.currentColor)
        );
        if (cartaJugable) {
            console.log("No puedes robar una carta, tienes cartas jugables.");
            return;
        }
    }

    let carta = deck.pop();
    if (carta) {
        console.log(`${players[playerIndex].name} roba una carta: ${carta.color}-${carta.value}`);
        addNotification(`${players[playerIndex].name} roba una carta`, 'cards-drawn');
        players[playerIndex].cards.push(carta);
        showPlayerStatus(currentPlayerIndex, '+1');
    }else {
        reshufleDeck();
        carta = deck.pop();
        console.log(`${players[playerIndex].name} roba una carta: ${carta.color}-${carta.value}`);
        addNotification(`${players[playerIndex].name} roba una carta`, 'cards-drawn');
        players[playerIndex].cards.push(carta);
        showPlayerStatus(currentPlayerIndex, '+1');
    }
    
    //Ignorar. Es para verificar que las cartas se reparten correctamente
    players.forEach(p => {
        console.log(`${p.name} tiene:`, p.cards.map(c => `${c.color}-${c.value}-${c.id}`));
    });

    /*Ya no se utiliza
    if (playerIndex === 0) {
        renderCardsHuman();
        setTimeout(() => nextTurn(1), 800);
    } else {
        renderCardsCpu(playerIndex);
        setTimeout(() => nextTurn(1), 800);
    }
    */
    if (playerIndex === 0) {
        renderCardsHuman();
        if (!isGamePaused) { // Añade esta condición
            setTimeout(() => nextTurn(1), timeNextPlay);
        }
    } else {
        renderCardsCpu(playerIndex);
        if (!isGamePaused) { // Añade esta condición
            setTimeout(() => nextTurn(1), timeNextPlay);
        }
    }
}


function drawCard2(playerIndex,cant){
    let cont=0;
    while (cont < cant) {
        let carta = deck.pop();
        if (carta) {
            players[playerIndex].cards.push(carta);
            cont++;
        } else reshufleDeck();
    }
    console.log(`${players[playerIndex].name} roba ${cant} cartas.`);

    //Ignorar. Es para verificar que las cartas se reparten correctamente
    players.forEach(p => {
        //console.log(`${p.name} tiene:`, p.cards);
        console.log(`${p.name} tiene:`, p.cards.map(c => `${c.color}-${c.value}-${c.id}`));
    });
    
    if (playerIndex === 0) renderCardsHuman();
    else renderCardsCpu(playerIndex);
}


function nextTurn(offset) {
    // Si el juego está pausado o esperando selección de color, no hacer nada
    if (isGamePaused || waitingForColorSelection) { 
        return; 
    }
    // Eliminar el color en los bordes del jugador anterior
    if (players[currentPlayerIndex]) {
        const prevPlayerInfoElementId = getPlayerInfoElementId(currentPlayerIndex);
        const prevPlayerInfoElement = document.getElementById(prevPlayerInfoElementId);
        if (prevPlayerInfoElement) {
            prevPlayerInfoElement.classList.remove('current-player-highlight');
        }
    }
    const total = players.length;
    currentPlayerIndex = (currentPlayerIndex + direction * offset + total) % total;
    
    //Mostrar en consola de quien es el turno
    console.log(`Turno de: ${players[currentPlayerIndex].name}`);
    
    // Agregar el color en los bordes al jugador actual
    const currentPlayerInfoElementId = getPlayerInfoElementId(currentPlayerIndex);
    const currentPlayerInfoElement = document.getElementById(currentPlayerInfoElementId);
    if (currentPlayerInfoElement) {
        currentPlayerInfoElement.classList.add('current-player-highlight');
    }

    if (!players[currentPlayerIndex].isHuman) {
        setTimeout(cpuPlay, timeNextPlay);
        unoBtn.classList.remove('disabled');
    } else {
        if (players[currentPlayerIndex].cards.length === 2) {
            unoBtn.classList.add('disabled');
        }
    }
}

function reshufleDeck() {
    console.log("No hay cartas en el mazo para robar, vamos a barajear.");
    const tope = discardPile.pop(); 
    deck.push(...discardPile);   
    discardPile = [];      
    discardPile.push(tope);           

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}


function cpuPlay() {
    // Si el juego está pausado o esperando selección de color, no hacer nada
    if (isGamePaused || waitingForColorSelection) { 
        return; 
    }
    const tope = discardPile[discardPile.length - 1];
    const cartaJugable = players[currentPlayerIndex].cards.find(card =>
        card.color === tope.color || 
        card.value === tope.value  || 
        card.color === 'wild' ||
        (tope.color === 'wild' && card.color === game.currentColor)
    );

    if (cartaJugable) {
        playCard(currentPlayerIndex, cartaJugable);
        if (cartaJugable.value === 'wild' || cartaJugable.value === 'wildDraw4') {
            game.currentColor = getRandomColor();
            console.log(`CPU elige color: ${game.currentColor}`);
            addNotification(`${players[currentPlayerIndex].name} cambia el color a ${game.currentColor}`, 'color-changed');
        }

    } else {
        console.log(`${players[currentPlayerIndex].name} no tiene cartas jugables, roba una carta.`);
        showPlayerStatus(currentPlayerIndex, '+1');
        drawCard(currentPlayerIndex);
    }
}

function getRandomColor() {
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
}

function checkUNO(playerIndex){
    const jugador = players[playerIndex];
    // si quedó en 1 carta y NO gritó UNO:
    if (jugador.cards.length === 1 && !jugador.saidUNO) {
        console.log(`${jugador.name} olvidó gritar UNO y roba 2 cartas`);
        showPlayerStatus(currentPlayerIndex, '+2');
        drawCard2(playerIndex,2);
        addNotification(`${players[getNextPlayerIndex(1)].name} olvidó gritar UNO y roba 2 cartas`, 'cards-drawn');
        if (jugador.isHuman) renderCardsHuman();
        else renderCardsCpu(playerIndex);
    
    } else {
        unoBtn.classList.remove('disabled');
        jugador.saidUNO = false; 
    }
    // si se quedó sin cartas, se termina la ronda 
    if (jugador.cards.length === 0) resetRound();
}  

//Esta funcion activa y desactiva las cajas de status los jugadores
function showPlayerStatus(playerIndex, message) {
    const statusElementId = getPlayerStatusElementId(playerIndex);
    const statusElement = document.getElementById(statusElementId);
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.classList.add('active');
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.classList.remove('active');
        }, timeNextPlay);
    }
}

function countPoints (winnerIndex) {
    players.forEach((player, index) => {
        if (index !== winnerIndex) {
            player.cards.forEach(card => {
                if (card.value === 'wild' || card.value === 'wildDraw4') {
                    players[winnerIndex].points += 50;
                } else if (card.value === 'draw2' || card.value === 'jump' || card.value === 'reverse') {
                    players[winnerIndex].points += 20;
                } else {
                    players[winnerIndex].points += parseInt(card.value);
                }
            });   
        }
    });
    updateScoreDisplay();       
}

function resetRound() {
    const winnerIndex = players.findIndex(p => p.cards.length === 0);
    countPoints(winnerIndex);
    //game.roundWinner = players[winnerIndex];
    //aqui deberia de salir una ventana Ventana con la cantidad de puntos por jugador y la opción de querer seguir jugando o no
    //console.log(`${players[winnerIndex].name} ganó la ronda y suma ${players[winnerIndex].points} puntos`);
    let resultsHtml = `
        <p>${players[winnerIndex].name} ganó la ronda!</p>
        <h3>Puntuaciones:</h3>
        <ul>
    `;
    players.forEach(player => {
        resultsHtml += `<li>${player.name}: ${player.points} puntos</li>`;
    });
    resultsHtml += `</ul>`;
    // Definimos la función que se ejecutará al hacer clic en "Jugar de Nuevo"

    // Muestra la modal con los resultados y el botón para jugar de nuevo
    displayGameVentana(
        "Fin de la Ronda",
        resultsHtml,
        "Continuar",
        "Reiniciar Partida",
        playAgainCallback,
        fullResetCallback
    );
}
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('puntaje-display');
    let scoreHtml = '';
    
    players.forEach((player, index) => {
        if (index === 0){
            const savedProfile = localStorage.getItem('playerProfile');
                if (savedProfile) {
                    profile = JSON.parse(savedProfile);
                }
            scoreHtml += `<div>
                <strong>${profile.name}:</strong> ${player.points} pts.
            </div>`;
        } else {
            scoreHtml += `<div>
                <strong>${player.name}:</strong> ${player.points} pts.
            </div>`;
        }
    });
    scoreDisplay.innerHTML = scoreHtml;
}