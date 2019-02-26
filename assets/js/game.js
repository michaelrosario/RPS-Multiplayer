var ready = false;

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
    $(".player1").text($(".player").val());
    $(".player-start").slideUp();
    $("#directions-text").fadeIn();
    $(".game").fadeIn();
    ready = true;
  }

});

// Creates an array that lists out all of the options (Rock, Paper, or Scissors).
    var computerChoices = ["r", "p", "s"];

    // Creating variables to hold the number of wins, losses, and ties. They start at 0.
    var wins = 0;
    var losses = 0;
    var ties = 0;
    var round = 1;
   
    $("#wins").html(`<span>wins:</span> ${wins}`);
    $("#losses").html(`<span>losses:</span> ${losses}`);
    $("#ties").html(`<span>ties:</span> ${ties}`);

    $(".status").addClass("ready");

    // This function is run whenever the user presses a key.
    document.onkeyup = function(event) {
      if(event.target.id === 'player-input'){
        return; // exclude on key up on input
      }  

      runGame(event.key);
        
    }

    $(".button").on("click",function(){

      runGame($(this).text());
      return false;

    });

    function runGame(input) {
      // Determines which key was pressed.
        var userGuess = input.toLowerCase();

        // Randomly chooses a choice from the options array. This is the Computer's guess.
        var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

        // Reworked our code from last step to use "else if" instead of lots of if statements.

        // This logic determines the outcome of the game (win/loss/tie), and increments the appropriate number

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

          $(".status").html(`Round ${round++}`)

          $(".status").removeClass("ready");

          $(".left").addClass("start")
          .css({'background':`url(./assets/images/left-${userGuess}.png) center center no-repeat`,'background-size':'contain'})
          .find('img')
          .animate({'opacity':0},500);

          $(".right").addClass("start")
            .css({'background':`url(./assets/images/right-${computerGuess}.png) center center no-repeat`,'background-size':'contain'})
            .find('img')
            .animate({'opacity':0},500);

          if ((userGuess === "r" && computerGuess === "s") ||
            (userGuess === "s" && computerGuess === "p") || 
            (userGuess === "p" && computerGuess === "r")) {
            
            setTimeout(function(){ 
              wins++;
              $("#wins").addClass("active"); 
              $("#wins").html(`<span>wins:</span> ${wins}`);
            }, 500 );


          } else if (userGuess === computerGuess) {
            
            
            setTimeout(function(){ 
              ties++;
               $("#ties").addClass("active");
               $("#ties").html(`<span>ties:</span> ${ties}`);  
             }, 500 );
          
          } else {
          
            setTimeout(function(){ 
              losses++;
              $("#losses").addClass("active");
              $("#losses").html(`<span>losses:</span> ${losses}`);
            }, 500 );
          
          }

          setTimeout(function(){

             $("#losses,#wins,#ties,#rock,#paper,#scissors").removeClass("active");

          },1000);

          setTimeout(function(){

              ready = true;
              $(".status").html("READY").addClass("ready");
              $(".right,.left").removeClass("start").find("img").animate({'opacity':1},0);

          },2000);

          
          
      
        };
    }
