const main = document.querySelector('.main')
const leaderboard = document.querySelector('.leaderboard')
const popupContainer = document.querySelector('.popup-container')
const textToType = main.querySelector('.textToType')
const info = main.querySelector('.info')
const timer = main.querySelector('.timer')
const wpmHolders = document.querySelectorAll('.wpmHolder')
const startBtn = main.querySelector('.startBtn')
const restartBtn = main.querySelector('.restartBtn')
const leaderboardBtn = main.querySelector('.leaderboardBtn')
const confirmBtn = popupContainer.querySelector('.confirmBtn')
const backToMainBtn = leaderboard.querySelector('.backToMainBtn')
const inputHolder = main.querySelector('.inputHolder')
const tableContainer = leaderboard.querySelector('.table-container')
const popup = popupContainer.querySelector('.popup')
const nameInput = popup.querySelector('.nameInput')
const warning = popup.querySelector('.warning')

let typed = []
let typeCount = 0
let wrongs = 0
let wpm = 0
let timeLeft = 30
let gameStart = false
let timeInterval
let tableHeaders = ['No.','Player Name','WPM']

const setTextToType = () => {
    typed = []
    inputHolder.value = ''
    textToType.innerHTML = ''

    let selectedText = texts[Math.floor(Math.random()*texts.length)]
    selectedText = selectedText.split("").join("&").split("&")
    selectedText.map(letter => {
        let spanNode = document.createElement('span')
        spanNode.innerHTML = letter
        spanNode.className = 'unpolish'
        textToType.appendChild(spanNode)
    })
}; setTextToType();
textToType.addEventListener('click',()=>{
    if(gameStart){
        inputHolder.focus()
    }
})

const startGame = () => {
    gameStart = true
    textToType.children[0].classList.add('current')
    info.classList.remove('disabled')
    startBtn.disabled = true
    startBtn.blur()
    leaderboardBtn.disabled = true

    inputHolder.focus()

    timeInterval = setInterval(()=>{
        --timeLeft
        timer.innerHTML = timeLeft

        if(timeLeft == 0){
            gameStart = false
            clearInterval(timeInterval)
            inputHolder.blur()

            startBtn.disabled = false
            leaderboardBtn.disabled = false
            startBtn.classList.add('hide')
            restartBtn.classList.remove('hide')

            popupContainer.classList.remove('hide')
            popup.classList.add('popping')
            setTimeout(()=>{
                popup.classList.remove('popping')
            },200)
        }
    },1000)
}; startBtn.addEventListener('click',startGame)


const restartGame = () => {

    typed = []
    typeCount = 0
    wrongs = 0
    wpm = 0
    wpmHolders.forEach(holder => holder.innerHTML = wpm)
    timeLeft = 30
    timer.innerHTML = timeLeft
    gameStart = false
    
    setTextToType()

    startBtn.classList.remove('hide')
    restartBtn.classList.add('hide')
    info.classList.add('disabled')
    nameInput.value = ''
}; restartBtn.addEventListener('click',restartGame)


const detectInput = () => {
    if(!gameStart)return
    let typedChar = inputHolder.value.split("")[typed.length]

    if(typedChar == undefined){
        typed.pop()
        --typeCount

        let previousNode = textToType.children[typed.length]
        previousNode.classList.add('current')
        previousNode.classList.add('unpolish')

        if(previousNode.classList.contains('wrong-space') ||
        previousNode.classList.contains('wrong')){
            --wrongs
            previousNode.classList.remove('wrong-space')
            previousNode.classList.remove('wrong')
        }else{
            previousNode.classList.remove('polish')
        }

        textToType.children[typed.length+1].classList.remove('current')

    }else{
        typed.push(typedChar)
        ++typeCount

        let currentNode = textToType.children[typed.length-1]
        currentNode.classList.remove('current')

        if(typedChar != currentNode.innerHTML)++wrongs

        if(typed.length == textToType.children.length){
            setTextToType()
        }

        if(typedChar == currentNode.innerHTML){
            currentNode.classList.add('polish')
        }else{
            if(currentNode.innerHTML == ' '){
                currentNode.classList.add('wrong-space')
            }else{
                currentNode.classList.add('wrong')
            }
        }

        textToType.children[typed.length].classList.add('current')
    }
    calculateWPM()

}; inputHolder.addEventListener('input',detectInput)


const calculateWPM = () => {
    wpm = Math.round(((typeCount - wrongs) / 5) / 0.5)
    wpmHolders.forEach(holder => holder.innerHTML = wpm)
}


const confirmPlayer = () => {
    let playerName = nameInput.value.trim()
    if(playerName == ''){
        popup.classList.add('shake')
        warning.classList.remove('hide')
        setTimeout(()=>{popup.classList.remove('shake')},500)
        return
    }

    let players = JSON.parse(localStorage.getItem('players'))

    if(players && players.length > 0){
        localStorage.setItem('players',JSON.stringify([
            ...players,
            {
                playerName:playerName,
                wpm:wpm
            }
        ]))
    }else{
        localStorage.setItem('players',JSON.stringify([
            {
                playerName:playerName,
                wpm:wpm
            }
        ]))
    }

    warning.classList.add('hide')
    popupContainer.classList.add('hide')
    goToLeaders()

}; confirmBtn.addEventListener('click',confirmPlayer)


const goToLeaders = () => {
    main.classList.add('hide')
    leaderboard.classList.remove('hide')
    tableContainer.innerHTML = ''

    let players = JSON.parse(localStorage.getItem("players"))

    if(players && players.length > 0){

        players = players.sort((a,b) => {
            if(a.wpm < b.wpm){
                return 1
            }
            if(a.wpm > b.wpm){
                return -1
            }
            return 0
        })
        players = players.slice(0,10)

        let table = document.createElement('table')
        let headerRow = document.createElement('tr')
        
        for(const element of tableHeaders){
            let headerCol = document.createElement('th')
            headerCol.innerHTML = element
            headerRow.appendChild(headerCol)
        }
        table.appendChild(headerRow)

        for(let i=0;i<players.length;i++){
            let playerRow = document.createElement('tr')
            let noCol = document.createElement('td')
            noCol.innerHTML = `${i+1}.`
            noCol.setAttribute('style','text-align:center')
            playerRow.appendChild(noCol)
            for(let property in players[i]){
                let playerCol = document.createElement('td')
                playerCol.innerHTML = players[i][property]
                if(property != 'playerName'){
                    playerCol.setAttribute('style','text-align:center')
                }
                playerRow.appendChild(playerCol)
            }
            table.appendChild(playerRow)
        }
        tableContainer.appendChild(table)

    }else{
        let pNode = document.createElement('p')
        pNode.innerHTML = "No players recorded. Be the first!"
        pNode.setAttribute('style','text-align:center')
        tableContainer.appendChild(pNode)
    }

}; leaderboardBtn.addEventListener('click',goToLeaders)


const backToMain = () => {
    main.classList.remove('hide')
    leaderboard.classList.add('hide')
}; backToMainBtn.addEventListener('click',backToMain)
