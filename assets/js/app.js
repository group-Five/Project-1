var masterMovieObject;
var movieArray = [];
var randomPageNumber = Math.floor(Math.random() * 300) + 1;
var queryURL = "https://api.themoviedb.org/3/movie/popular?api_key=ee2e00cb4eb46b7262f08bc8d337cc19&language=en-US&page=" + randomPageNumber;
var questionCounter = 0;
var score = 0;

//Returns difference
var difference = function(input, rating){
	return Math.abs(input - rating);
}

//Switches from input screen to results screen
var submitInput = function(){
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

	if(diff === 0){
		score =+ 100;
	}

	else if(diff <= 1){
		score =+ 50;
	}

	else if(diff <= 2){
		score =+ 25;
	}

	else{
		score =+ 10;
	}
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

	$('.main').removeClass('hidden');
	$('.instructions').addClass('hidden');

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
}

//Runs end of game procedures
var endGame = function(){
	$('.score').text('Your score: ' + score);

	$('.main').addClass('hidden');
	$('.end-screen').removeClass('hidden');
}