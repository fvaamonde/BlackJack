import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
let deck;
let getCards_API;
let dealerHand = [];
let playerHand = [];
let playerPoints;
let dealerPoints;
let playerStatus;
let whoWon;
let playerPlaying = true;


const backCardImg = "https://deckofcardsapi.com/static/img/back.png";

//  Gets the deck of cards from deckofcards API

const API_URL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6";

try {
    const response = await axios.get(API_URL);
    const result = response.data;
    const deckNum = response.data.deck_id;
    // console.log(result)
    getCards_API = `https://deckofcardsapi.com/api/deck/${deckNum}/draw/?count=312`
      try {
        const response = await axios.get(getCards_API);
        deck = response.data;
      } catch (error) {
    console.error("Failed to make request:", error.message);
  }
  } catch (error) {
  console.error("Failed to make request:", error.message);
}



//  Functionality and Logic of the game

function askCard() {
  let card = deck.cards.shift()
  return card
}

function checkForHand(hand) {
  console.log(hand);
  let rawValueHand = hand.map( item => item.value);
  let pointHandValue = rawValueHand.map(item => {
    if(item === "KING" || item === "QUEEN" || item === "JACK") {
      return 10;
    }
    else if ( item === "ACE") {
      return 11;
    } else {
      return item ;
    }
    });
  let handValue = pointHandValue.reduce((partialSum, item)=> partialSum + parseInt(item) , 0);
  if (handValue > 21 && pointHandValue.includes(11)){
    handValue -= 10;
  }
  return handValue;
  }

function checkWinner(dealer, player) {
  if (dealer > 21) {
    return "WIN";
  }
  else if (dealer > player) {
    return "LOST";
  }
  else if (dealer === player) {
    return "PUSH";
  } 
  else {
    return "WIN";
  }
};



app.get("/", (req, res) => {
  res.render("welcome.ejs")
});


app.get("/start", (req, res) => {
  dealerHand.push(askCard());
  playerHand.push(askCard());
  dealerHand.push(askCard());
  playerHand.push(askCard());
  // console.log(playerHand)
  playerPoints = checkForHand(playerHand);
  dealerPoints = checkForHand(dealerHand);
  // console.log(playerPoints)
  if(playerPoints === 21){
    playerStatus = "Your Lucky !!";
    whoWon = "Black Jack !! You Won !"
  }
  else{
    playerStatus = "Thinking";
  }
  res.render("start.ejs", {
    dealerHand : dealerHand,
    playerHand : playerHand,
    pStatus : playerStatus,
    playerPoints : playerPoints,
    whoWon : whoWon,
    playerPlaying : playerPlaying,
  })
});
  
app.get("/hit", (req, res) => {
  playerHand.push(askCard());
  // console.log(playerHand)
  playerPoints = checkForHand(playerHand);
  if (playerPoints > 21){
    playerStatus = "BUST";
    whoWon = "LOST";

  } else {
    playerStatus = "In the game"
  };
  res.render("start.ejs", {
    dealerHand : dealerHand,
    playerHand : playerHand,
    pStatus : playerStatus,
    playerPoints: playerPoints,
    whoWon : whoWon,
    playerPlaying : playerPlaying,

    
  })
});

app.get("/stand", ( req, res) => {
  console.log(dealerHand); 
  dealerPoints = checkForHand(dealerHand);
  if (dealerPoints === 21) {
    whoWon = "LOST Dealer got Black Jack"
  }
  else {
    while (dealerPoints < 17) {
      dealerHand.push(askCard())
      dealerPoints = checkForHand(dealerHand);
    }
    whoWon = checkWinner(dealerPoints, playerPoints);
  }
  res.render("start.ejs", {
    dealerHand : dealerHand,
    playerHand : playerHand,
    pStatus : playerStatus,
    playerPoints: playerPoints,
    dealerPoints: dealerPoints,
    whoWon : whoWon,
    playerPlaying : false
  })
});

app.get("/deal", (req, res) => {
  dealerHand =[];
  playerHand = [] ;
  playerStatus = "" ;
  playerPoints = 0 ;
  dealerPoints = 0 ;
  whoWon = "" ;
  playerPlaying = true;
  res.redirect("/start");

});


 


  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
