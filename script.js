//DOM elements
const textToType = document.querySelector('#textToType')
const startButton = document.querySelector('#startButton')
const restartButton = document.querySelector('#restartButton')
const leaderboardButton = document.querySelector('#leaderboardButton')
const infoContainer = document.querySelector('.infoContainer')
const timer = document.querySelector('#timer')
const wpmHolders = document.querySelectorAll('.wpmHolder')
const main = document.querySelector('#main')
const leaderboard = document.querySelector('#leaderboard')
const backToMainButton = document.querySelector('#backToMain')
const popup = document.querySelector('.popup-container')
const nameInput = document.querySelector('#playerName')
const confirmButton = document.querySelector('#confirmButton')
const leaderboardContainer = document.querySelector('#leaderboardContainer')
const mobileFocuser = document.querySelector('#mobileFocuser')

//important variables
let typed = []
let typeCount = 0
let wrongs = 0
let timeLeft = 30
let wpm = 0
let timeInterval
let gameStart = false

//player input variables
let playerName = ""

const setTextToType = () => {
    textToType.innerHTML = ""
    let selectedText = texts[Math.floor(Math.random()*texts.length)]
    selectedText = selectedText.split("").join("&").split("&")
    selectedText.map(letter => {
        let spanNode = document.createElement('span')
        let textNode = document.createTextNode(letter)
        spanNode.className = "unpolish"
        spanNode.appendChild(textNode)
        textToType.appendChild(spanNode)
    })
    typed = []
};setTextToType() //initial set

const calculateWPM = () => {
    wpm = Math.ceil(((typeCount - wrongs) / 5) / 0.5)
    wpmHolders.forEach(wpmHolder => {
        wpmHolder.innerHTML = wpm
    })
}

const startGame = () => {
    gameStart = true; //enable document to listen for key downs
    infoContainer.classList.remove('disabled')
    startButton.disabled = true
    startButton.blur() // for firefox
    leaderboardButton.disabled = true
    mobileFocuser.focus()

    textToType.children[0].classList.add('current')

    timeInterval = setInterval(() => {
        --timeLeft
        timer.innerHTML = timeLeft
        calculateWPM()
        if(timeLeft <= 0){
            clearInterval(timeInterval)
            infoContainer.classList.add('disabled')
            startButton.disabled = false
            leaderboardButton.disabled = false
            startButton.classList.add('hide')
            restartButton.classList.remove('hide')
            gameStart = false // disables the DOM from listening to key downs
            mobileFocuser.blur()

            //show popup
            popup.classList.remove('hide')
        }
    },1000)
}; startButton.addEventListener('click',startGame)


const restartGame = () => {
    timeLeft = 30
    timer.innerHTML = timeLeft
    wpm = 0
    wpmHolders.forEach(wpmHolder => {
        wpmHolder.innerHTML = 0
    })
    wrongs = 0
    typeCount = 0
    textToType.innerHTML = ''
    playerName = ''
    nameInput.value = ''
    setTextToType()

    restartButton.classList.add('hide')
    startButton.classList.remove('hide')

}; restartButton.addEventListener('click',restartGame)

const detectKeyDown = e => {
    let typedChar = mobileFocuser.value.split("")[typeCount]
    console.log(typedChar)
    if(!gameStart)return
    if(typedChar == undefined){ //backspace
        typed.pop()
        --typeCount
        let formerNode = textToType.children[typed.length]

        if(formerNode.classList.contains("wrong") || formerNode.classList.contains("wrong-space")){
            --wrongs
        }

        formerNode.classList.add('unpolish')
        formerNode.classList.remove('polish')
        formerNode.classList.remove('wrong-space')
        formerNode.classList.remove('wrong')
        formerNode.classList.add('current')
        textToType.children[typed.length+1].classList.remove('current')


    }else{
        typed.push(typedChar)
        ++typeCount
        if(typed.length === textToType.children.length){
            setTextToType()
            textToType.children[0].classList.add('current')
        }
        let currentNode = textToType.children[typed.length-1]
        currentNode.classList.remove('unpolish')
        currentNode.classList.remove('current')
        if(typedChar === currentNode.innerHTML){
            currentNode.classList.add('polish')

        }else{
            ++wrongs
            if(currentNode.innerHTML === " "){
                currentNode.classList.add('wrong-space')
            }else{
                currentNode.classList.add('wrong')
            }
        }
        textToType.children[typed.length].classList.add('current')
        calculateWPM()
    }
}; mobileFocuser.addEventListener('input',detectKeyDown,true)

const goToLeaders = () => {
    leaderboard.classList.remove('hide')
    main.classList.add('hide')

    leaderboardContainer.innerHTML = ""//empty the container

    let players = JSON.parse(localStorage.getItem("players"))
    if(players && players.length > 0){
        let tableNode = document.createElement('table')
        let headerRow = document.createElement('tr')

        let headers = ['No.','Player Name', 'WPM']

        for(let i=0; i<headers.length; i++){
            let headerCol = document.createElement('th')
            let textNode = document.createTextNode(headers[i])
            headerCol.appendChild(textNode)
            headerRow.appendChild(headerCol)
        }
        tableNode.appendChild(headerRow)

        players = players.sort((a,b) => {
            if(a.wpm < b.wpm){
                return 1
            }
            if(a.wpm > b.wpm){
                return -1
            }
            return 0
        }) //sort the players according to highest wpm
        players = players.slice(0,10) //only take the 10 highest

        for(let i=0;i<players.length; i++){
            let tableRow = document.createElement('tr')
            let firstCol = document.createElement('td')
            let textNode = document.createTextNode(`${i+1}.`)
            firstCol.classList.add('text-center')
            firstCol.appendChild(textNode)
            tableRow.appendChild(firstCol)

            for(let property in players[i]){
                let tableCol = document.createElement('td')
                let textNode = document.createTextNode(players[i][property])
                if(property !== "playerName"){
                    tableCol.classList.add('text-center')
                }
                tableCol.appendChild(textNode)
                tableRow.appendChild(tableCol)
            }
            tableNode.appendChild(tableRow)
        }

        leaderboardContainer.appendChild(tableNode)

    }else{
        let pNode = document.createElement('p')
        let textNode = document.createTextNode('No players recorded. Be the first!')
        pNode.appendChild(textNode)
        leaderboardContainer.appendChild(pNode)
    }


}; leaderboardButton.addEventListener('click',goToLeaders)

const confirmName = () => {
    playerName = nameInput.value
    if(playerName === ""){
        return alert('Player must have a name')
    }

    popup.classList.add('hide')

    let players = JSON.parse(localStorage.getItem("players"))
    if(players && players.length > 0){
        localStorage.setItem("players",JSON.stringify([...players,{playerName:playerName,wpm:wpm}]))
    }else{
        localStorage.setItem("players",JSON.stringify([{playerName: playerName, wpm:wpm}]))
    }

    goToLeaders()
}; confirmButton.addEventListener('click',confirmName)

const backToMain = () => {
    leaderboard.classList.add('hide')
    main.classList.remove('hide')
}; backToMainButton.addEventListener('click',backToMain)