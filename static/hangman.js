window.onload = () => {
    register()
}


//Global variables
var myUsername = ''
var iStarted = false


function startGame() {
    var gameScreen = document.getElementById("game")
    gameScreen.innerHTML = "<h1>Er dere klare til å starte?</h1>\n<button onclick='letsPlay()' class='btn'>Start</button>"
    var players = document.createElement("div")
    players.id = 'startScreenPlayers'
    gameScreen.appendChild(players)
    getPlayersLoop()
}

function register() {
    var gameScreen = document.getElementById("game")
    gameScreen.innerHTML = "<h1>Registrer deg med et brukernavn her: </h1><input type='text' placeholder='Brukernavn' id='registerTextField'><button label='Send' onclick='registerNewUser()'>Send</button>"
}

function registerNewUser() {
    var tf = document.getElementById('registerTextField')
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/newPlayer', true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            myUsername = tf.value
            startGame()
        }
    }
    xhr.send(`username=${tf.value}`);
}


function newWord() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:5000/newWord", true);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
} 

function getWord() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:5000/getWord", true);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            init()
            ordSetup(xhr.responseText)
        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
} 

function getPlayersLoop(notReady) {
    setTimeout(() => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:5000/getPlayers", true);
        xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var res = JSON.parse(xhr.response)
                if(!res.playing.p) {
                    var p = document.getElementById('startScreenPlayers')
                    p.innerHTML = ""
                    for(i = 0; i < res.currentPlayers.length; i++) {
                        var div = document.createElement('div')
                        div.id = 'playerBox'
                        div.innerHTML = res.currentPlayers[i].username
                        p.appendChild(div)
                    }
                    getPlayersLoop()
                } else {
                    starting(res.playing.started)
                }
            } else {
                console.error(xhr.statusText);
            }
        }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
        };
        xhr.send(null);
    }, 1000)
}

function starting(started) {
    document.getElementById("game").innerHTML = `<h1>${started} har startet spillet.</h1><h2>Vi starter om <span id='countdown'></span> sekunder</h2>`
    var i = 5;

    function startingCountdown() {
        i--;
        document.getElementById("countdown").innerHTML = i
        if( i > 0 ){
            setTimeout( startingCountdown, 1000 );
        } else {
            getWord()
        }
    }
    startingCountdown()
}

function letsPlay() {
    iStarted = true;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:5000/letsPlay?username=${myUsername}`, true);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            newWord()
        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

function getStatusLoop() {
    setTimeout(() => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", `http://localhost:5000/status`, true);
        xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var res = JSON.parse(xhr.response)
                var curPlay = document.getElementById('currentPlaying')
                if(res.playing.p) {
                    // Updates who is playing
                    if(res.currentPlaying.username == myUsername) {
                        if(curPlay.innerHTML != 'din'){
                            curPlay.innerHTML = 'din'
                            curPlay.style.color = 'red'

                        }
                    } else {
                        curPlay.innerHTML = res.currentPlaying.username + ' sin'
                        curPlay.style.color = 'black'
                    }

                    //Updates chat
                    // var chat = document.getElementById('chat')
                    // var guesses = res.guessedWords
                    // for(i = 0; i < guesses.length; i++) {

                    // }
                } else {
                    console.log('Server has been reset')
                }
            } else {
                console.error(xhr.statusText);
            }
            getStatusLoop()
        }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
        };
        xhr.send(null);
    }, 2000)
}



function ordSetup(wordlength) {
    var w = document.getElementById('wordInside')
    w.innerHTML = ""
    for(i = 0; i < wordlength; i++) {
        var div = document.createElement("div")
        div.classList.add("letter")
        div.id = 'letter_' + i
        w.appendChild(div)
    }
    document.getElementById("letterNum").innerHTML = wordlength
}

function init() {
    g = document.getElementById("game")
    g.innerHTML =''
    var canv = document.createElement('canvas')
    canv.id = 'canv'
    canv.height = '394'
    canv.width = '300'
    g.appendChild(canv)
    var div = document.createElement('div')
    div.id = 'word'
    g.appendChild(div)
    var h3 = document.createElement('h3')
    h3.innerHTML = "<h3>Ordet er engelsk og har <span id='letterNum'></span> bokstaver"
    div.appendChild(h3)
    var div2 = document.createElement('div')
    div2.id = 'wordInside'
    div.appendChild(div2)
    div = document.createElement('div')
    div.id = 'guess'
    div.innerHTML = "<h3>Det er <span id='currentPlaying'></span> tur</h3><h4>Du kan gjette hele ordet her:</h4><input type='text' placeholder='Gjett ordet' id='guessWord'><button onclick='guessWord()' >Send</button>"
    var guessLetter = document.createElement('div')
    guessLetter.id = 'guessLetter'
    guessLetter.innerHTML = "<h4 id='guessLetterHeader'>Gjett en bokstav:</h4><input type='text id='guessLetterTextbox' placeholder='Gjett en bokstav' maxlength='1' minlength='1'><button id='guessLetterButton' onclick='guessLetter()'>Send</button>"
    div.appendChild(guessLetter)
    g.appendChild(div)

    draw(75, 25, 225, 25) // Toppen
    draw(75, 25, 75, 320) // Venstre
    draw(1, 320, 149, 320) // Bunnen


    getStatusLoop()
}

function reset() {
    myUsername = ''
    iStarted = false
}

// TODO Finish guessword

function guessWord() {
    var gw = document.getElementById("guessWord").value
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:5000/guessWord?guessedWord=${gw}&username=${myUsername}`, true);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            console.log(xhr.responseText)
        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

function guessLetter() {
    var l = document.getElementById('guessLetterTextbox').value
    // if(tb.value.strip().length != 1) {
        
    // }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:5000/guessLetter?guessedWord=${gw}&username=${myUsername}`, true);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            console.log(xhr.responseText)
        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}


// Drawing!
function draw(fx, fy, tx, ty) {
    ca = document.getElementById("canv")
    c = ca.getContext('2d')
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(fx, fy);
    c.lineTo(tx, ty);
    c.stroke();
}

function drawNext(i) {
    var d = [drawRope, drawHead, drawBody, drawRightArm, drawLeftArm, drawRightLeg, drawLeftLeg]
    d[i]()
}

function drawRope() {
    draw(225, 25, 225, 40)
}

function drawHead() {
    var canvas = document.getElementById('canv');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        
        ctx.lineWidth = 3
        ctx.beginPath();
        ctx.arc(225, 70, 30, 0, Math.PI * 2, true); // Outer circle
        ctx.moveTo(250, 70);
        ctx.arc(225, 70, 25, 0, Math.PI, false);  // Mouth (clockwise)
        ctx.moveTo(235, 65);
        ctx.arc(235, 65, 5, 0, Math.PI * 2, true);  // Left eye
        ctx.moveTo(215, 65);
        ctx.arc(215, 65, 5, 0, Math.PI * 2, true);  // Right eye
        ctx.stroke();
    }
}

function drawBody() {
    var canvas = document.getElementById('canv');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.ellipse(225, 150, 50, 40, Math.PI / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function drawRightArm() {
    draw(260, 122, 290, 90)
}

function drawLeftArm() {
    draw(190, 122, 160, 90)
}

function drawRightLeg() {
    draw(257, 180, 290, 230)
}

function drawLeftLeg() {
    draw(193, 180, 160, 230)
}