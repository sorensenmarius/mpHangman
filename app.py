import os
import requests
import random
import json

from flask import Flask, render_template, request, session

app = Flask(__name__)

alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
currentPlayers = []
currentPlaying = ''
playing = {'p': False, 'started': ''}
currentWord = ''
rightLetters = {}
wrongLetters = []
chatMessages = []

@app.route('/')
def home():
    return render_template('home.html')


@app.route('/play')
def play():
    return render_template('play.html')

@app.route('/newWord')
def newWord():
    global currentWord
    randomLetter = random.choice(alphabet)
    words = json.loads(requests.get(f'http://api.datamuse.com/sug?s={randomLetter}&max=100').text)
    word = random.choice([word for word in words if len(word.get('word')) > 4])
    currentWord = word['word']
    length = len(currentWord)
    return json.dumps(length)

@app.route('/getWord')
def getWord():
    global currentWord
    length = len(currentWord)
    return json.dumps(length)

@app.route('/newPlayer', methods=['GET', 'POST'])
def newPlayer():
    if request.method == 'POST':
        u = request.form.get('username')
        if not u:
            u = request.args.get('username')
        currentPlayers.append({
            'username': u,
            'points': 0
        })
        return f"Du er registrert med navn {u}"

@app.route('/getPlayers')
def getPlayers():
    global currentPlayers
    global playing
    response = {
        'playing': playing,
        'currentPlayers': currentPlayers
    }
    return json.dumps(response)

@app.route('/letsPlay')
def letsPlay():
    global playing
    global currentPlaying
    global currentPlayers
    playing['p'] = True
    playing['started'] = request.args.get('username')
    currentPlaying = random.choice(currentPlayers)
    print(currentPlaying)
    return "Lets play"

@app.route('/status')
def status():
    global currentPlaying
    global wrongLetters
    global rightLetters
    global playing
    global chatMessages
    res = {
        'currentPlaying': currentPlaying,
        'wrongLetters': wrongLetters,
        'rightLetters': rightLetters,
        'playing': playing,
        'chatMessages': chatMessages
    }
    return json.dumps(res)

@app.route('/guessWord')
def guessWord():
    global currentWord
    w = request.args.get('guessedWord')
    u = request.args.get('username')
    wrongGuess = [f"{u} gjettet '{w}'. Det er jo ikke helt riktig", f"{u} prøver seg på '{w}', som er helt feil", f"{u}, '{w}' er nok ikke riktig det nei."]
    if currentWord.lower() == w.lower():
        # guessedWords.append({'w': w, 'u': u, 'correct': True})
        chatMessages.append("{username}")
        return 'You guessed correctly'
    else:
        chatMessages.append(random.choice(wrongGuess))
        return 'Thats not quite right'


@app.route('/guessLetter')
def guessLetter():
    global rightLetters
    global alphabet
    global currentPlaying
    global wrongLetters
    global currentWord
    global currentPlayers
    l = request.args.get('guessedLetter')
    if(l.lower() not in alphabet):
        chatMessages.append(f"{currentPlaying['username']}... {l} er jo ikke i det engelske alfabetet? Du mister din tur")
        msg = 'Not an english letter'
    elif(l.lower() in wrongLetters or l.lower() in rightLetters):
        chatMessages.append(f"Wops {currentPlaying['username']}, '{l}' har allerede blitt gjettet. Du mister din tur")
        msg = 'Already guessed'
    elif(l.lower() not in currentWord and l.lower()):
        chatMessages.append(random.choice([f"'{l}' er nok ikke en del av dette ordet {currentPlaying['username']}.", f"Godt forsøk {currentPlaying['username']}, men '{l}' er feil.", f"'{l}' var nesten, men nesten holder ikke {currentPlaying['username']}"]))
        wrongLetters.append(l)
        msg = 'That letter is not in the word'
    elif(l.lower() in currentWord):
        chatMessages.append(random.choice([f"Helt riktig {currentPlaying['username']}, '{l}' er en del av ordet!", f"{currentPlaying['username']} gjetter '{l}' og har aldri hatt mer rett", f"Du vinner denne gang {currentPlaying['username']}, '{l}' er riktig det..."]))
        rightLetterIndexes = [pos for pos, char in enumerate(currentWord) if char == l]
        rightLetters[l] = rightLetterIndexes
        if len(rightLetterIndexes) > 1:
            s = 'steder'
        else:
            s = 'sted'
        chatMessages.append(f"{currentPlaying['username']} får {len(rightLetterIndexes) * 500} poeng for å gjette en bokstav som er {len(rightLetterIndexes)} {s} i ordet!")
        # TODO Adde poeng når spillere velger riktig bokstav:
        [player for player in currentPlayers if player.get('username')==currentPlaying['username']]['points'] += len(rightLetterIndexes)
        msg = 'Correct letter!'
    i = currentPlayers.index(currentPlaying)
    if i == len(currentPlayers) - 1:
        currentPlaying = currentPlayers[0]
    else: 
        currentPlaying = currentPlayers[i + 1]
    return msg

#Test routes
@app.route('/nextPlayer')
def nextPlayer():
    global currentPlaying
    global currentPlayers
    i = currentPlayers.index(currentPlaying)
    if i == len(currentPlayers) - 1:
        currentPlaying = currentPlayers[0]
    else:
        currentPlaying = currentPlayers[i + 1]
    return f'Next player is {currentPlaying}'

@app.route('/gimme')
def gimme():
    global currentWord
    return currentWord

if __name__ == "__main__":
    app.run(debug=1) 