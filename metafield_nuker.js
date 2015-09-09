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

	// Shopify has a limit of 250 objects per API call, so we need to know how
	// many products the store has. That will tell us how many calls we need to make
	var productCount;
	$.ajax({
		url: location.origin + "/admin/products/count.json",
		async: false,
		success: function(result) {
			productCount = result.count;
			// Print a message detailing how many products were found and on what store
			console.log("Found " + result.count + " products on " + location.origin);
		},
		error: function(result) {
			// Throw an error to bail out of the try block
			throw "Oops! Something happened getting the product count... Error: " + result.status + " (" + result.statusText + ")";
		}
	});
	
	var finishTime = Date.now();
	var elapsedTime = (finishTime - startTime) / 1000;
	console.log('Job took ' + elapsedTime.toString().toElapsedTime() + ' to complete.')
} catch(error) {
	console.log(error);
	
	var finishTime = Date.now();
	var elapsedTime = (finishTime - startTime) / 1000;
	console.log('Job ran for ' + elapsedTime.toString().toElapsedTime() + ' before failing.')
}
