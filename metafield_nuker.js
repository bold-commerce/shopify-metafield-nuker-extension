// Extend the String class with a function that 
String.prototype.toElapsedTime = function() {
	var sec_num = parseInt(this, 10);
	var hours 	= Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	
	var time = hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds';
	return time;
}

try {
	// Get the current time so we can 
	var startTime = Date.now();

	
	var finishTime = Date.now();
	var elapsedTime = (finishTime - startTime) / 1000;
	console.log('Job took ' + elapsedTime.toString().toElapsedTime() + ' to complete.')
} catch(error) {
	console.log(error);
	
	var finishTime = Date.now();
	var elapsedTime = (finishTime - startTime) / 1000;
	console.log('Job ran for ' + elapsedTime.toString().toElapsedTime() + ' before failing.')
}
