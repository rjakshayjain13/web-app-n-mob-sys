// Global variable arrays initializing the data (cards)
var suspects = ['Mrs. Peacock', 'Mrs. Green', 'Miss Scarlet', 'Colonel Mustard', 'Professor Plum'];
var weapons = ['Pistol', 'Knife', 'Wrench', 'Lead Pipe', 'Candlestick'];
var rooms = ['Kitchen', 'Study', 'Living Room', 'Dining Room', 'Library'];

// Array having all the cards
var gArray = suspects.concat(weapons);
var gArray = gArray.concat(rooms);

// Arrays containg secret cards, player cards and computer cards 
var secretArray = new Array();
var playerArray = new Array();
var computerArray = new Array();

// Arrays having all the cards except player cards
var roomArray = [];
var suspectArray = [];
var weaponArray = [];

var count = 1;
var record;

// Displaying the full set of suspects, rooms, and weapons at the top of an HTML page for the user to see
function display() {
    //document.getElementById("guessform").style.visibility = "hidden"; // I put this to hide the cards input form and guess button hidden initially
                                                                                                        // But then realized it is not required
    document.getElementById("guessbutton").disabled = true;
    document.getElementById("roomlist").innerHTML = "Rooms: "+rooms.join(', ')+
                                                                                "</br>Guests: "+suspects.join(', ')+
                                                                                "</br>Weapons: "+weapons.join(', ');
}

// Welcome message for the player, called when the user submits his/her name
// Displays the set of cards the player (human user) holds 
function start() {
    document.getElementById("result").innerHTML = "";
    var name = document.getElementById("name").value;

    if (name != "" && name != "undefined") {
        shuffle();
        localStorage.name = name;
        document.getElementById("startd").innerHTML = "Welcome " + name + ", you hold the cards for " + playerArray.join(', ');
        //document.getElementById("guessform").style.visibility = "visible";
        setOptionsforRooms();
        setOptionsforSuspects();
        setOptionsforWeapons();
        document.getElementById("guessbutton").disabled = false;
    }
}

// Function generates a random index for the input array
function genRandom(array) {
    var n = Math.floor(Math.random() * (array.length));
    return n;
}

//****** Source: https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript ******/
// Function that computes the set difference between two arrays
Array.prototype.diff = function (a) {
    return this.filter(function (i) { return a.indexOf(i) < 0; });
};

// Shuffling cards in three groups: Secret triplets, Player (user) cards, and Computer cards
function shuffle() {

    secretArray[0] = rooms[genRandom(rooms)];
    secretArray[1] = suspects[genRandom(suspects)];
    secretArray[2] = weapons[genRandom(weapons)];
    console.log(secretArray);                   // Printing secret cards triplet for developer's ease

    afterSecretArray = gArray.diff(secretArray);
    var count = afterSecretArray.length;

    for (var m = 0; m < count / 2; m++) {
        var c = genRandom(afterSecretArray);
        playerArray[m] = afterSecretArray[c];
        afterSecretArray = afterSecretArray.diff(playerArray);
    }

    computerArray = gArray.diff(playerArray);
    computerArray = computerArray.diff(secretArray);
    console.log(playerArray);                   // Printing player cards for developer's ease
    console.log(computerArray);             // Printing computer cards for developer's ease
}

// Displaying the list of ROOM cards that the user doesn't hold
function setOptionsforRooms() {
    var x = document.getElementById("rooms");
    roomArray = rooms.diff(playerArray);

    for (var i = 0; i < roomArray.length; i++) {
        var option = document.createElement("option");
        option.text = roomArray[i];
        option.value = roomArray[i];
        x.add(option);
    }
}

// Displaying the list of SUSPECT cards that the user doesn't hold
function setOptionsforSuspects() {
    var x = document.getElementById("suspects");
    suspectArray = suspects.diff(playerArray);

    for (var i = 0; i < suspectArray.length; i++) {
        var option = document.createElement("option");
        option.text = suspectArray[i];
        option.value = suspectArray[i];
        x.add(option);
    }
}

// Displaying the list of WEAPON cards that the user doesn't hold
function setOptionsforWeapons() {
    var x = document.getElementById("weapons");
    weaponArray = weapons.diff(playerArray);

    for (var i = 0; i < weaponArray.length; i++) {
        var option = document.createElement("option");
        option.text = weaponArray[i];
        option.value = weaponArray[i];
        x.add(option);
    }
}

var n = [];
var q = [];
n.push("</br>Game: " + count + "</br>");
if(localStorage.q) q.push(localStorage.q);

// Called when clicked on Guess button by the user when making a guess
// Also displays whether the guess is correct or not
function guess() {

    var r = document.getElementById("rooms");
    var roomSelection = r.options[r.selectedIndex].value;

    var s = document.getElementById("suspects");
    var suspectSelection = s.options[s.selectedIndex].value;

    var w = document.getElementById("weapons");
    var weaponSelection = w.options[w.selectedIndex].value;

    var pGuess = 'You guessed: "' + suspectSelection + ' in the ' + roomSelection + ' with a ' + weaponSelection + '".</br>';
    
    n.push(pGuess);
    sessionStorage.guess = n.join(' ');

    // If guess matches the secret triplet, displaying a win message, saving the record with date and time in local storage
    if (secretArray.includes(roomSelection) && secretArray.includes(suspectSelection) && secretArray.includes(weaponSelection)) {
        document.getElementById("result").innerHTML = `Your guess is correct. YOU WIN!!!</br>
                                                                                <label>Click to continue:</label>
                                                                                <input type="button" value="Continue" onclick="restart()"/>`;
        document.getElementById("guessbutton").disabled = true;
        localStorage.date = Date();
        record = "Computer lost the game with " + localStorage.getItem("name") + " on " +
                        localStorage.getItem("date") +"</br>";
        q.push(record);
        if (localStorage.loss) localStorage.loss++;
        if (!localStorage.loss) localStorage.loss = 1;
        console.log(localStorage.loss);
    
    }
    // If guess does not match, displaying incorrect message, revealing one incorrect guess, and providing continue button
    else {
        var ms = 'Incorrect guess, Computer holds the card for ';
        var me = '</br><label>Click to continue:</label><input type="button" value="Continue" onclick="continueGame()"/>';

        if (!secretArray.includes(roomSelection)) {
            document.getElementById("guessbutton").disabled = true;
            document.getElementById("result").innerHTML = ms + roomSelection + me;
        }
        else if (!secretArray.includes(suspectSelection)) {
            document.getElementById("guessbutton").disabled = true;
            document.getElementById("result").innerHTML = ms + suspectSelection + me;
        }
        else if (!secretArray.includes(weaponSelection)) {
            document.getElementById("guessbutton").disabled = true;
            document.getElementById("result").innerHTML = ms + weaponSelection + me;
        }
    }
    historyBtn();
}

// Called when the user makes an incorrect guess
// Makes a guess from Computer's side, and displays whether the guess is correct or incorrect
function continueGame() {
    document.getElementById("guessbutton").disabled = true;

    var notComputerRooms = rooms.diff(computerArray);
    var notComputerSuspects = suspects.diff(computerArray);
    var notComputerWeapons = weapons.diff(computerArray);

    var comRguess = notComputerRooms[genRandom(notComputerRooms)];
    var comSguess = notComputerSuspects[genRandom(notComputerSuspects)];
    var comWguess = notComputerWeapons[genRandom(notComputerWeapons)];

    var comGuess = 'Computer guessed: "' + comSguess + ' in the ' + comRguess + ' with a ' + comWguess + '".</br>';

    n.push(comGuess);
    sessionStorage.guess = n.join(' ');

    // If guess matches the secret triplet, displaying a win message, saving the record with date and time in local storage
    if (secretArray.includes(comRguess) && secretArray.includes(comSguess) && secretArray.includes(comWguess)) {
        var m = `The guess is correct. COMPUTER WINS!!!</br><label>Click to continue:</label>
                        <input type="button" value="Continue" onclick="restart()"/>`;
        document.getElementById("result").innerHTML = comGuess + m;
        document.getElementById("guessbutton").disabled = true;
        localStorage.date = Date();
        record = "Computer won the game with " + localStorage.getItem("name") + " on " +
                    localStorage.getItem("date") +"</br>";
        q.push(record);
        if (localStorage.win) localStorage.win++;
        if(!localStorage.win) localStorage.win = 1;
        console.log(localStorage.win);
    }
    // If guess does not match, displaying incorrect message, revealing one incorrect guess, and providing continue button
    else {
        var ms = 'Incorrect guess, You hold the card for ';
        var me = '</br><label>Click to continue:</label><input type="button" value="Continue" onclick="continueGame2()"/>';

        if (!secretArray.includes(comRguess)) {
            document.getElementById("guessbutton").disabled = true;
            document.getElementById("result").innerHTML = comGuess + ms + comRguess + me;
        }
        else if (!secretArray.includes(comSguess)) {
            document.getElementById("guessbutton").disabled = true;
            document.getElementById("result").innerHTML = comGuess + ms + comSguess + me;
        }
        else if (!secretArray.includes(comWguess)) {
            document.getElementById("guessbutton").disabled = true;
            document.getElementById("result").innerHTML = comGuess + ms + comWguess + me;
        }
    }
    historyBtn();
}

// Resets the game after the game is complete; i.e., either user or computer wins the game
function restart() {
    count++;
    n.push("</br>Game: " + count + "</br>");
    document.getElementById("startd").innerHTML = `<FORM>
                                                                    Name:
                                                                    <input type="text" id="name" placeholder="Enter your name here" autofocus="true" />
                                                                    <input type="button" value="Enter" onclick="start()" />
                                                                </FORM>`;
    display();
    document.getElementById("result").innerHTML = "";
    document.getElementById("rooms").options.length = 0;
    document.getElementById("suspects").options.length = 0;
    document.getElementById("weapons").options.length = 0;
    historyBtn();
    recordBtn();
}

// Called when the user presses continue after computer's incorrect guess
function continueGame2(){
    document.getElementById("guessbutton").disabled = false;
    document.getElementById("result").innerHTML = "";
}

// Displays Show History button
function historyBtn(){
    document.getElementById("sh").innerHTML = '<input type="button" value="Show History" onclick="showHistory()" />';
}

// Called when Show History button is clicked
function showHistory(){
    var hist = sessionStorage.guess;
    document.getElementById("sh").innerHTML = hist + '</br><input type="button" value="Hide History" onclick="historyBtn()" />';
}

// Displays Show Record button
function recordBtn(){
    document.getElementById("sr").innerHTML = '<input type="button" value="Show Record" onclick="showRecord()" />';
}

// Called when Show History button is clicked
function showRecord(){

    if(!localStorage.win) localStorage.win = 0;
    if(!localStorage.loss) localStorage.loss = 0;

    //console.log(localStorage.win);
    console.log(localStorage.loss);

    localStorage.q = q.join(' ');

    document.getElementById("sr").innerHTML = "Computer Won: " + localStorage.win +
                                                                    "</br>Computer Lost: " + localStorage.loss + "</br>" + localStorage.q +
                                                                    '</br><input type="button" value="Hide Record" onclick="recordBtn()" />';
}