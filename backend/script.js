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

// Variables globales para la conexión con el servidor

const serverURL = 'http://localhost:3001';
let currentGame = null;

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
let timeNextPlay = 1500;
let waitingForColorSelection = false;
let isGamePaused = false;
let clickCard = null;


//Botones
const drawBtn = document.getElementById('descarte');
const unoBtn = document.getElementById('uno');
const restartButton = document.getElementById('restart');

//Variables para las flechas
let topDirectionIndicator;
let bottomDirectionIndicator;

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
        startGame();
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

//Funciones de configuración de la página del juego
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

//Funcion para mostrara la ventana emergente
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
//Funcion paa esconder la ventana emergente
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

//Funcion para selecionar el color en la ventana emergente, 
// ahora esta función es asincrona porque se espera que se envie la carta
async function selectNewColor(event) {
    const selectedColor = event.target.dataset.color;
    if (selectedColor) {
        game.currentColor = selectedColor;
        updateCurrentColorDisplay();
        hideGameVentana();
        //addNotification(`${players[currentPlayerIndex].name} cambia el color a ${game.currentColor}`, 'color-changed');
        waitingForColorSelection = false;

        if (clickCard) {
            await sendCard(clickCard, game.currentColor);
        }
    }
}

/*function selectNewColor(event) {
    const selectedColor = event.target.dataset.color;
    if (selectedColor) {
        game.currentColor = selectedColor;
        updateCurrentColorDisplay();
        hideGameVentana();
        addNotification(`${players[currentPlayerIndex].name} cambia el color a ${game.currentColor}`, 'color-changed');
        if (waitingForColorSelection) waitingForColorSelection = false;
    }
}*/

//Funcion para inicializar/actualizar el color e inicializar/actualizar la direccion de las flechas
function updateCurrentColorDisplay() {
    const color = game.currentColor === 'wild' ? 'grey' : game.currentColor;
    const topArrow = topDirectionIndicator.querySelector('.forma-flecha');
    const bottomArrow = bottomDirectionIndicator.querySelector('.forma-flecha');
    //Actualiza color de las flechas
    topArrow.style.borderLeftColor = color;
    bottomArrow.style.borderLeftColor = color;
    //Actuliza dirreccion
    if (direction === 1) {//sentido horario
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


// Funciones del juego
function setupGamePage() {
    const jmainInfo = document.getElementById('jmain-info');
    const outBtn = document.getElementById('out');
    
    //Obtenemos los ID para las flechas
    topDirectionIndicator = document.getElementById('indicador-direccion-top');
    bottomDirectionIndicator = document.getElementById('indicador-direccion-bottom');
    
    const savedProfile = localStorage.getItem('playerProfile');
    if (savedProfile) {
        profile = JSON.parse(savedProfile);
    }

    jmainInfo.innerHTML = `
        <div id="avatar" style="background-image: url('${profile.avatar}');"></div>
        <div id="name">${profile.name}</div>
    `;
    
    outBtn.addEventListener('click', () => window.location.href = 'bienvenida.html');
    
    //Encuentra todo los que tiene que ver con la ventana emergente
    gameVentanaEmergente = document.getElementById('game-ventana-emergente');
    gameVentana = document.getElementById('game-ventana');
    ventanaTitle = document.getElementById('ventana-title');
    ventanaBody = document.getElementById('ventana-body');
}

function setupWebSocket(gameId){
    const ws = new WebSocket(`ws://localhost:3001/uno`);
    ws.onopen = () => {
        console.log("Conexión WebSocket establecida");
        ws.send(JSON.stringify({ type: 'subscribe', gameId }));
    };
    ws.onmessage = (e) => {
        let msg = JSON.parse(e.data);
        console.log("Evento recibido: ", msg);

        //Guia: client_play y bot_play dan el turno del siguiente jugador
        switch (msg.type) {
            case 'client_play':
                //showPlayerStatus(getNextPlayerIndex(1), '🚫');
                //addNotification(`${players[getNextPlayerIndex(1)].name} pierde turno!`, 'turn-skipped');
                //addNotification(`${players[currentPlayerIndex].name} cambia el color a ${game.currentColor}`, 'color-changed');
                addNotification(`${msg.player} jugó ${msg.card.color}-${msg.card.value}`, 'card-played');
                console.log(`${msg.player} jugó ${msg.card.color}-${msg.card.value}`);
                
                // Revisar si el humano se quedo sin cartas
                updateUI(msg.gameState,msg);
                break;
            case 'bot_play':
                addNotification(`${msg.player} jugó ${msg.card.color}-${msg.card.value}`, 'card-played');
                console.log(`${msg.player} jugó ${msg.card.color}-${msg.card.value}`);
                updateUI(msg.gameState,msg);
                break;
            case 'client_draw_from_deck':
                showPlayerStatus(0, '+1');
                addNotification(`${msg.player} roba una carta`, 'cards-drawn');
                console.log(`${msg.player} robó una carta del mazo`);
                updateUI(msg.gameState,msg);
                break;
            case 'bot_draw_from_deck':
                if (msg.gameState.turn-1 === -1) showPlayerStatus(3, '+1');
                else showPlayerStatus((msg.gameState.turn-1), '+1');
                addNotification(`${msg.player} roba una carta`, 'cards-drawn');
                console.log(`${msg.player} robó una carta del mazo`);
                updateUI(msg.gameState,msg);
                break;
            case 'draw_penalty':
                //showPlayerStatus(getNextPlayerIndex(1), '+4');
                //addNotification(`${players[getNextPlayerIndex(1)].name} roba 4 cartas y pierde el turno!`, 'cards-drawn');
                //showPlayerStatus(getNextPlayerIndex(1), '+2');
                //addNotification(`${players[getNextPlayerIndex(1)].name} roba 2 cartas y pierde el turno!`, 'cards-drawn');
                console.log("Jugador recibe penalización de cartas");
                break;
            case 'uno_penalty':
                showPlayerStatus(msg.gameState.turn, '+2');
                addNotification(`${msg.player} olvidó gritar UNO y roba 2 cartas`, 'cards-drawn');
                console.log("Jugador recibe una penalización por no decir UNO a tiempo");
                updateUnoButton(msg.gameState,msg);
                break;
            case 'uno_warning':
                console.log("Te queda una sola carta, di UNO a tiempo");
                updateUnoButton(msg.gameState,msg);
                break;
            case 'client_uno':
                console.log(`${msg.player} dijo UNO`);
                showPlayerStatus(msg.gameState.turn, 'UNO');
                break;
            case 'bot_uno':
                console.log(`${msg.player} dijo UNO`);
                showPlayerStatus(msg.gameState.turn, 'UNO');
                break;
            case 'round_score':
                console.log("Se acabó la ronda");
                resetRound(msg);
                break;
        }       
    }
    ws.onerror = (e) => {
        console.error("Error en WebSocket: ", e);
    };

    ws.onclose = () => {
        console.log("Conexión WebSocket cerrada");
    };

}

async function startGame() {
    try {
        let response = await fetch(`${serverURL}/start`, {
            method: 'POST'
        });
        if (!response){
            throw new Error('No se pudo iniciar la partida.');
        }    

        const data = await response.json();
        //Ignorar es para ver que datos se reciben del servidor
        //console.log('Datos:', data);
        currentGame = data.gameId;
        setupWebSocket(currentGame);
        
        //arreglo de jugadores
        for (let i = 0; i < 4; i++) {
            players.push({
                id: `player-${i + 1}`,
                name: `Jugador ${i + 1}`,
                cards: [],
                points: 0,
                saidUNO: false,
                isHuman: i === 0 //Solo es verdadero para el primer jugador
            });
        }

        //Se limpian las notificaciones y los puntos al iniciar la partida
        document.getElementById('avisos-content').innerHTML = ''; 
        updateScoreDisplay();

        // Activar el resaltado para el primer jugador al inicio del juego
        const initialPlayerInfoElementId = getPlayerInfoElementId(data.turn);
        const initialPlayerInfoElement = document.getElementById(initialPlayerInfoElementId);
        if (initialPlayerInfoElement) {
            initialPlayerInfoElement.classList.add('current-player-highlight');
        }
        updateUI(data);

        //activar click del mazo
        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
                if (currentPlayerIndex === 0){
                    //Solo se puede robar si no se tiene cartas jugables
                    const cartaJugable = players[0].cards.find(card =>
                        (card.color ===  discardPile.color || 
                        card.value ===  discardPile.value  || 
                        card.color === 'wild' ||
                        (discardPile.color === 'wild' && card.color === game.currentColor))
                    );
                    if (cartaJugable) {
                        console.log("No puedes robar una carta, tienes cartas jugables.");
                        return;
                    }
                    drawCard();
                }    
            });    
        }

        //activar click del boton de uno
        if (unoBtn) {
            unoBtn.addEventListener('click', unoButtonClick);
            //se pasa unoButtonClick sin parentesis para que no se ejecute inmediatamente
        }

        //activar click de reinicar partida
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                displayConfirmationVentana();
            });
        }

    } catch (error) {
        console.error("Error al iniciar el juego:", error);
    }

}

async function drawCard(){
    try {
        let response = await fetch(`${serverURL}/draw`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gameId:currentGame})
        });

        const data = await response.json();

        // Revisar si el humano se quedo sin cartas
        if (players[0].length === 0){
            game.roundWinner = players[0];
            resetRound();
            return;
        } else {
            //Revisar si el cpu se quedo sin cartas
            for (let i = 1; i < (data.gameState.otherPlayers.length + 1); i++) {
                if (data.gameState.otherPlayers[i - 1].count === 0){
                    game.roundWinner = players[i];
                    resetRound();
                    return;
                }
            }
        }
            
    } catch (error) {
        console.error('Error al robar carta:', error);
    }
}   

function playCard(card) {
    if (currentPlayerIndex !== 0) return;

    if (card.color === 'wild') {
        waitingForColorSelection = true;
        clickCard = card; 
        showColorSelectionVentana();
        return; 
    }

    //Si no es comodín, se manda de una vez la carta
    sendCard(card, game.currentColor);
}

async function sendCard(card, chosenColor) {
    try {
        const response = await fetch(`${serverURL}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: currentGame, card, chosenColor })
        });

        const data = await response.json();
    
    } catch (error) {
        console.error("Error al enviar carta:", error);
    }
}

/*async function playCard(card) {
    if (currentPlayerIndex !== 0) return;
    try {
        // Si la carta es comodin Actualizar el color actual del juego
        if (card.color !== 'wild') {
            game.currentColor = card.color;
        } else {
            //Esto debería ser una ventana emergente con estilo
            const colorInput = prompt("Ingresa el color (red, green, blue, yellow):");
            if (colors.includes(colorInput)) {
                game.currentColor = colorInput; 
                console.log(`Color elegido: ${game.currentColor}`); 
            } else {
                console.log("Color inválido, se elige un color aleatorio.");
                game.currentColor = getRandomColor();
            }
            addNotification(`${players[currentPlayerIndex].name} cambia el color a ${game.currentColor}`, 'color-changed');
        }    

        const response = await fetch(`${serverURL}/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({gameId: currentGame, card: card, chosenColor: game.currentColor})
        });

        const data = await response.json();
        
    } catch (error) {
        console.error("Error al jugar carta:", error);
    }
}*/
async function resetRound(msg) {
    // Actualizar puntuaciones 
    for (let i = 0; i < msg.scores.length; i++) {
        players[i].points = msg.scores[i];
    }
    // Mostrar ventana emergente con resultados
    let resultsHtml = `
        <p>${players[msg.winnerIdx].name} ganó la ronda y sumó ${msg.roundScore} puntos.</p>
        <h3>Puntuaciones:</h3>
        <ul>
    `;
    players.forEach(player => {
        resultsHtml += `<li>${player.name}: ${player.points} puntos</li>`;
    });
    resultsHtml += `</ul>`;

    displayGameVentana(
        "Fin de la Ronda",
        resultsHtml,
        "Continuar", // Texto botón continuar
        "Reiniciar Partida", // Texto botón reiniciar
        () => {
            hideGameVentana(); // continuar la partida
        },
        () => {
            hideGameVentana();
            startGame(); // reiniciar la partida
            return;
        }
    );

    try {
        let response = await fetch(`${serverURL}/new-round`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId: currentGame })
        });

        let data = await response.json();
        console.log("Nueva ronda:", data);

        currentGame = data.gameId;
        
        //Se limpian las notificaciones al iniciar la partida
        document.getElementById('avisos-content').innerHTML = ''; 
        updateUI(data);

    } catch (error) {
        console.error("Error al reiniciar la ronda:", error);
    }
}


function activeClickCard(){
    if (currentPlayerIndex !== 0) return;

    const cartas = document.querySelectorAll('.card-img');
    cartas.forEach(img => {
        img.addEventListener('click', () => {
            const id = img.id;
            const carta = players[0].cards.find(c => c.id === id);
            if (carta && currentPlayerIndex === 0) {
                playCard(carta);
            }
        });
    });
}    

async function unoButtonClick() {
    try {
        await fetch(`${serverURL}/uno`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gameId:currentGame })
        });
    } catch(error) {
        console.error('Error al gritar UNO:', error);
    }
}    

function updateUnoButton(data,msg) {
    if (data.turn === 0 && data.clientCards.length === 1 && msg.type === 'uno_warning'){
        unoBtn.classList.add('animation');
        unoBtn.classList.add('hover');
        unoBtn.classList.add('active');
    }else{
        unoBtn.classList.remove('animation');
        unoBtn.classList.remove('active');
        unoBtn.classList.remove('hover');
    }
}

function updateUI(data,msg) {

    // Validar que el arreglo de cartas del jugador sea un array
    if (Array.isArray(data.clientCards)) {
        players[0].cards = data.clientCards;
    } else {
        console.error("Cartas del Jugador 1 invalidas:", data.clientCards);
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

    //ajustar variables globales
    game.currentColor = data.currentColor;
    currentPlayerIndex = data.turn;
    direction = data.direction;
    discardPile = data.discardPile;
    updateUnoButton(data,msg);

    
    // Agregar el color en los bordes al jugador actual
    const currentPlayerInfoElementId = getPlayerInfoElementId(currentPlayerIndex);
    const currentPlayerInfoElement = document.getElementById(currentPlayerInfoElementId);
    if (currentPlayerInfoElement) {
        currentPlayerInfoElement.classList.add('current-player-highlight');
    }

    //repartir cartas visualemte al humano
    const firstCard = data.discardPile;
    renderDiscardPile(firstCard);
    renderCardsHuman();
    activeClickCard(); 

    //repartir visuamente las cartas a los jugadores CPU
    for (let i = 1; i < (data.otherPlayers.length + 1); i++) {
        //players[i].cards = [];
        //players[i].cards.length = data.otherPlayers[i - 1].count;
        players[i].cards = new Array(data.otherPlayers[i - 1].count).fill({});
        renderCardsCpu(i);
    }

    updateScoreDisplay();
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
}

async function displayConfirmationVentana() {
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
        },
        () => {
            hideGameVentana();
            startGame(); // Callback para Reiniciar
        }
    );
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


