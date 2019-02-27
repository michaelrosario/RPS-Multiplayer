  // Creates an array that lists out all of the options (Rock, Paper, or Scissors).
  var computerChoices = ["r", "p", "s"];

  // Creating variables to hold the number of wins, losses, and ties. They start at 0.
  var name = "Player 1";
  var challenger = false; // if not computer
  var challengerId = "";
  var status = "";
  var wins = 0;
  var losses = 0;
  var ties = 0;
  var round = 1;
  var ready = false;
  var key = Math.round(new Date().getTime()/1000);

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAMq-zbxLo_tgM9l4APGh0ScK5AKr0Fxao",
    authDomain: "rps-game-19d30.firebaseapp.com",
    databaseURL: "https://rps-game-19d30.firebaseio.com",
    projectId: "rps-game-19d30",
    storageBucket: "rps-game-19d30.appspot.com",
    messagingSenderId: "700549478537"
};
firebase.initializeApp(config);

var database = firebase.database();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

  // When the client's connection state changes...
  connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
      // Add user to the connections list.
      var con = connectionsRef.push(key);
      // Remove user from the connection list when they disconnect.
      database.ref("/players/"+key).onDisconnect().remove();
      con.onDisconnect().remove();
    }
  });

  // When first loaded or when the connections list changes...
  database.ref('players').on("value", function(snapshot) {
    var currentlyPlaying = 0;
    $(".challenger").empty();
  
    snapshot.forEach(function(userSnapshot) {
      
      var currentKey = parseInt(userSnapshot.key);
      var player = userSnapshot.val();
      if(player.currentlyPlaying){
        currentlyPlaying++;
      }

      // currentKey != key        : Check if it's not you
      // player.status == key     : Check if the player wants to play with you
      // status == currentKey  : Check if you approved to play with player

      if(currentKey !== key && player.status == key && status == currentKey){
        
        $(".challenger").html(`<div class="playerChallenge Item${currentKey}">You are now playing with ${player.name}.</div>`);

        // set specifics to player
        $(".player2").text(`${player.name}`);
        challenger = player.name;
        challengerId = currentKey;
        round = 1;

        database.ref("/players/"+key).update({
          currentlyPlaying : true
        });
        database.ref("/players/"+currentKey).update({
          currentlyPlaying : true
        });

      } else if(!challenger){ 

        if(currentKey !== key && player.status == key){
        $(".challenger").html(`<div class="playerChallenge Item${currentKey}">${player.name} wants to play with you! &nbsp; <a href="#" data-username='${player.name}' data-player='${currentKey}'>Accept</a></div>`);
        } else if(currentKey !== key && !player.currentlyPlaying){
          $(".challenger").append(`<div class="playersList Item${currentKey}">${player.name} is now available! &nbsp; <a href="#" data-username='${player.name}' data-player='${currentKey}'>Play Now</a></div>`);
        } else if(currentKey !== key && player.currentlyPlaying) {
          $(".challenger").append(`<div class="playersList Item${currentKey}">${player.name} is currently playing...`);
        } else if((snapshot.numChildren() - currentlyPlaying) < 2 &&  $(".challenger").find("div").length === 0) {
            $(".challenger").html(`Waiting for Challengers...`);
        }
      }

    });
  });

  // Send a request to play
  $(document).on("click",".playersList a",function(e){
    e.preventDefault();
    
    var challengerId = $(this).attr('data-player');
    var challengerName = $(this).attr('data-username');
    
    database.ref("/players/"+key).update({
      status : challengerId,
      wins: 0,
      losses: 0,
      ties: 0,
    });

    $(".Item"+challengerId).html(`Asking <strong>${challengerName}</strong> to play... Please wait...`);

  });

  // Accept request to player
  $(document).on("click",".playerChallenge a",function(e){
    e.preventDefault();
    
    var challengerId = $(this).attr('data-player');
    var challengerName = $(this).attr('data-username');
    
    // set player
    database.ref("/players/"+key).update({
      status : challengerId,
      wins: 0,
      losses: 0,
      ties: 0,
    });
    
    challenger = challengerName;
    challengerId = challengerId;
    round = 1;
    
    $(".player2").text(challenger);

    $(".Item"+challengerId).html(`You are now playing with <strong>${challengerName}</strong>.`);

  });

  // Check if data removed
  database.ref('players').on('child_removed', function(data) {
    console.log(data.val().name+" left the game...");
    $(".Item"+data.key).remove();
  });

  var userChoice = "";
  var challengerChoice = "";
  
  // Check if data changed
  database.ref('players').on('child_changed', function(data) {
    console.log(data.val().name+" played the game...");
    if(challenger && data.key == key){
      userChoice = data.val().currentChoice;
      $(".status").html(`Waiting for ${challenger}...`);

    }
    if(challenger && data.key == challengerId){
      challengerChoice = data.val().currentChoice;
      $(".status").html(`Waiting for ${name}...`);
    }
    if(challenger && userChoice && challengerChoice){
      $(".status").html(`Round ${round++}`);
      runMultiplayerGame(userChoice,challengerChoice);

    }
  });

  $(".start").on("click",function(e){
    e.preventDefault();
    $(".player-start").submit();
  });

  $(".player-start input").on("focus",function(){
    $(this).parent().removeClass("error")
  });

  $(".player-start").on("submit",function(e){
    e.preventDefault();
    if( $(".player").val().length < 2 ){
      
      $(this).addClass("error");
    
    } else {

      name = $(".player").val();
      
      $(".player1").text(name);
      $(".player-start").slideUp();
      $(".game").addClass("ready").fadeIn();
      ready = true;

      database.ref("/players/"+key).set({
        name: name,
        status
      });
      
    }
  });

    database.ref("/players/"+key).on("value", function(snapshot) {

      if(snapshot.child("name").exists()){
        // Set the local variables for highBidder equal to the stored values in firebase.
        wins = parseInt(snapshot.val().wins) || 0;
        ties = parseInt(snapshot.val().ties) || 0;
        losses = parseInt(snapshot.val().losses) || 0;
        status = parseInt(snapshot.val().status) || 0;
    
        $("#wins").html(`<span>wins:</span> ${wins}`);
        $("#losses").html(`<span>losses:</span> ${losses}`);
        $("#ties").html(`<span>ties:</span> ${ties}`);
      }

    });

    $("#wins").html(`<span>wins:</span> ${wins}`);
    $("#losses").html(`<span>losses:</span> ${losses}`);
    $("#ties").html(`<span>ties:</span> ${ties}`);
      
    $(".status").addClass("ready");

    // This function is run whenever the user presses a key.
    document.onkeyup = function(event) {
      if(event.target.id === 'player-input'){
        return; // exclude on key up on input
      }  

      if(ready && !challenger){
        runGame(event.key);
      } else if(ready){
        updateMultiplayerGame(event.key);
      }
        
    }

    $(".button").on("mouseup touchstart",function(){
      var choice = $(this).attr("data-option");
      if(ready && !challenger){
        runGame(choice);
      } else if(ready){
        updateMultiplayerGame(choice);
      }
      return false;

    });

    function updateMultiplayerGame(input){

       // Determines which key was pressed.
       var userGuess = input.toLowerCase();
       
       if(userGuess === "r"){
          $("#rock").addClass("active");
        }
        if(userGuess === "p"){
          $("#paper").addClass("active");
        }
        if(userGuess === "s"){
          $("#scissors").addClass("active");
        }

        database.ref("/players/"+key).update({
          currentChoice: userGuess
        });

    }

    function runMultiplayerGame(userInput,challengerInput){
      console.log("userInput",userInput);
      console.log("challengerInput",challengerInput);
      if(ready){
        ready = false;
      }

    }

    function runGame(input) {

        // Determines which key was pressed.
        var userGuess = input.toLowerCase();

        // Randomly chooses a choice from the options array. This is the Computer's guess.
        var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

        if(userGuess === "r"){
          $("#rock").addClass("active");
        }
        if(userGuess === "p"){
          $("#paper").addClass("active");
        }
        if(userGuess === "s"){
          $("#scissors").addClass("active");
        }

        if (((userGuess === "r") || (userGuess === "p") || (userGuess === "s")) && ready) {

          ready = false;

          $(".status")
            .show()
            .html(`Round ${round++}`)
            .removeClass("ready")
            .delay(500)
            .fadeOut();

          $(".left")
            .css({'background':`url(./assets/images/left-${userGuess}.png) center center no-repeat`,'background-size':'contain'})
            .addClass("start");

          $(".right")
            .css({'background':`url(./assets/images/right-${computerGuess}.png) center center no-repeat`,'background-size':'contain'})
            .addClass("start");
        
          setTimeout(function(){

              $(".right,.left").removeClass("start").find("img");

          },1600);

          if ((userGuess === "r" && computerGuess === "s") ||
            (userGuess === "s" && computerGuess === "p") || 
            (userGuess === "p" && computerGuess === "r")) {
            wins++;
            setTimeout(function(){ 
              $("#wins").addClass("active");
              $(".status").hide().html("You won!").addClass("win").fadeIn();
            }, 1500 );
            
            database.ref("/players/"+key).update({
              wins : wins
            });


          } else if (userGuess === computerGuess) {
            ties++;
            setTimeout(function(){ 
               $("#ties").addClass("active");
               $(".status").hide().html("It's a Tie!").addClass("tie").fadeIn(); 
             }, 1500 );
            database.ref("/players/"+key).update({
              ties : ties
            });
          
          } else {
            losses++;
            setTimeout(function(){ 
              $("#losses").addClass("active");
              $(".status").hide().html("You lost!").addClass("loss").fadeIn();
            }, 1500 );

            database.ref("/players/"+key).update({
              losses : losses
            });
          
          }

          setTimeout(function(){

            $("#losses,#wins,#ties,#rock,#paper,#scissors").removeClass("active");

         },2000);

          setTimeout(function(){

            ready = true;
            $(".status").html("READY").addClass("ready").removeClass("loss win tie").fadeIn();

          },2500);

          
  
      
        }
    }
