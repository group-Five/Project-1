// Initialize Firebase
var config = {
    apiKey: 'AIzaSyCp4_SHW4ex5cY-lVYHeHRqMsTIPqPLbIg',
    authDomain: 'project-1-77b2d.firebaseapp.com',
    databaseURL: 'https://project-1-77b2d.firebaseio.com',
    projectId: 'project-1-77b2d',
    storageBucket: '',
    messagingSenderId: '929454098178'
	};
firebase.initializeApp(config);
var database = firebase.database();
var masterMovieObject;
var movieArray = [];
var randMANum;
var randomPageNumber = Math.floor(Math.random() * 300) + 1;
var queryURL = 'https://api.themoviedb.org/3/movie/popular?api_key=ee2e00cb4eb46b7262f08bc8d337cc19&language=en-US&page=' + randomPageNumber;
var questionCounter = 0;
var score = 0;
var lowestScore;
var userInitials;
var inverseScore;
var progBar = 10;
var localTimestamp;
var input = 0; 
var rail = []; 
var highscoreCount;

document.getElementById('hiscoreNameOne').style.height="200px";
document.getElementById('hiscoreNameOne').style.width="200px";
document.getElementById('hiscoreNameOne').style.fontSize="100pt";

document.getElementById('hiscoreNameTwo').style.height="200px";
document.getElementById('hiscoreNameTwo').style.width="200px";
document.getElementById('hiscoreNameTwo').style.fontSize="100pt";

document.getElementById('hiscoreNameThree').style.height="200px";
document.getElementById('hiscoreNameThree').style.width="200px";
document.getElementById('hiscoreNameThree').style.fontSize="100pt";
$('form input[type=text]').on('input',function () {
	$(this).next('input').focus();

    //if($(this).val().length == $(this).attr('maxlength') && ploob === "true") 
});

// Generate a random number for our movie array
var genRandNum = function(){
	randMANum = Math.floor(Math.random() * movieArray.length);
	return randMANum;
}

//Function that finds the accuracy of your guess based on the absolute difference between your guess and the real rating
function findAccuracy(guess, real){
	//Declares a variable that is equal to the real rating by default
	var modular = real;
 	//If statement that will switch the value to rating of your guess
	if(real < guess){
  	modular = guess
  	};
	var delta = Math.abs(real - guess);
	return Math.abs(Math.ceil((100-(((delta) / (modular)) * 100))));
};

//Pulls bonus movie info from OMDB
 var pullFacts = function(){
 	$.ajax({
       url: 'https://www.omdbapi.com/?apikey=40e9cece&t=' + movieArray[randMANum].title,
       method: "GET"
     }).done(function(response) {
     	$('.directors').text('Directed by: ' + response.Director);
     	$('.writers').text('Written by: ' + response.Writer)
     	$('.actors').text('Starring: ' + response.Actors);
     	$('.plot').text('Plot: ' + response.Plot);
 	});
 }

//Switches from input screen to results screen
var submitInput = function(){
	$('.panel-heading').text(movieArray[randMANum].title);

	$('.next').removeClass('hidden');

	if(questionCounter === 9){
		$('.next').addClass('hidden');
		$('.end').removeClass('hidden');
	}

	$('.input-screen').addClass('hidden');
	$('.results-screen').removeClass('hidden');
	$('#scoreStatus').removeClass('hidden');

	var rating = movieArray[randMANum].rating;
	// ---------------------------- 

    $('#rateYo2').rateYo('option', 'rating', rating); 

    $('#rateYo2Rating').text('Actual rating: ' + rating);

// ----------------------------
	
	var diff = findAccuracy(input, rating);
	$('#scoreStatus').html("+" + diff + " points");
	score = score + diff;
}

//Switches from results screen to input screen (new question)
var nextQuestion = function(){
	// reset ratingbar and display      
    $('#rateYo').rateYo('option', 'rating', 0);
    $('#rateYoRating').text('0');
    input=0;

	questionCounter++;
	movieArray.splice(randMANum, 1);
	$('.image').html('<img src="https://image.tmdb.org/t/p/w342' + movieArray[genRandNum()].poster + '"/>');

	pullFacts();
	
	$('.results-screen').addClass('hidden');
	$('.input-screen').removeClass('hidden');
	//Display next question
	progressBar();
}

//Pulls data into movieArray and displays the first question
var playGame = function(){
	questionCounter = 0;
	score = 0;
	movieArray = [];
	randomPageNumber = Math.floor(Math.random() * 300) + 1;
	progBar = 0;
	progressBar();
	queryURL = 'https://api.themoviedb.org/3/movie/popular?api_key=ee2e00cb4eb46b7262f08bc8d337cc19&language=en-US&page=' + randomPageNumber;

	$('#rateYo').rateYo('option', 'rating', 0);
	$('#rateYoRating').text('0');

	$('.main').removeClass('hidden');
	$('.input-screen').removeClass('hidden');

	$('.results-screen').addClass('hidden');
	$('.instructions').addClass('hidden');
	$('.end-screen').addClass('hidden');
	$('.end').addClass('hidden');
	//Show progress bar
	$('.progress').removeClass('hidden');
	$.ajax({
      url: queryURL,
      method: 'GET'
    }).done(function(response) {
    	for(i = 0; i < response.results.length; i++){
    		if(response.results[i].vote_average != 0 && response.results[i].adult === false){
	    		//console.log(response.results[i].title);
	    			movie = {
	    				title: response.results[i].title,
	    				poster: response.results[i].poster_path,
	    				rating: (Math.round(((response.results[i].vote_average) / 2) * 10) / 10),
	    				genre: response.results[i].genre_ids[i],
	    				overview: response.results[i].overview,
	    			}
	    	movieArray.push(movie);
	    	
    		}
		}
    	//shuffle array order
    	$('.image').html('<img src="https://image.tmdb.org/t/p/w342' + movieArray[genRandNum()].poster + '"/>');

    	$('#rateYo2').rateYo({
      		normalFill: '#A0A0A0',
      		rating: movieArray[randMANum].rating,
      		readOnly: true,
      		starWidth: '100px'
    	})

		//console.log(movieArray);

		pullFacts();
	});
    //Making lowestScore equal to zero
    lowestScore = 0;
    //Sees how many hiscores are in Firebase
    database.ref().on('child_added', function(snapshot){
    	rail.push(snapshot.val().score);
	});
	//Grab the lowest score out of Firebase and overwriting lowestScore.  If nothing is pull, lowestScore stays at zero
	database.ref().orderByChild('score').limitToFirst(1).on('child_added', function(snapshot){
			lowestScore = snapshot.val().score;
	});
	
}

//Runs end of game procedures
var endGame = function(){
	$('.score').text('Your score: ' + score);
	//Hides the progress bar
	$('.progress').addClass('hidden');
	highscoreCount = rail.length;
	//if there are less than 10 hiscores, then congratulations, you got a hiscore
	if (highscoreCount < 10 || score > lowestScore){
		$('.main').addClass('hidden');
		$('.enter-hiscore').removeClass('hidden');
	} else {
		$('.main').addClass('hidden');
		$('.end-screen').removeClass('hidden');
		generateTable();
	}
	//if not, just go right to the end screen
	
}

var progressBar = function(){
	progBar = progBar + 10;
	progDisp = questionCounter + 1;
	progTalk = 'width: ' + progBar + '%;'
	$('.progress-bar').attr('aria-valuenow', progBar);
	$('.progress-bar').attr('style', progTalk);
	$('.progress-bar').html('Question ' + progDisp + ' out of 10');
}

//Pushes variables such as user initials and user score to Firebase
var saveToFB = function(){
    database.ref().push({
    	userInitials: userInitials,
        score: score,
        inverseScore: inverseScore,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    database.ref().orderByChild('dateAdded').limitToLast(1).on('child_added', function(snapshot){
    	var sv = snapshot.val();
    	localTimestamp = sv.dateAdded;
    });
};

var sendHiscore = function(){
	event.preventDefault();
	initOne = $('#hiscoreNameOne').val();
	initTwo = $('#hiscoreNameTwo').val();
	initThree = $('#hiscoreNameThree').val();
	lowLetters = initOne + initTwo + initThree;
	userInitials = lowLetters.toUpperCase();
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
	//Clear out table
    $('tbody').empty();
	//Generate the hiscore table using the first 10 values in Firebase
database.ref().orderByChild('inverseScore').limitToLast(10).on('child_added', function(snapshot){
    var sv = snapshot.val();
    //---This is where the magic happens
    var rowHold = $('<tr>');

    var rowInitials = $('<td>');
    rowInitials.text(sv.userInitials);
    rowHold.append(rowInitials);

    var rowScore = $('<td>');
    rowScore.text(sv.score);
    rowHold.append(rowScore);

    var rowDate = $('<td>');
    dateUnix = sv.dateAdded
	var myDate = new Date(dateUnix);
	var sendDate = myDate.toLocaleString();
	var splitDate = sendDate.split(',');
	var pureDate = splitDate[0];
    rowDate.text(pureDate);
    rowHold.append(rowDate)

    $('tbody').append(rowHold);

    if(localTimestamp === sv.dateAdded){
    	rowHold.addClass('bolded');
    }
});
};

// display rating bar at the first place
$('#rateYo').rateYo(
    {ratedFill: '#E74C3C',
	 starWidth: '100px'}
    ).on('rateyo.change', function(e, data) {
    var rating = data.rating;
    input = rating;
    $(this).next().text(rating);
});
