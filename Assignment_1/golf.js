// JSON String here
var obj = `{ "tournament": {"name": "British Open",
                    "year": " ", 
                    "award": 840000,
                    "yardage": 6905,
                    "par": 71,
                    "round": 2,
                    "players": [
                        {"lastname": "Montgomerie", "firstinitial": "C", "score": -3, "hole": 17 },
                        {"lastname":"Redmond","firstinitial":"O","score":5,"hole": 1 },
                        {"lastname": "Marigold", "firstinitial": "K", "score": 0, "hole": 16 },
                        {"lastname": "Fulke", "firstinitial": "P", "score": 4, "hole": 1 },
                        {"lastname": "GumShuda", "firstinitial": "A", "score": 3, "hole": 17 }
                        ]
                    }
                }`;

// Including 'events' module and creating Event-Emitter instance
const Events = require("events");
class Mevents extends Events {}
const mevents = new Mevents();

//var tour = new Tournament(obj);

// Tournament Class
function Tournament(json) {

    this.tournament = JSON.parse(json);
    this.name = this.tournament.tournament.name;
    this.year = this.tournament.tournament.year;
    this.award = this.tournament.tournament.award;
    this.yardage = this.tournament.tournament.yardage; 
    this.par = this.tournament.tournament.par;
    this.round = this.tournament.tournament.round;
    this.play = [];
   
    for(var i=0; i<this.tournament.tournament.players.length; i++){
        var ep = new Players(this.tournament.tournament.players[i].lastname,this.tournament.tournament.players[i].firstinitial, this.tournament.tournament.players[i].score, this.tournament.tournament.players[i].hole);
        this.play[i] = ep;
    }
    
    var ref = this;
    // Setting the Event listener
    mevents.on("up_score", function(){

       var isFinished = ref.play.every(player => player.hole =="finished");

       if(isFinished){
           // For Fourth(final) round
            if(ref.round == 4){
                var tournw = new Tournament('{"tournament":' + ref.leaderboard()+'}');
                                        ref.getWinner = function(){
                                            return ref.winner.lastname; 
                                        }
                var position = 1;
                tournw.play.forEach(function (p2) {
                                        var winner = ref.play.find(function (p1) {
                                            if(p1.lastname == p2.lastname && p1.firstinitial == p2.firstinitial)
                                                return true;
                                            else
                                                return false; 
                                        });
                                if(position == 1){
                                    ref.winner = winner;
                                    winner.winnings = ref.award * 0.5;
                                }
                                else if(position == 2){
                                    winner.winnings = ref.award * 0.3;
                                }
                                else if(position == 3){
                                    winner.winnings = ref.award * 0.2;
                                }
                                else
                                return;
                    position += 1;
                });
            }
            // For Rounds one t(w)o three
            else{
                    ref.play.forEach(function (p) {
                        p.hole = 0;
                    })
                    ref.round += 1;      
            }  
        }
    });
}


// Players Class
function Players(last_name, first_initial, score, hole) {
    
    this.lastname = last_name;
    this.firstinitial = first_initial;
    this.score = score;
    this.hole = hole;

    //postScore function
    this.postScore =function(s) {

        if(this.hole != "finished"){

            if(this.hole == 17){

                this.hole = "finished";
            }
            else{
                this.hole += 1;
            }
            this.score += s; 
        }

        mevents.emit("up_score");
    }
}


// leaderboard function
Tournament.prototype.leaderboard = function () {
        
    var arr = [];
    for(var i=0; i<this.play.length; i++){
        arr.push(this.play[i]);
    }
    
    arr.sort(function (a, b) {
        var diff = a.score - b.score;
        if(diff == 0){
            if(b.hole == "finished"){
                return 1;
            }
            else if(a.hole == "finished"){
                return -1;
            }
        return b.hole - a.hole;
        }
        return diff;
    });

    var result = JSON.stringify({players: arr});
    return result;
}

// projectScoreByIndividual function
Tournament.prototype.projectScoreByIndividual = function(last_name, first_initial) {
    
    for(var i=0; i<this.play.length; i++){

        if(this.play[i].lastname == last_name && this.play[i].firstinitial == first_initial){

            if(typeof this.play[i].hole == 'number'){

                var totalholes = this.play[i].hole + (this.round - 1)*18;
                var value13 = Math.round((this.play[i].score/totalholes)*((18*this.round) - totalholes)+this.play[i].score);
                return value13;
            }

            else if(this.play[i].hole == "finished"){

                return this.play[i].score;
            }
        }
    }
}

//console.log("Projected score for Individual is " + tour.projectScoreByIndividual("Redmond", "O"));

// projectScoreByHole function
Tournament.prototype.projectScoreByHole = function (last_name, first_initial) {

    var magic = (this.round - 1) * 18;
    var total = 0;
    var sc, sc1, h1, ho, flag, val, avg, sp;

    for(var c = 0; c < this.play.length; c++){

        if(this.play[c].lastname == last_name && this.play[c].firstinitial == first_initial){
            if(this.play[c].hole == "finished"){
                sp = this.play[c].score;
                flag = 1;
            }
            else{
                sc1 = this.play[c].score;
                h1 = this.play[c].hole;
            }
            continue;
        }
        else{
            if(this.play[c].hole == "finished"){
                ho = 18;
                sc = this.play[c].score;
            }
            else{
                sc = this.play[c].score;
                ho = this.play[c].hole;
            }
            val = sc/(ho + magic);
        }
        total += val;
    }

    avg = total/(this.play.length - 1);
    //console.log("Avg is "+ avg);

    if(flag == 1){
        return sp;
    }
    else{
        var value31 = Math.round(sc1 +((18 - h1) * avg));
        return value31;
    }
}

//console.log("Projected score by hole for Fulke is " + tour.projectScoreByHole("Fulke", "P"));
//console.log("Projected score by hole for Redmond is " + tour.projectScoreByHole("Redmond", "O"));


// printLeaderboard function
Tournament.prototype.printLeaderboard = function () {
    console.log("------------------------------Leaderboard------------------------------");
    console.log(this.leaderboard());
}

//tour.printLeaderboard();

// projectedLeaderboard function
Tournament.prototype.projectedLeaderboard = function (projectScoreByXXX){
    
    var pArray = [];
    for(var i in this.play){
        pArray[i] = new ProjectScore(this.play[i], projectScoreByXXX(this.play[i].lastName, this.play[i].firstinitial));
    }
    //console.log(pArray);
    pArray.sort(function (a, b) {
        return a.pScore - b.pScore;
    });
    console.log(JSON.stringify(pArray));
}

//tour.projectedLeaderboard(tour.projectScoreByHole.bind(tour));

function ProjectScore(pAll, pScore){
    this.pAll = pAll;
    this.pScore = pScore;
}