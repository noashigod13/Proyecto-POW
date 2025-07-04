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
    
    const savedProfile = localStorage.getItem('playerProfile');
    if (savedProfile) {
        profile = JSON.parse(savedProfile);
    }

    jmainInfo.innerHTML = `
        <div id="avatar" style="background-image: url('${profile.avatar}');"></div>
        <div id="name">${profile.name}</div>
    `;
    
    outBtn.addEventListener('click', () => window.location.href = 'bienvenida.html');
}

function startGame(numPlayers) {
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

function activeClickCard(){

    //Comprueba que en la mano del jugador principal se muestre la carta a la que se le hace click
    const cartas = document.querySelectorAll('.card-img');
    cartas.forEach(img => {
        img.addEventListener('click', () => {
            const id = img.id;
            const carta = players[0].cards.find(c => c.id === id);
            if (carta && currentPlayerIndex === 0) {
                playCard(0, carta);
            }
        });
    });
}

function playCard(playerIndex, card) {

    const jugador = players[playerIndex];
    const tope = discardPile[discardPile.length - 1];

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

    //Por default el CPU siempre dice uno
    if (!players[currentPlayerIndex].isHuman && players[currentPlayerIndex].cards.length === 1) {
        players[currentPlayerIndex].saidUNO = true;
    }
    
    // Actualizar el color actual del juego
    if (card.color !== 'wild') {
        game.currentColor = card.color;
    } else if(currentPlayerIndex === 0) {
        //Esto debería ser una ventana emergente con estilo
        const colorInput = prompt("Ingresa el color (red, green, blue, yellow):");
        if (colors.includes(colorInput)) {
            game.currentColor = colorInput; 
            console.log(`Color elegido: ${game.currentColor}`); 
        } else {
            console.log("Color inválido, se elige un color aleatorio.");
            game.currentColor = getRandomColor();
        }
    }    

    console.log("El " + jugador.name + " juega la carta: " + card.color + "-" + card.value );
    
    let offset = 1;
    switch (card.value) {
        case 'draw2':
            drawCard2(getNextPlayerIndex(1), 2);
            offset = 2;
        break;
        case 'jump':
            offset = 2;
        break;
        case 'reverse':
            direction *= -1;
            offset = 1;
        break;
        case 'wildDraw4':
            drawCard2(getNextPlayerIndex(1), 4);
            offset = 2;
        break;
    }

    renderDiscardPile(card);
    checkUNO(playerIndex);
    if (playerIndex === 0) {
        renderCardsHuman();
    } else {
        renderCardsCpu(playerIndex);
    }
    setTimeout(() => nextTurn(offset), 800);
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
    } else {
        console.log(`${jugador.name} no puede gritar UNO ahora`);
    }
}

function drawCard(playerIndex){

    let carta = deck.pop();
    if (carta) {
        console.log(`${players[playerIndex].name} roba una carta: ${carta.color}-${carta.value}`);
        players[playerIndex].cards.push(carta);
    }else {
        console.log("No hay cartas en el mazo para robar, vamos a barajear.");
        initializeDeck();
        carta = deck.pop();
    }
    
    //Ignorar. Es para verificar que las cartas se reparten correctamente
    players.forEach(p => {
        //console.log(`${p.name} tiene:`, p.cards);
        console.log(`${p.name} tiene:`, p.cards.map(c => `${c.color}-${c.value}-${c.id}`));
    });

    if (playerIndex === 0) {
        renderCardsHuman();
        setTimeout(() => nextTurn(1), 800);
    } else {
        renderCardsCpu(playerIndex);
        setTimeout(() => nextTurn(1), 800);
    }
}


function drawCard2(playerIndex,cant){
    let cont=0;
    while (cont < cant) {
        let carta = deck.pop();
        if (carta) {
            players[playerIndex].cards.push(carta);
            cont++;
        } else initializeDeck();
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
    const total = players.length;
    currentPlayerIndex = (currentPlayerIndex + direction * offset + total) % total;
    
    //Mostrar en consola de quien es el turno
    console.log(`Turno de: ${players[currentPlayerIndex].name}`);
    
    if (!players[currentPlayerIndex].isHuman) {
        setTimeout(cpuPlay, 800);
        unoBtn.classList.remove('disabled');
    } else {
        if (players[currentPlayerIndex].cards.length === 2) {
            unoBtn.classList.add('disabled');
        }
    }
}

function cpuPlay() {
    const tope = discardPile[discardPile.length - 1];
    const cartaJugable = players[currentPlayerIndex].cards.find(card =>
        card.color === tope.color || 
        card.value === tope.value  || 
        card.color === 'wild' ||
        (tope.color === 'wild' && card.color === game.currentColor)
    );

    if (cartaJugable) {

        if (cartaJugable.value === 'wild' || cartaJugable.value === 'wildDraw4') {
            game.currentColor = getRandomColor();
            console.log(`CPU elige color: ${game.currentColor}`);
        }

        playCard(currentPlayerIndex, cartaJugable);

    } else {
        console.log(`${players[currentPlayerIndex].name} no tiene cartas jugables, roba una carta.`);
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
        drawCard2(playerIndex,2);
        if (jugador.isHuman) renderCardsHuman();
        else renderCardsCpu(playerIndex);
    
    } else unoBtn.classList.remove('disabled');
    
    // si se quedó sin cartas, se termina la ronda 
    if (jugador.cards.length === 0) resetRound();
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
}


function resetRound() {
    const winnerIndex = players.findIndex(p => p.cards.length === 0);
    countPoints(winnerIndex);
    //game.roundWinner = players[winnerIndex];
    //aqui deberia de salir una ventana modal con la cantidad de puntos por jugador y la opción de querer seguir jugando o no
    console.log(`${players[winnerIndex].name} ganó la ronda y suma ${players[winnerIndex].points} puntos`);
    // reiniciar el juego
    currentPlayerIndex = 0;
    direction = 1;
    deck = [];
    discardPile = [];
    initializeDeck();
    dealCards();
}
