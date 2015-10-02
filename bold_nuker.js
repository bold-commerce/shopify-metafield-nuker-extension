$('html').addClass('nukerJSoverride');
$('body').append('<div id="nukerJSbar" class="fadein"></div>');
$('#nukerJSbar').append('<div class="wrapper clearfix"></div>');
$('#nukerJSbar .wrapper').append('<ul id="nukerJSnav"></ul>');
$('#nukerJSnav').append('<li><a id="bn_about">About Nuker</a></li>');
$('#nukerJSnav').append('<li class="hidden"></li>');
$('#nukerJSnav').append('<li><select id="ns-selector"></select></li>');
$('#ns-selector').append('<option value="bold_measurement">Buy the Measurement</option>');
$('#ns-selector').append('<option value="shappify_csp">Customer Pricing</option>');
$('#ns-selector').append('<option value="shappify_bundle">Product Bundles</option>');
$('#ns-selector').append('<option value="shappify_qb">Quantity Breaks</option>');
$('#nukerJSnav').append('<li><a id="bn_nuke">Nuke Metafields</a></li>');
$('#nukerJSnav').append('<li><a id="bn_settings">Settings</a></li>');
$('#nukerJSnav').append('<li></li>');
$('#nukerJSbar .wrapper').append('<input type="hidden" id="namespace" value="shappify_csp">');
$('#nukerJSbar .wrapper').append('<input type="hidden" id="logging" value="true">');

$('#ns-selector').on('change', function() {
	$('#namespace').val($('#ns-selector option:selected').val())
});
$('#bn_nuke').on('click', function() {
	startMetafieldNuker();
});

// Extend the String class with a function that 
String.prototype.toElapsedTime = function() {
	var sec_num = parseInt(this, 10);
	var hours 	= Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	
	var time = hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds';
	return time;
}

// function startMetafieldNuker() {
// 	try {
// 		// Get the current time so we can 
// 		var startTime = Date.now();
		
// 		// Get the namespace & logging setting
// 		var loggingEnabled = $('#logging').val();
// 		var targetNamespace = $('#namespace').val();
		
// 		// Build an array of product IDs and their child variant IDs
// 		var products = [];
		
// 		// Shopify has a limit of 250 objects per API call, so we need to know how
// 		// many products the store has. That will tell us how many calls we need to make
// 		var productCount;
// 		$.ajax({
// 			url: location.origin + "/admin/products/count.json",
// 			async: false,
// 			success: function(result) {
// 				productCount = result.count;
// 				// Print a message detailing how many products were found and on what store
// 				console.log("Found " + result.count + " products on " + location.origin);
// 			},
// 			error: function(result) {
// 				// Throw an error to bail out of the try block
// 				throw "Oops! Something happened getting the product count... Error: " + result.status + " (" + result.statusText + ")";
// 			}
// 		});
// 		// Figure out how many pages of products we need to pull
// 		var totalPages = 1;
// 		if (productCount > 250) {
// 			totalPages = Math.ceil(productCount / 250);
// 		}
		
// 		// Loop through the total page count to build out the entire product array
// 		for (var pageCount = 1; pageCount <= totalPages; pageCount++) {
// 			if (totalPages > 1) {
// 				console.log("Grabbing products in blocks of 250 at a time - Page " + pageCount + "...");
// 			} else {
// 				console.log("Grabbing products...")
// 			}
			
// 			$.ajax({
// 				url: location.origin + "/admin/products.json?fields=id,variants&limit=250&page=" + pageCount,
// 				dataType: "json",
// 				async: false,
// 				success: function(data) {
// 					// Loop through each product
// 					for (var i = 0; i < data.products.length; i++) {
// 						// Build an array of the variants for this product
// 						var variants = [];
// 						for (var o = 0; o < data.products[i].variants.length; o++) {
// 							variants.push({
// 								id: data.products[i].variants[o].id
// 							});
// 						}
						
// 						// Push the product ID and the variant array into the products array
// 						products.push({
// 							id: data.products[i].id,
// 							variants: variants
// 						});
// 					}
// 				},
// 				error: function(result) {
// 					// Throw an error to bail out of the try block
// 					throw "Oops! Something happened getting the products on page " + pageCount + "... Error: " + result.status + " (" + result.statusText + ")"
// 				}
// 			});
// 		}
		
// 		// Loop through each product and start checking for the metafields
// 		for (var i = 0; i < products.length; i++) {
// 			// Print the current product number compared to remaining
// 			console.log('  Starting nuker on product ID: ' + products[i].id + ' - (' + (i + 1) + '/' + productCount + ').');
// 			for (var o = 0; o < products[i].variants.length; o++) {
// 				// Print the variant ID that we're checking
// 				console.log('    Checking variant ID: ' + products[i].variants[o].id + ' for metafields in namespace: ' + targetNamespace + ' - (' + (o + 1) + '/' + products[i].variants.length + ')');
// 				$.ajax({
// 					url: location.origin + "/admin/variants/" + products[i].variants[o].id + "/metafields.json?fields=id,namespace",
// 					dataType: "json",
// 					async: false,
// 					success: function(data) {
// 						for (var p = 0; p < data.metafields.length; p++) {
// 							if (data.metafields[p].namespace == targetNamespace) {
// 								console.log('      Nuking metafields in namespace "' + targetNamespace + '" for variant ID: ' + products[i].variants[o].id);
// 								$.ajax({
// 									method: "DELETE",
// 									async: false,
// 									url: location.origin + "/admin/variants/" + products[i].variants[o].id + "/metafields/" + data.metafields[p].id + ".json",
// 									error: function(result) {
// 										throw "Oops! Something happened deleting the metafield... Error: " + result.status + " (" + result.statusText + ")";
// 									}
// 								});
// 							}
// 						}
// 					},
// 					error: function(result) {
// 						// Throw an error to bail out of the try block
// 						throw "Oops! Something happened getting the metafields for variant ID: " + products[i].variants[o].id + ". Error: " + result.status + " (" + result.statusText + ")";
// 					}
// 				});
// 			}
	
// 			// Print the product ID that we're checking
// 			console.log('    Checking product ID: ' + products[i].id + ' for metafields in namespace: ' + targetNamespace);
// 			$.ajax({
// 				url: location.origin + "/admin/products/" + products[i].id + "/metafields.json?fields=id,namespace",
// 				dataType: "json",
// 				async: false,
// 				success: function(data) {
// 					for (var p = 0; p < data.metafields.length; p++) {
// 						if (data.metafields[p].namespace == targetNamespace) {
// 							console.log('      Nuking metafields in namespace "' + targetNamespace + '" for product ID: ' + products[i].id);
// 							$.ajax({
// 								method: "DELETE",
// 								async: false,
// 								url: location.origin + "/admin/products/" + products[i].id + "/metafields/" + data.metafields[p].id + ".json",
// 								error: function(result) {
// 									throw "Oops! Something happened deleting the metafield... Error: " + result.status + " (" + result.statusText + ")";
// 								}
// 							});
// 						}
// 					}
// 				},
// 				error: function(result) {
// 					// Throw an error to bail out of the try block
// 					throw "Oops! Something happened getting the metafields for product ID: " + products[i].id + ". Error: " + result.status + " (" + result.statusText + ")";
// 				}
// 			});
// 			console.log('  Finished nuking current product...');
// 		}
		
// 		var finishTime = Date.now();
// 		var elapsedTime = (finishTime - startTime) / 1000;
// 		console.log('Job took ' + elapsedTime.toString().toElapsedTime() + ' to complete.')
// 	} catch(error) {
// 		console.log(error);
		
// 		var finishTime = Date.now();
// 		var elapsedTime = (finishTime - startTime) / 1000;
// 		console.log('Job ran for ' + elapsedTime.toString().toElapsedTime() + ' before failing.')
// 	}
// }

var startTime;
var finishTime;
var productCount;
var variantCount;
var targetNamespace;
var loggingEnabled;

function startMetafieldNuker() {
	// Get the current time so we can determine the job duration
	startTime = Date.now();

	// Get the namespace & logging setting
	targetNamespace = $('#namespace').val();
	loggingEnabled = $('#logging').val();
	
	getProductCount();
}

function getProductCount() {
	productCount = 0;
	variantCount = 0;
	
	// Shopify has a limit of 250 objects per API call, so we need to know how
	// many products the store has. That will tell us how many pages we need to request.
	$.ajax({
		url: location.origin + "/admin/products/count.json",
		success: function(result) {
		},
		error: function(result) {
			// Throw an error to bail out of the try block
			throw "Oops! Something happened getting the product count... Error: " + result.status + " (" + result.statusText + ")";
		}
	});
}

function getProductsByPage(productList, totalPages, pageIndex) {
}

function checkProducts(productList, productIndex, variantList, variantIndex) {
}

function deleteMetafield(objectType, objectId, metafieldId) {
}

function houseKeeping() {
}
