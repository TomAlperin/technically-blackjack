go();
scrollKB();
window.addEventListener('resize', go);
document.getElementById("aboutFront").addEventListener('scroll',scrollKB);
function scrollKB() {
    var kbPosition = document.getElementById("keyboard").offsetTop - document.getElementById("aboutFront").scrollTop;
    var aboutHeight = document.getElementById("aboutFront").offsetHeight;
    var kbHeight = document.getElementById("keyboard").offsetHeight;

    if (kbPosition > 0 - kbHeight && kbPosition < aboutHeight){
        document.getElementById("keyboard").style.backgroundPosition = ((kbPosition + kbHeight) / ((aboutHeight + kbHeight) / 100)).toString() + "% 0";
    }
    else {
        document.getElementById("keyboard").style.backgroundPosition = "100% 0";
    }
}
function go() {
    if (document.documentElement.clientHeight > 372) {
        if (document.documentElement.clientHeight < document.documentElement.clientWidth)
            document.getElementById("flip-toggle").style.width = ((document.documentElement.clientHeight * .24) - 12).toString() + "px";
        else
            document.getElementById("flip-toggle").style.width = ((document.documentElement.clientHeight * .19) - 45).toString() + "px";
    }
}

var sound = new Howl({
    urls: ["snd/blackjack.mp3"],
    sprite: {
        cardSound: [0, 800],
        clink: [1000, 800],
        win: [2000, 2800],
        lose: [5000, 2800],
        blackjack: [8500, 12000]
    }
});

//var ua = navigator.userAgent.toLowerCase();
////if ((ua.indexOf("safari") != -1) && (ua.indexOf("chrome") == -1) && (ua.indexOf("mobile") == -1))
//var safari = true;
//
//audioChannels = [];
//var whichChannel = 0;
//interval = [];
//
//if (safari) {
//    for (var a=0;a<10;a++) {									                                                        // Sounds for Safari
//        audioChannels[a] = [];
//        audioChannels[a]["channel"] = new Audio();
//        audioChannels[a]["finished"] = -1;
//    }
//} else {
//    for (var a=0;a<2;a++) {									                                                            // Sounds for other browsers
//        audioChannels[a] = [];
//        audioChannels[a]["channel"] = new Audio(document.getElementById("blackjack").src);
//        audioChannels[a]["channel"].load();
//    }
//}

function play_multi_sound(snd) {
    var s = ["cardSound","clink","win","lose","blackjack"];
    sound.play(s[snd]);
    //if (window.navigator.standalone) return;
    //if (safari) {
    //    var s = ["cardSound","clink","win","lose","blackjack"];
    //    for (a=0;a<audioChannels.length;a++) {
    //        var thisTime = new Date();
    //        if (audioChannels[a]["finished"] < thisTime.getTime()) {
    //            audioChannels[a]["finished"] = thisTime.getTime() + document.getElementById(s[sound]).duration*1000;
    //            audioChannels[a]["channel"].src = document.getElementById(s[sound]).src;
    //            audioChannels[a]["channel"].load();
    //            audioChannels[a]["channel"].play();
    //            break;
    //        }
    //    }
    //} else {
    //    clearInterval(interval[whichChannel]);
    //    audioChannels[whichChannel]["channel"].pause();
    //    audioChannels[whichChannel]["channel"].currentTime = snd * 4;
    //    audioChannels[whichChannel]["channel"].play();
    //    var t = audioChannels[whichChannel]["channel"].currentTime + 3;
    //    stopSound(whichChannel, t);
    //    whichChannel = (whichChannel == 1) ? 0 : 1;
    //}
}

//function stopSound(Channel, time) {
//    interval[Channel] = setInterval(function() {
//        if (audioChannels[Channel]["channel"].currentTime >= time) {
//            audioChannels[Channel]["channel"].pause();
//            clearInterval(interval[Channel]);
//        }    }, 10);
//}

var Deck = [];
var DealerHand = [];
var PlayerHand = [];
var PlayerHandSplit = [];
var bet = 0;
var hasLocal = canSaveGame();
var GameState = "bet";
var HaveSplitDouble = false;
var insured = false;
var Bank;
var aTimer;
var bSuit = [".8","25.6","50.4","75.2","99.9"];
var bVal = ["","0","8.4","16.7","25","33.3","41.6","49.9","58.2","66.5","74.8","83.1","91.4","99.7"];
if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) var dSign = "$";
else dSign = "💰";
document.getElementsByClassName("menuItem")[0].style.backgroundColor = "rgb(130, 132, 153)";
propAnimate();

loadGame(hasLocal);

function doBet(x) {                                                                                                     //bet
    document.getElementById("ThePlayer").className = "PlayerNoSplit";
    if (bet < 9) reset();
    play_multi_sound(1);
    if (Bank >= x) {
        Bank -= x;
        document.getElementById("Bank").textContent = dSign + Bank;
        bet += x;
        document.getElementById("PBet").textContent = bet.toString();
        setGameState("betOrDeal", 1);
    }
    saveGame(hasLocal);
}

function dealCards() {                                                                                                  //bet or deal
    getCard(DealerHand, "DealerCard", 0);
    getCard(DealerHand, "DealerCard", 400);
    getCard(PlayerHand, "PlayerCard", 800);
    getCard(PlayerHand, "PlayerCard", 1200);
    setTimeout(function(){document.getElementById("ThePlayer").className = "PlayerNoSplit Up"}, 600);
    setGameState("hit", 1);
    if (Math.floor(PlayerHand[0] / 4) == Math.floor(PlayerHand[1] / 4) && Bank >= bet) setGameState("split", 1);
    if (Math.floor(DealerHand[0] / 4) == 1 && Bank >= bet/2) document.getElementById("insurance").className = "insure";
}

function insure() {
    if (!insured) {
        play_multi_sound(1);
        document.getElementById("insurance").className = "insured";
        Bank -= (bet/2);
        document.getElementById("Bank").textContent = dSign + Bank;
        insured = true;
        localStorage["blackjackInsured"] = "true";
        saveGame(hasLocal);
    }
}

function hit() {                                                                                                        //hit, stand, split, or double first run
    if (!insured) document.getElementById("insurance").className = "hide";
    getCard(PlayerHand, "PlayerCard", 0);
    if (PlayerHand.length > 2) {
        document.getElementById("Controls").innerHTML = document.getElementById("Controls").innerHTML.replace("Double", "");                                                      //then only hit or stand
        document.getElementById("Controls").innerHTML = document.getElementById("Controls").innerHTML.replace("double()", "");
    }
    var playerTot = checkTotal(PlayerHand);
    if (playerTot > 21 || PlayerHand.length == 7) {
        doDealer(400, 800);
        return;
    }
    setGameState("hit", 1);
    saveGame(hasLocal);
}

function stand() {
    if (!insured) document.getElementById("insurance").className = "hide";
    document.getElementById("pt").style.color = "white";
    doDealer(400, 800);
}

function double() {
    if (!insured) document.getElementById("insurance").className = "hide";
    play_multi_sound(1);
    getCard(PlayerHand, "PlayerCard", 300);
    Bank -= bet;
    document.getElementById("Bank").textContent = dSign + Bank;
    document.getElementById("PBet").textContent = (document.getElementById("PBet").textContent * 2).toString();
    doDealer(800, 1200);
}

function surrender() {
    var suit = DealerHand[1] % 4;
    var value = Math.floor(DealerHand[1] / 4);
    var dealerTot = checkTotal(DealerHand);
    setTimeout(function(){
        play_multi_sound(0);
        document.getElementById("DealerCardF").style.backgroundPosition = bVal[value]+ "% " + bSuit[suit] + "%";
        document.getElementById("DealerCardF").className = "card back";
        document.querySelector("#flip-toggle").classList.toggle("flip");
    }, 800);
    if (DealerHand.length == 2 && dealerTot == 21) {
        var snd = 3;
        var msg = "Surrender Denied";
    } else {
        snd = 1;
        Bank += bet/2;
        msg = "Surrendered";
    }
    setTimeout(function() {
        endHand(snd,msg,"PlayerScore");
    }, 400);
    setGameState("bet", 1);
}

function doDealer(t, st) {
    var suit = DealerHand[1] % 4;
    var value = Math.floor(DealerHand[1] / 4);
    var dealerTot = checkTotal(DealerHand);
    var playerTot = checkTotal(PlayerHand);
    var splitTot = checkTotal(PlayerHandSplit);
    if (((splitTot != 0 && splitTot < 22) && (PlayerHandSplit.length != 7)) || ((playerTot < 22) && (PlayerHand.length != 7))) {
        if (((!(splitTot == 21 && PlayerHandSplit.length == 2)) && PlayerHandSplit.length != 0) || (!(playerTot == 21 && PlayerHand.length == 2))) {
            while (dealerTot < 17 && DealerHand.length < 7) {
                getCard(DealerHand, "DealerCard", st);
                dealerTot = checkTotal(DealerHand);
                st += 400;
            }
        }
    }
    setTimeout(function(){
        play_multi_sound(0);
        document.getElementById("DealerCardF").style.backgroundPosition = bVal[value]+ "% " + bSuit[suit] + "%";
        document.getElementById("DealerCardF").className = "card back";
        document.querySelector("#flip-toggle").classList.toggle("flip");
    }, t);
    if (t == 800) {
        bet *= 2;
        checkWinning(PlayerHand.length, playerTot, dealerTot, "PlayerScore");
        bet /= 2;
    } else checkWinning(PlayerHand.length, playerTot, dealerTot, "PlayerScore");
    if (insured && DealerHand.length == 2 && checkTotal(DealerHand) == 21) {
        Bank += bet * 1.5;
    }
    if (splitTot != 0 && splitTot < 22) {
        if (HaveSplitDouble) bet *= 2;
        checkWinning(PlayerHandSplit.length, splitTot, dealerTot, "SplitScore");
        HaveSplitDouble = false;
        localStorage["blackjackSplitDouble"] = HaveSplitDouble;
    }
    setGameState("bet", 1);
}

function splitCards() {
    if (!insured) document.getElementById("insurance").className = "hide";
    play_multi_sound(0);
    Bank -= bet;
    document.getElementById("Bank").textContent = dSign + Bank;
    PlayerHandSplit.push(PlayerHand.pop());
    var rand = (Math.random() * 10) - 5;
    var div = document.getElementById("PlayerCardSplit0").style;                                                        //Rotate cards to random positions
    div.webkitTransform = "rotate(" + rand.toString() + "deg)";
    div.mozTransform    = "rotate(" + rand.toString() + "deg)";
    div.msTransform     = "rotate(" + rand.toString() + "deg)";
    div.oTransform      = "rotate(" + rand.toString() + "deg)";
    div.transform       = "rotate(" + rand.toString() + "deg)";
    document.getElementById("SBet").textContent = document.getElementById("PBet").textContent.toString();
    var suit = PlayerHandSplit[0] % 4;
    var value = Math.floor(PlayerHandSplit[0] / 4);
    document.getElementById("PlayerCard1").className = "";
    document.getElementById("PlayerCardSplit0").style.backgroundPosition = bVal[value]+ "% " + bSuit[suit] + "%";
    document.getElementById("PlayerCardSplit0").className = "card";
    getCard(PlayerHand, "PlayerCard", 400);
    getCard(PlayerHandSplit, "PlayerCardSplit", 800);
    setGameState("splitHit", 1);
}

function doubleSplit() {
    HaveSplitDouble = true;
    localStorage["blackjackSplitDouble"] = HaveSplitDouble;
    document.getElementById("SBet").textContent = (document.getElementById("SBet").textContent * 2).toString();
    var dealerTot = checkTotal(DealerHand);
    play_multi_sound(1);
    Bank -= bet;
    document.getElementById("Bank").textContent = dSign + Bank;
    getCard(PlayerHandSplit, "PlayerCardSplit", 0);
    var splitTot = checkTotal(PlayerHandSplit);
    if (splitTot > 21) {
        bet *= 2;
        checkWinning(PlayerHand.length, splitTot, dealerTot, "SplitScore");
        bet /= 2;
    }
    setGameState("hit", 1);
}

function splitHit() {
    getCard(PlayerHandSplit, "PlayerCardSplit", 0);
    if (PlayerHandSplit.length > 2) {
        document.getElementById("Controls").innerHTML = document.getElementById("Controls").innerHTML.replace("Split Double", "");                                                      //then only hit or stand
        document.getElementById("Controls").innerHTML = document.getElementById("Controls").innerHTML.replace("doubleSplit()", "");
    }
    var splitTot = checkTotal(PlayerHandSplit);
    if (splitTot > 21 || PlayerHandSplit.length == 7) {
        checkWinning(PlayerHandSplit.length, splitTot, checkTotal(DealerHand), "SplitScore");
        setGameState("hit", 1);
        return;
    }
    saveGame(hasLocal);
}

function splitStand() {
    setGameState("hit");
    play_multi_sound(0);
}

function shuffleCards() {
    setTimeout(function(){
        document.getElementById("msg").innerHTML = "<p>Shuffled Cards...</p>";
        document.getElementById("msg").className = "showMsg"
    }, DealerHand.length * 300 + 600);
    setTimeout(function(){
        document.getElementById("msg").className = "hideMsg"
    }, DealerHand.length * 300 + 3000);
    var cards = [];
    for (var y = 0; y < 2; y++) {                                                                                       //For "y" decks
        for(var i = 4; i <= 55; i++) {                                                                                  //Load 52 cards in deck
            cards.push(i);
        }
    }
    for( var j, x, z = cards.length; z; j = Math.floor(Math.random() * z),                                              //Shuffle cards in deck
        x = cards[--z], cards[z] = cards[j], cards[j] = x);

    var SaveDeck = "";
    for (i = 0; i < cards.length; i++) {
        if (cards[i] < 10) SaveDeck = SaveDeck + "0";
        SaveDeck += cards[i].toString();
    }
    localStorage["Deck"] = atob(SaveDeck);
    localStorage["DeckLength"] = Deck.length;
    return cards;
}

function getCard(hand, whichHand, t) {
    var hits = hand.length;
    if (Deck.length == 0) Deck = shuffleCards();
    var card = Deck.pop();
    var suit = card % 4;
    var value = Math.floor(card / 4);
    hand.push(card);
    var rand = (Math.random() * 10) - 5;
    if (hand.length == 2 && whichHand == "DealerCard") {                                                                //Display cards
        var div = document.getElementById("flip-toggle").style;                                                         //Rotate cards to random positions
        setTimeout(function(){
            play_multi_sound(0);
            document.getElementById((whichHand + hits)).style.backgroundPosition = bVal[1] + "% " + bSuit[4] + "%";
            document.getElementById(("DealerCard1")).className = "card front";                                          //Second dealer card face down
        },t);
    } else {
        div = document.getElementById(whichHand + hits).style;
        setTimeout(function(){
            play_multi_sound(0);
            document.getElementById((whichHand + hits)).style.backgroundPosition = bVal[value] + "% " + bSuit[suit] + "%";
            document.getElementById((whichHand + hits)).className = "card";                                             //All other cards face up
        },t);
    }
    div.webkitTransform = "rotate(" + rand.toString() + "deg)";                                                         //Rotate cards to random positions
    div.mozTransform    = "rotate(" + rand.toString() + "deg)";
    div.msTransform     = "rotate(" + rand.toString() + "deg)";
    div.oTransform      = "rotate(" + rand.toString() + "deg)";
    div.transform       = "rotate(" + rand.toString() + "deg)";
}

function checkTotal(hand) {                                                                                             //Check the value of a hand
    var total = 0;
    for (var i = 0; i < hand.length; i++) {
        if (Math.floor(hand[i] / 4) > 10) {                                                                             //Cards over 10 worth 10
            total += 10;
        }
        else if (Math.floor(hand[i] / 4) == 1) {                                                                        //Aces are worth 11
            total += 11;
        } else {
            total += Math.floor(hand[i] / 4);
        }
    }
    i = 0;
    while (total > 21 && i < hand.length) {                                                                             //Subtract 10 for every ace
        if (Math.floor(hand[i] / 4) == 1) {                                                                             //just until under 22
            total -= 10;
        }
        i++
    }
    return total;
}

function checkWinning(length, playerTot, dealerTot, split) {                                                            //Check to see who won
    var odds = 1;
    if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
        var win = "(•‿•) ";
        var lose = "(◕︵◕) ";
        var black = "(ó‿ó) ";
        var dBlack ="X_X ";
    } else {
        win    = "😊 ";
        lose   = "😢 ";
        black  = "😀 ";
        dBlack = "💀 ";
    }
    if ((length == 7) && (playerTot < 22)) {                                                                             //Win on 7 cards
        var result = 2;
        message = win + "Win with 7 cards!";
        Bank += bet * 2;
    }
    else if (playerTot > 21) {                                                                                          //Busted
        result = 3;
        message = lose + "Busted with " + playerTot;
    }
    else if (length == 2 && playerTot == 21) {
        if (DealerHand.length == 2 && dealerTot == 21) {
            if (PlayerHandSplit.length == 0) {                                                                          //Blackjack tie
                Bank += bet;
                result = 1;
                var message = "Push on Blackjack.";
            } else {                                                                                                    //Dealer blackjack
                result = 3;
                message = dBlack + "Dealer Blackjack.";
            }
        } else {
            if (PlayerHandSplit.length == 0) {                                                                          //Player wins with blackjack
                Bank += bet * 2.5;
                result = 2;
                message = black + "BLACKJACK!";
                odds = 1.5;
                blackjack();
            } else {                                                                                                    //Player wins with 21 but not blackjack
                Bank += bet * 2;
                result = 2;
                message = win + "WIN! with 21";
            }
        }
    }
    else if (DealerHand.length == 2 && dealerTot == 21) {                                                               //Dealer wins with blackjack
            result = 3;
            message = dBlack + "Dealer Blackjack.";
    }
    else if (dealerTot > 21) {                                                                                          //Dealer busts
        Bank += bet * 2;
            result = 2;
            message = win + "Dealer Busts. WIN!";
    }
    else if (playerTot > dealerTot) {                                                                                   //Player wins
        Bank += bet * 2;
            result = 2;
            message = win + "WIN! " + playerTot +" to "+ dealerTot;
    }
    else if (playerTot == dealerTot) {                                                                                  //It's a tie
        Bank += bet;
            result = 1;
            message = "Push " + playerTot +" to "+ dealerTot;
    }
    else {                                                                                                              //Dealer wins
            result = 3;
            message = lose + "Lose " + playerTot +" to "+ dealerTot;
    }
    endHand(result, message, split);
    setStats(result, (bet * odds));
    saveGame(hasLocal);
}

function endHand(snd, msg, hand) {
    setTimeout(function(){
        play_multi_sound(snd);
        document.getElementById(hand).textContent = msg;
        document.getElementById("Bank").textContent = dSign + Bank;
    },DealerHand.length * 400);
}

function reset() {
    DealerHand = [];
    PlayerHand = [];
    PlayerHandSplit = [];
    insured = false;
    document.getElementById("insurance").className = "hide";
    localStorage["blackjackInsured"] = "false";
    document.querySelector("#DealerCardF").classList.add("hide");
    document.querySelector("#flip-toggle").classList.remove("flip");

    for (var i=0; i < 8; i++) {
        document.getElementById("PlayerCard"+i).className = "hide";
        document.getElementById("PlayerCardSplit"+i).className = "hide";
        document.getElementById("DealerCard"+i).className = "hide";
    }
    document.getElementById("PlayerSplit").className = "hide";
    document.getElementById("PlayerScore").textContent = "";
    document.getElementById("SplitScore").textContent = "";
}

function canSaveGame() {
    try {
        return "localStorage" in window && window["localStorage"] !== null;
    } catch (e) {
        return false;
    }
}

function saveGame(canSave) {
    if (canSave) {
        localStorage["blackjackGameState"] = GameState;
        localStorage.blackjackBank = Bank;
        localStorage.blackjackBet = bet;
        localStorage["DeckLength"] = Deck.length;
        setCards(DealerHand, "DealerCard");
        setCards(PlayerHand, "PlayerCard");
        setCards(PlayerHandSplit, "PlayerCardSplit");
    }
}

function setCards(hand, whichHand) {
    for (var i = localStorage[whichHand + "Length"]; i < hand.length; i++) {
        localStorage[whichHand + i] = hand[i];
    }
    localStorage[whichHand + "Length"] = hand.length;
}

function loadGame(canSave) {
    if (canSave) {
        document.getElementById("Bank").textContent = dSign + localStorage.blackjackBank;
        Bank = parseInt(localStorage.blackjackBank);
        bet = parseInt(localStorage.blackjackBet);
        setStats(0);
        if (Bank + bet < 10 || isNaN(Bank)) {
            Bank = 1000;
            bet = 0;
            document.getElementById("Bank").textContent = dSign + "1000"
        }
        if (isNaN(parseInt(btoa(localStorage["Deck"])))) {
            Deck = shuffleCards();
        } else {
            for (var i = 0; i < parseInt(localStorage["DeckLength"]); i++) {
                Deck.push(parseInt(btoa(localStorage["Deck"]).substr(i * 2,2)));
            }
        }
        if (typeof(localStorage["blackjackGameState"]) != "undefined") {
            GameState = localStorage["blackjackGameState"];
            HaveSplitDouble = (localStorage["blackjackSplitDouble"] === "true");
            insured = (localStorage["blackjackInsured"] === "true");
            if (bet != 0) document.getElementById("PBet").textContent = bet.toString();
            getCards(DealerHand, "DealerCard");
            getCards(PlayerHand, "PlayerCard");
            getCards(PlayerHandSplit, "PlayerCardSplit");
            setGameState(GameState, 0);
            if (insured) document.getElementById("insurance").className = "insured";
            else if ((Math.floor(DealerHand[0] / 4) == 1) && (PlayerHand.length < 3) && (GameState != "bet")) document.getElementById("insurance").className = "insure";
            if (PlayerHandSplit.length != 0) {
                if (GameState != "bet") document.getElementById("ThePlayer").className = "PlayerHasSplit Up";
                else document.getElementById("ThePlayer").className = "PlayerHasSplit";
                document.getElementById("PlayerSplit").className = "PlayerHasSplit";
                if (GameState == "splitHit"){
                    document.getElementById("ThePlayer").className = "PlayerHasSplit";
                    document.getElementById("PlayerSplit").className = "PlayerHasSplit Up";
                    document.getElementById("SBet").textContent = bet.toString();
                    document.getElementById("st").style.color = "#f2ea09";
                    document.getElementById("pt").style.color = "white";
                }
            }
        } else {
            setGameState("bet", 0);
        }
    } else {
        Bank = 1000;
        setGameState("bet", 0);
        document.getElementById("Bank").textContent = dSign + "1000";
    }
}

function getCards(hand, whichHand) {
    for (var i = 0; i < parseInt(localStorage[whichHand + "Length"]); i++) {
        hand.push(parseInt(localStorage[whichHand + i]));
        var rand = (Math.random() * 10) - 5;
        var suit = hand[i] % 4;
        var value = Math.floor(hand[i] / 4);
        if (hand.length == 2 && whichHand == "DealerCard") {
            var div = document.getElementById("flip-toggle").style;
            if (GameState != "bet") {
                document.getElementById((whichHand + i)).style.backgroundPosition = bVal[1] + "% " + bSuit[4] + "%";
                document.getElementById((whichHand + i)).className = "card front";
            } else{
                document.getElementById((whichHand + i)).style.backgroundPosition = bVal[value] + "% " + bSuit[suit] + "%";
                document.getElementById((whichHand + i)).className = "card front";
            }
        } else {
            div = document.getElementById(whichHand + i).style;
            document.getElementById((whichHand + i)).style.backgroundPosition = bVal[value] + "% " + bSuit[suit] + "%";
            document.getElementById((whichHand + i)).className = "card";
        }
        div.webkitTransform = "rotate(" + rand.toString() + "deg)";
        div.mozTransform    = "rotate(" + rand.toString() + "deg)";
        div.msTransform     = "rotate(" + rand.toString() + "deg)";
        div.oTransform      = "rotate(" + rand.toString() + "deg)";
        div.transform       = "rotate(" + rand.toString() + "deg)";
    }
}

function setGameState(state, i) {                                                                                       //Sets the game state during and
    switch (state){                                                                                                     //while loading the game
        case "bet":
            GameState = "bet";
            document.getElementById("Controls").innerHTML = "<button></button><button></button><button></button><button></button><button></button>";
            setTimeout(function(){
                document.getElementById("Controls").innerHTML = "<button onclick='doBet(10)' class='chip10'></button><button onclick='doBet(50)' class='chip50'></button><button onclick='doBet(100)' class='chip100'></button>" +
                                                                "<button onclick='doBet(500)' class='chip500'><button onclick='showAbout()' class='aButton'></button>";
                document.getElementById("pt").style.color = "white";
            }, DealerHand.length * 600 * i);
            document.getElementById("ThePlayer").className = document.getElementById("ThePlayer").className.replace(" Up","");
            bet = 0;
            if (Bank + bet < 10) {
                Bank = 1000;                                                                                            //Game over. Reset bank to $1000
                document.getElementById("Bank").textContent = dSign + "1000";
                setStats(4);
                setTimeout(function(){
                    document.getElementById("msg").innerHTML = "<p><strong>Game Over!</strong><br>Starting New Game.</p>";
                    document.getElementById("msg").className = "showMsg";
                }, (DealerHand.length * 300 + 2000) * i);
                setTimeout(function(){
                    document.getElementById("msg").className = "hideMsg";
                }, (DealerHand.length * 300 + 8000) * i);
            }
            if (Deck.length < 26) Deck = shuffleCards();
            break;
        case "betOrDeal":
            GameState = "betOrDeal";
            document.getElementById("Controls").innerHTML = "<button onclick='doBet(10)' class='chip10'></button><button onclick='doBet(50)' class='chip50'></button><button onclick='doBet(100)' class='chip100'></button>" +
                                                            "<button onclick='doBet(500)' class='chip500'></button><button onclick='dealCards()'>Deal</button>";
            document.getElementById("ThePlayer").className = "PlayerNoSplit";
            break;
        case "hit":
            var t = (GameState == "betOrDeal") ? 1600 : 0;
            GameState = "hit";
            document.getElementById("Controls").innerHTML = "<button></button><button></button><button></button><button></button><button></button>";
            setTimeout(function(){
                document.getElementById("st").style.color = "white";
                document.getElementById("pt").style.color = "#f2ea09";
                var inner = "<button onclick='hit()'>Hit</button>" +
                            "<button onclick='stand()'>Stand</button>";
                if (PlayerHand.length < 3) {
                    if (Bank >= bet) {
                        inner +=    "<button onclick='double()'>Double</button>";
                    } else {
                        inner +=    "<button></button>";
                    }
                    if ((PlayerHandSplit.length == 0) && (Bank >= bet/2)) inner +=    "<button></button><button onclick='surrender()' class='surrender'>Surrender</button>";
                    else inner +=    "<button></button><button></button>";
                } else {
                    inner +=    "<button></button><button></button><button></button>";
                }
                document.getElementById("Controls").innerHTML = inner;
                if (PlayerHandSplit.length == 0) {
                        document.getElementById("ThePlayer").className = "PlayerNoSplit Up";
                        document.getElementById("PlayerSplit").className = "hide";
                    } else {
                        document.getElementById("ThePlayer").className = "PlayerHasSplit Up";
                        document.getElementById("PlayerSplit").className = "PlayerHasSplit";
                    }
            }, t * i);
            break;
        case "split":
            GameState = "split";
            document.getElementById("ThePlayer").className = "PlayerNoSplit Up";
            document.getElementById("pt").style.color = "#f2ea09";
            setTimeout(function(){
                var inner = "<button onclick='hit()'>Hit</button><button onclick='stand()'>Stand</button><button onclick='splitCards()'>Split</button>";
                if (PlayerHand.length < 3) {
                    if (Bank >= bet) {
                        inner += "<button id='Double' onclick='double()'>Double</button>";
                    } else {
                        inner +="<button></button>";
                    }
                    inner +=    "<button onclick='surrender()' class='surrender'>Surrender</button>";
                } else {
                    inner +="<button></button>";
                }
                document.getElementById("Controls").innerHTML = inner;
            }, 1600 * i);
            break;
        case "splitHit":
            GameState = "splitHit";
            document.getElementById("Controls").innerHTML = "<button></button><button></button><button></button><button></button>";
            document.getElementById("ThePlayer").className = "PlayerHasSplit";
            document.getElementById("PlayerSplit").className = "PlayerHasSplit Up";
            document.getElementById("st").style.color = "#f2ea09";
            document.getElementById("pt").style.color = "white";
            setTimeout(function(){
                var inner = "<button onclick='splitHit()'>Split<br>Hit</button><button onclick='splitStand()'>Split Stand</button>";
                if ((PlayerHandSplit.length < 3) && (Bank >= bet)) {
                    inner += "<button onclick='doubleSplit()'>Split Double</button><button></button><button></button>";
                } else {
                    inner +="<button></button><button></button><button></button>";
                }
                document.getElementById("Controls").innerHTML = inner;
            }, 1200 * i);
            break;
    }
    saveGame(hasLocal);
}
function hideAbout() {
    //audioChannels[0]["channel"].play();
    //audioChannels[0]["channel"].pause();
    //audioChannels[1]["channel"].play();
    //audioChannels[1]["channel"].pause();
    document.getElementById("game").className = "";
    document.querySelector("#About").classList.add("hideAbout");
    document.querySelector("#About").classList.remove("showAbout");
    setTimeout(function() {
            clearInterval(aTimer);
    }, 1000)
}

function showAbout() {
    document.querySelector("#About").classList.add("showAbout");
    document.querySelector("#About").classList.remove("hideAbout");
    propAnimate();
    setTimeout(function() {
            document.getElementById("game").className = "hide";
    }, 1000);
}

function work() {
    if (document.getElementById("flip-it").className.indexOf("flip") != -1) {
        var i = 250;
        var timer = setInterval(function() {
            document.getElementById('About').style.backgroundColor = 'rgb('+i+','+i+','+i+')';
            document.getElementById('title').style.color = 'rgb('+i+','+i+','+i+')';
            if(i <= 50){
                var menuItem = document.getElementsByClassName('menuItem');
                menuItem[0].style.backgroundColor = 'rgb(130, 132, 153)';
                menuItem[1].style.backgroundColor = '';
                clearInterval(timer);
            }
            i = i - 20;
        }, 20);
    }
    document.querySelector("#flip-it").classList.remove("flip");

}

function play() {
    if (document.getElementById("flip-it").className.indexOf("flip") == -1) {
        var i = 50;
        var timer = setInterval(function() {
            var c = i.toString();
            document.getElementById('About').style.backgroundColor = "rgb("+c+","+c+","+c+")";
            document.getElementById('title').style.color = "rgb("+i+","+i+","+i+")";
            if(i >= 250){
                var menuItem = document.getElementsByClassName('menuItem');
                menuItem[0].style.backgroundColor = '';
                menuItem[1].style.backgroundColor = 'rgb(130, 132, 153)';
                clearInterval(timer);
            }
            i = i + 20;
        }, 20);
    }
    document.querySelector("#flip-it").classList.add("flip");
}

function propAnimate() {
    var i=0;
    var j=0;
    aTimer = setInterval(function() {
        i++;
        j = j - .03;
        document.getElementById("art").style.backgroundPosition = j + "vw";
        if (j <= -100) j = .06;
        switch (i) {
            case 1: document.getElementById("hProp").className = "prop1";
                break;
            case 2: document.getElementById("hProp").className = "prop2";
                break;
            case 3: document.getElementById("hProp").className = "prop1";
                break;
            default:
                document.getElementById("hProp").className = "prop";
                i = 0;
                break;
        }
    }, 10);
}

function blackjack() {
    var i = 0;
    setTimeout(function(){
        play_multi_sound(4);
        document.getElementById("blackjack").className = "GBZoom";
        var timer = setInterval(function() {
            i++;
            switch (i) {
                case 1: document.getElementById("prop").className = "prop1";
                    break;
                case 2: document.getElementById("prop").className = "prop2";
                    break;
                case 3: document.getElementById("prop").className = "prop1";
                    break;
                default:
                    document.getElementById("prop").className = "prop";
                    i = 0;
                    break;
            }
        }, 10);
        setTimeout(function(){
            document.getElementById("blackjack").className = "";
            clearInterval(timer);
        },6000);
    },2000);
}

function setStats(state, amt){
    if (hasLocal) {
        if (localStorage["blackjackStats"] != undefined) {
            stats = JSON.parse(atob(localStorage["blackjackStats"]));
        } else {
            var stats = {
                highScore: 0,
                gamesPlayed: 0,
                bestHandCount: 0,
                curHandCount: 0,
                wins: 0,
                totalWon: 0,
                maxWins: 0,
                lose: 0,
                totalLost: 0,
                maxLose: 0
            };
        }
        if (Bank > stats.highScore) stats.highScore = Bank;
        if (stats.totalLost < 0) stats.totalLost = stats.totalLost * -1;
            switch (state) {
            case 1:
                stats.curHandCount++;
                stats.wins = 0;
                stats.lose = 0;
                break;
            case 2:
                stats.curHandCount++;
                stats.wins++;
                stats.totalWon = stats.totalWon + amt;
                stats.lose = 0;
                break;
            case 3:
                stats.curHandCount++;
                stats.wins = 0;
                stats.lose++;
                stats.totalLost = stats.totalLost + amt;
                break;
            case 4:
                stats.curHandCount = 0;
                stats.gamesPlayed++;
                break;
            default:
                break;
        }
        if (stats.curHandCount > stats.bestHandCount) stats.bestHandCount = stats.curHandCount;
        if (stats.wins > stats.maxWins) stats.maxWins = stats.wins;
        if (stats.lose > stats.maxLose) stats.maxLose = stats.lose;
        document.getElementById("curHands").textContent = stats.curHandCount.toString();
        document.getElementById("highScore").textContent = "$" + stats.highScore.toString();
        document.getElementById("gamesPlayed").textContent = stats.gamesPlayed.toString();
        document.getElementById("maxHands").textContent = stats.bestHandCount.toString();
        document.getElementById("wins").textContent = stats.wins.toString();
        document.getElementById("maxWins").textContent = stats.maxWins.toString();
        document.getElementById("lose").textContent = stats.lose.toString();
        document.getElementById("maxLose").textContent = stats.maxLose.toString();
        document.getElementById("allWon").textContent = "$" + stats.totalWon.toString();
        document.getElementById("allLost").textContent = "$" + stats.totalLost.toString();
        localStorage["blackjackStats"] = btoa(JSON.stringify(stats));
    }
}
function resetStats() {
    var reset = confirm("Are you sure you want to reset all game stats?");
    if (reset) {
        localStorage.removeItem("blackjackStats");
        setStats(0);
    }
}
function showStats() {
    if (hasLocal) document.getElementById("stats").className = "showAbout"
}

function hideStats() {
    document.getElementById("stats").className = "hideAbout"
}