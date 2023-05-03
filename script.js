"use strict";
const lettersDiv = document.getElementsByClassName("letters")[0];
const letters = lettersDiv.getElementsByTagName("p");
const [hangmanHead, hangmanBody, hangmanRightArm, hangmanLeftArm, hangmanRightLeg, hangmanLeftLeg,] = [
    document.getElementsByClassName("hangman-head")[0],
    document.getElementsByClassName("hangman-body")[0],
    document.getElementsByClassName("hangman-right-arm")[0],
    document.getElementsByClassName("hangman-left-arm")[0],
    document.getElementsByClassName("hangman-right-leg")[0],
    document.getElementsByClassName("hangman-left-leg")[0],
];
const resultScreen = document.getElementsByClassName("result-screen")[0];
const wordDiv = document.getElementsByClassName("word")[0];
let lostWord = document.getElementById("lost-word");
const totalWinsParagraph = resultScreen.getElementsByClassName("total-wins")[0]
    .firstElementChild;
const winstreakParagraph = resultScreen.getElementsByClassName("win-streak")[0]
    .children[1];
const restartButton = document.getElementById("restart");
let word = "";
let currentMisses = 0;
let totalWins = Number(localStorage.getItem("total-wins")) || 0;
let winstreak = Number(localStorage.getItem("winstreak")) || 0;
let graphWins = JSON.parse(localStorage.getItem("graphWins")) || [
    0, 0, 0, 0, 0, 0,
];
const ctx = document.getElementById("chart");
const createChart = () => {
    const data = {
        labels: ["Perfect", "1 miss", "2 miss", "3 miss", "4 miss", "5 miss"],
        datasets: [
            {
                label: "Wins",
                data: graphWins,
                backgroundColor: [
                    "blue",
                    "dodgerblue",
                    "green",
                    "yellow",
                    "orangered",
                    "red",
                ],
            },
        ],
    };
    const config = {
        type: "bar",
        data: data,
    };
    new Chart(ctx, config);
};
const standardStyles = () => {
    resultScreen.style.display = "grid";
    ctx.style.height = "150px";
    ctx.style.width = "300px";
    totalWinsParagraph.innerText = totalWins.toString();
    winstreakParagraph.innerText = winstreak.toString();
    localStorage.setItem("winstreak", winstreak.toString());
    localStorage.setItem("total-wins", totalWins.toString());
    localStorage.setItem("graphWins", JSON.stringify(graphWins));
    createChart();
    currentMisses = 0;
    Array.from(letters).forEach((letter) => {
        let new_element = letter.cloneNode(true);
        letter.parentNode.replaceChild(new_element, letter);
    });
};
const displayLoseScreen = () => {
    resultScreen.getElementsByTagName("h1")[0].innerText = "You lost";
    lostWord.style.display = "block";
    lostWord.innerHTML = `The word as <strong><em>${word}</em></strong>`;
    standardStyles();
};
const displayWinScreen = () => {
    resultScreen.getElementsByTagName("h1")[0].innerText = "You won!";
    lostWord.style.display = "none";
    switch (currentMisses) {
        case 0:
            graphWins[0]++;
            break;
        case 1:
            graphWins[1]++;
            break;
        case 2:
            graphWins[2]++;
            break;
        case 3:
            graphWins[3]++;
            break;
        case 4:
            graphWins[4]++;
            break;
        case 5:
            graphWins[5]++;
            break;
    }
    totalWins++;
    winstreak++;
    standardStyles();
};
const startGame = () => {
    let randomize = Math.floor(Math.random() * (6 - 3 + 1)) + 3;
    console.log(randomize);
    fetch(`https://random-word-api.herokuapp.com/word?length=${randomize}`)
        .then((response) => response.json())
        .then((data) => {
        word = data[0].toUpperCase();
        let wordSplit = word.split("");
        let lifes = 6;
        wordSplit.forEach(() => {
            const pElement = document.createElement("p");
            wordDiv.append(pElement);
        });
        const verifyWin = () => {
            let arrayCheck = [];
            for (let index in wordSplit) {
                arrayCheck.push(wordDiv.getElementsByTagName("p")[index].innerText || "");
            }
            if (arrayCheck.every((item) => item !== "")) {
                displayWinScreen();
            }
        };
        Array.from(letters).forEach((letter) => {
            letter.addEventListener("click", () => {
                if (letter.className == "not-chosen") {
                    let baseArray = [...wordSplit];
                    letter.className = "chosen";
                    wordSplit.forEach((split) => {
                        if (split == letter.innerHTML) {
                            let index = wordSplit.indexOf(split);
                            wordDiv.getElementsByTagName("p")[index].innerText = split;
                            wordSplit.splice(index, 1, "");
                        }
                    });
                    verifyWin();
                    if (baseArray.toString() == wordSplit.toString()) {
                        lifes--;
                        letter.style.backgroundColor = "red";
                    }
                    else {
                        letter.style.backgroundColor = "green";
                    }
                    switch (lifes) {
                        case 5:
                            hangmanHead.style.display = "block";
                            currentMisses = 1;
                            break;
                        case 4:
                            hangmanBody.style.display = "block";
                            currentMisses = 2;
                            break;
                        case 3:
                            hangmanRightArm.style.display = "block";
                            currentMisses = 3;
                            break;
                        case 2:
                            hangmanLeftArm.style.display = "block";
                            currentMisses = 4;
                            break;
                        case 1:
                            hangmanRightLeg.style.display = "block";
                            currentMisses = 5;
                            break;
                        case 0:
                            hangmanLeftLeg.style.display = "block";
                            winstreak = 0;
                            displayLoseScreen();
                            break;
                    }
                }
            });
        });
    })
        .catch((err) => console.error(err));
};
restartButton.addEventListener("click", () => {
    resultScreen.style.display = "none";
    hangmanHead.style.display = "none";
    hangmanBody.style.display = "none";
    hangmanRightArm.style.display = "none";
    hangmanLeftArm.style.display = "none";
    hangmanRightLeg.style.display = "none";
    hangmanLeftLeg.style.display = "none";
    wordDiv.textContent = "";
    Array.from(letters).forEach((letter) => {
        letter.style.backgroundColor = "darkgrey";
        letter.className = "not-chosen";
    });
    Chart.getChart("chart").destroy();
    startGame();
});
startGame();
