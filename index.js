import express from "express";
import axios from "axios";



const app = express();
const port = 3000;
app.use(express.static("public"));


let deck;
let getCards_API;
let dealerHand = [];
let playerHand = [];
let playerPoints;
let dealerPoints;
let playerStatus;
let whoWon;
let playerPlaying = true;
let handResult;
let myBank = 200;
const BET = 10;


const backCardImg = "https://deckofcardsapi.com/static/img/back.png";

//  Gets the deck of cards from deckofcards API

const API_URL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6";
cardSupplier()
async function cardSupplier() {
  try {
        const response = await axios.get(API_URL);
        const result = response.data;
        const deckNum = response.data.deck_id;
        // console.log(result)
        getCards_API = `https://deckofcardsapi.com/api/deck/${deckNum}/draw/?count=312`
          try {
            const response = await axios.get(getCards_API);
            deck = response.data;
            return deck
          } catch (error) {
        console.error("Failed to make request:", error.message);
      }
      } catch (error) {
      console.error("Failed to make request:", error.message);
    }
}


//  Functionality and Logic of the game

// Deals a card

function askCard() {
  let card = deck.cards.shift()
  return card
}
// Checks for the value of the hand and replaces the ACE's for ones depending on the hand.
// And replaces de values of face cards to ten and 11.
function checkForHand(hand) {
  // console.log(hand);
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
  while(pointHandValue.includes(11)){
    if (handValue > 21 ){
        let pos = pointHandValue.indexOf(11);
        pointHandValue[pos] = 1;
        handValue = pointHandValue.reduce((partialSum, item)=> partialSum + parseInt(item) , 0);
    }
    else { break 
    };
  };
  // console.log(handValue);
  return handValue;
  };

// Compares the two hands to decide the winner from the point of wiew of the player.

function checkWinner(dealer, player) {
  if (dealer > 21) {
    return ["YOU WIN !", "win" ];
  }
  else if (dealer > player) {
    return ["YOU LOST ! ", "lost"];
  }
  else if (dealer === player) {
    return ["PUSH is a tie", "push"];
  } 
  else {
    return ["YOU WIN !", "win"];
  }
};

function updateBet(handResult) {
  switch(handResult){
    case "win":
      return BET;
      break;
    case "lost":
      return BET*(-1);
      break;
    case "BlackJack":
      return BET*1.5
      break;
    default:
      return 0;
  }
}


// Welcome Screen and expalnation for the game.

app.get("/", (req, res) => {
  res.render("welcome.ejs")
});


app.get("/start", (req, res) => {
  if (deck.cards.length < 10 ){ 
  cardSupplier();
  console.log(deck.cards.length) };
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
    whoWon = "BlackJack !! YOU WIN !"
    handResult = "BlackJack";
    myBank += updateBet(handResult);
    playerPlaying = false;
  }
  else{
    playerStatus = "Thinking";
  }
  res.render("start.ejs", {
    dealerHand : dealerHand,
    playerHand : playerHand,
    pStatus : playerStatus,
    playerPoints : playerPoints,
    dealerPoints : dealerPoints,
    whoWon : whoWon,
    playerPlaying : playerPlaying,
    bank: myBank,
  })
});
  
app.get("/hit", (req, res) => {
  if (deck.cards.length < 10 ){ 
    cardSupplier();
    console.log(deck.cards.length) };
  playerHand.push(askCard());
  // console.log(playerHand)
  dealerPoints = checkForHand(dealerHand);
  playerPoints = checkForHand(playerHand);
  if (playerPoints > 21){
    playerStatus = "BUST";
    whoWon = "BUST YOU LOST !";
    playerPlaying = false;
    handResult = "lost"
    myBank = myBank += updateBet(handResult);
  } else {
    playerStatus = "In the game"
  };
  res.render("start.ejs", {
    dealerHand : dealerHand,
    playerHand : playerHand,
    pStatus : playerStatus,
    playerPoints: playerPoints,
    dealerPoints : dealerPoints,
    whoWon : whoWon,
    playerPlaying : playerPlaying,
    bank: myBank,

    
  })
});

app.get("/stand", ( req, res) => {
  // console.log(dealerHand); 
  dealerPoints = checkForHand(dealerHand);
  if (dealerPoints === 21) {
    whoWon = "YOU LOST ! Dealer has BlackJack"
    handResult = "lost"
    myBank += updateBet(handResult);
  }
  else {
    while (dealerPoints < 17) {
      dealerHand.push(askCard())
      dealerPoints = checkForHand(dealerHand);
    }
    let gameResult = checkWinner(dealerPoints, playerPoints);
    whoWon = gameResult[0];
    handResult = gameResult[1];
    myBank += updateBet(handResult);
  }
  res.render("start.ejs", {
    dealerHand : dealerHand,
    playerHand : playerHand,
    pStatus : playerStatus,
    playerPoints: playerPoints,
    dealerPoints: dealerPoints,
    whoWon : whoWon,
    playerPlaying : false,
    bank: myBank,
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
