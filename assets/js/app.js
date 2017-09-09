// Initialize Firebase
var config = {
    apiKey: "AIzaSyCp4_SHW4ex5cY-lVYHeHRqMsTIPqPLbIg",
    authDomain: "project-1-77b2d.firebaseapp.com",
    databaseURL: "https://project-1-77b2d.firebaseio.com",
    projectId: "project-1-77b2d",
    storageBucket: "",
    messagingSenderId: "929454098178"
	};
firebase.initializeApp(config);
var database = firebase.database();
var masterMovieObject;
var movieArray = [];
var randomPageNumber = Math.floor(Math.random() * 300) + 1;
var queryURL = "https://api.themoviedb.org/3/movie/popular?api_key=ee2e00cb4eb46b7262f08bc8d337cc19&language=en-US&page=" + randomPageNumber;
var questionCounter = 0;
var score = 0;
var lowestScore;
var userInitials;
var inverseScore;

//Returns difference
var difference = function(input, rating){
	return Math.abs(input - rating);
}

//Switches from input screen to results screen
var submitInput = function(){
	$('.next').removeClass('hidden');
	$('.movie-score').text(movieArray[questionCounter].rating);

	if(questionCounter === 9){
		$('.next').addClass('hidden');
		$('.end').removeClass('hidden');
	}

	$('.input-screen').addClass('hidden');
	$('.results-screen').removeClass('hidden');

	var input = $('#slider').val();
	var rating = movieArray[questionCounter].rating;
	var diff = difference(input, rating);
	console.log("Before you answer, your score is " + score);
	if(diff === 0){
		score = score + 100;
		console.log("You get 100 points (best)");
	}

	else if(diff <= 1){
		score = score + 50;
		console.log("You get 50 points (second best)");
	}

	else if(diff <= 2){
		score = score + 25;
		console.log("You get 25 points (second worst)");
	}

	else{
		score = score + 10;
		console.log("You get 10 points (worst)");
	}
	console.log("Your score is now " + score);
}

//Switches from results screen to input screen (new question)
var nextQuestion = function(){
	questionCounter++;
	$('.image').html('<img src="https://image.tmdb.org/t/p/w500' + movieArray[questionCounter].poster + '"/>');

	$('.results-screen').addClass('hidden');
	$('.input-screen').removeClass('hidden');
	//Display next question
}

//Pulls data into movieArray and displays the first question
var playGame = function(){
	questionCounter = 0;
	score = 0;
	movieArray = [];
	randomPageNumber = Math.floor(Math.random() * 300) + 1;
	queryURL = "https://api.themoviedb.org/3/movie/popular?api_key=ee2e00cb4eb46b7262f08bc8d337cc19&language=en-US&page=" + randomPageNumber;

	$('.main').removeClass('hidden');
	$('.input-screen').removeClass('hidden');

	$('.results-screen').addClass('hidden');
	$('.instructions').addClass('hidden');
	$('.end-screen').addClass('hidden');
	$('.end').addClass('hidden');

	$.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
    	for(i = 0; i < response.results.length; i++){
    		if(response.results[i].vote_average != 0 && response.results[i].adult === false){
	    		//console.log(response.results[i].title);
	    		masterMovieObject = {
	    			movie : {
	    				title: response.results[i].title,
	    				poster: response.results[i].poster_path,
	    				rating: response.results[i].vote_average,
	    				genre: response.results[i].genre_ids[i],
	    				overview: response.results[i].overview,
	    			},
	    		}
	    	movieArray.push(masterMovieObject.movie);
	    	
    		}
		}
    	//shuffle array order
    	$('.image').html('<img src="https://image.tmdb.org/t/p/w500' + movieArray[questionCounter].poster + '"/>');
	});
    //Making lowestScore equal to zero
    lowestScore = 0;
    console.log("Lowest score set to zero by default.");
	//Grab the lowest score out of Firebase and overwriting lowestScore.  If nothing is pull, lowestScore stays at zero
	database.ref().orderByChild("score").limitToFirst(1).on("child_added", function(snapshot){
			lowestScore = snapshot.val().score;
			console.log("The updated lowest score from Firebase is now " + lowestScore);
	});
}

//Runs end of game procedures
var endGame = function(){
	$('.score').text('Your score: ' + score);

	

	//if you get a hiscore, take them to the screen for entering in your initials
	if(score > lowestScore){
		$('.main').addClass('hidden');
		$('.enter-hiscore').removeClass('hidden');
	} else {
		$('.main').addClass('hidden');
		$('.end-screen').removeClass('hidden');
	}
	//if not, just go right to the end screen
	
}

//Pushes variables such as user initials and user score to Firebase
var saveToFB = function(){
    database.ref().push({
    	userInitials: userInitials,
        score: score,
        inverseScore: inverseScore,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
};

var sendHiscore = function(){
	event.preventDefault();
	userInitials = $('#hiscoreName').val();
	console.log(userInitials);
	//Go to the end screen
	$('.enter-hiscore').addClass('hidden');
	$('.end-screen').removeClass('hidden');
	inverseScore = 1 / score;
	//Send all the information gathered to Firebase
	saveToFB();
	//Generates the hiscore table (hopefully before the user gets there)
	generateTable();
};

var generateTable = function(){
	//Generate the hiscore table using the first 10 values in Firebase
database.ref().orderByChild("inverseScore").limitToLast(10).on("child_added", function(snapshot){
    var sv = snapshot.val();
    //---This is where the magic happens
    var rowHold = $("<tr>");

    var rowInitials = $("<td>");
    rowInitials.text(sv.userInitials);
    rowHold.append(rowInitials);

    var rowScore = $("<td>");
    rowScore.text(sv.score);
    rowHold.append(rowScore);

    var rowDate = $("<td>");
    rowDate.text(sv.dateAdded);
    rowHold.append(rowDate)

    $("tbody").append(rowHold);

    //-------End of the magic
});
};