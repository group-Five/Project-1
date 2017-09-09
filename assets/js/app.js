var masterMovieObject;
var movieArray = [];
var randomPageNumber = Math.floor(Math.random() * 300) + 1  
var queryURL = "https://api.themoviedb.org/3/movie/popular?api_key=ee2e00cb4eb46b7262f08bc8d337cc19&language=en-US&page=" + randomPageNumber;
var questionCounter = 0;

//Switches from instructions screen to game screen
var toggle = function(){
	$('.main').removeClass('hidden');
	$('.instructions').addClass('hidden');
	playGame();
}

//Switches from input screen to results screen
var submitInput = function(){
	$('.input-screen').addClass('hidden');
	$('.results-screen').removeClass('hidden');
	//show results
}

//Switches from results screen to input screen (new question)
var nextQuestion = function(){
	$('.results-screen').addClass('hidden');
	$('.input-screen').removeClass('hidden');
	//Display next question
}

//Pulls data into movieArray and displays the first question
var playGame = function(){
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
    	questionCounter++;
    	$('.image').html('<img src="https://image.tmdb.org/t/p/w500' + movieArray[0].poster + '"/>');
	});
}