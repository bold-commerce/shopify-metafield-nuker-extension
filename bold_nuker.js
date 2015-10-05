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
$('#nukerJSbar .wrapper').append('<input type="hidden" id="namespace" value="bold_measurement">');
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
			// Store the product count globally
			productCount = result.count;
			
			// Print a message detailing how many products were found and on what store
			console.log("Found " + productCount + " products on " + location.origin);
			
			// Figure out how many pages of products we need to pull
			var totalPages = 1;
			if (productCount > 250) {
				totalPages = Math.ceil(productCount / 250);
			}
			
			var productList = [];
			getProductsByPage(productList, totalPages, 1);
		},
		error: function(result) {
			// Throw an error to bail out of the try block
			throw "Oops! Something happened getting the product count... Error: " + result.status + " (" + result.statusText + ")";
		}
	});
}

function getProductsByPage(productList, totalPages, pageIndex) {
	// Loop through the total page count to build out the entire product array
	if (pageIndex <= totalPages) {
		// If there are multiple pages, log which page we're grabbing.
		if (totalPages > 1) {
			console.log("Grabbing products in blocks of 250 at a time - Page " + pageIndex + "...");
		} else {
			console.log("Grabbing products...")
		}
		
		// Get the products for the current page
		$.ajax({
			url: location.origin + "/admin/products.json?fields=id,variants&limit=250&page=" + pageIndex,
			dataType: "json",
			success: function(data) {
				// Loop through each product
				for (var i = 0; i < data.products.length; i++) {
					// Build an array of the variants for this product
					var variants = [];
					for (var o = 0; o < data.products[i].variants.length; o++) {
						variants.push({
							id: data.products[i].variants[o].id
						});
						variantCount++;
					}
					
					// Push the product ID and the variant array into the products array
					productList.push({
						id: data.products[i].id,
						variants: variants
					});
				}
				
				pageIndex++;
				getProductsByPage(productList, totalPages, pageIndex);
			},
			error: function(result) {
				// Throw an error to bail out of the try block
				throw "Oops! Something happened getting the products on page " + pageIndex + "... Error: " + result.status + " (" + result.statusText + ")"
			}
		});
	} else {
		// We have all the products, lets go forward.
		checkProducts(productList, 0, null, 0);
	}
}

function checkProducts(productList, productIndex, variantList, variantIndex) {
	// Loop through each product and start checking for the metafields
	if (productIndex < productList.length) {
		if (variantList == null) {
			variantList = productList[productIndex].variants;
		}
		
		if (variantIndex < variantList.length) {
			// Print the variant ID that we're checking
			console.log('    Checking variant ID: ' + variantList[variantIndex].id + ' for metafields in namespace: ' + targetNamespace + ' - (' + (variantIndex + 1) + '/' + variantList.length + ')');
			$.ajax({
				url: location.origin + "/admin/variants/" + variantList[variantIndex].id + "/metafields.json?fields=id,namespace",
				dataType: "json",
				success: function(data) {
					for (var m = 0; m < data.metafields.length; m++) {
						if (data.metafields[m].namespace == targetNamespace) {
							// Delete the metafield
							deleteMetafield("variant", variantList[variantIndex].id, data.metafields[m].id);
						}
					}
					
					variantIndex++;
					checkProducts(productList, productIndex, variantList, variantIndex);
				},
				error: function(result) {
					// Throw an error to bail out of the try block
					throw "Oops! Something happened getting the metafields for variant ID: " + productList[productIndex].variants[o].id + ". Error: " + result.status + " (" + result.statusText + ")";
				}
			});
		} else {
			// Print the product ID that we're checking
			console.log('    Checking product ID: ' + productList[productIndex].id + ' for metafields in namespace: ' + targetNamespace);
			$.ajax({
				url: location.origin + "/admin/products/" + productList[productIndex].id + "/metafields.json?fields=id,namespace",
				dataType: "json",
				success: function(data) {
					for (var m = 0; m < data.metafields.length; m++) {
						if (data.metafields[m].namespace == targetNamespace) {
							// Delete the metafield
							deleteMetafield("product", productList[productIndex].id, data.metafields[m].id);
						}
					}
					
					productIndex++;
					checkProducts(productList, productIndex, null, 0);
				},
				error: function(result) {
					// Throw an error to bail out of the try block
					throw "Oops! Something happened getting the metafields for product ID: " + productList[productIndex].id + ". Error: " + result.status + " (" + result.statusText + ")";
				}
			});
		}
	} else {
		// We're done!
		console.log('  Finished nuking current product...');
		houseKeeping();
	}
}

function deleteMetafield(objectType, objectId, metafieldId) {
	$.ajax({
		method: "DELETE",
		url: location.origin + "/admin/" + objectType + "/" + objectId + "/metafields/" + metafieldId + ".json",
		success: function(result) {
			console.log('      Nuked metafield ID ' + metafieldId + ' in namespace "' + targetNamespace + '" for ' + objectType + ' ID: ' + objectId);
		},
		error: function(result) {
			throw "Oops! Something happened deleting the metafield... Error: " + result.status + " (" + result.statusText + ")";
		}
	});
}

function houseKeeping() {
	finishTime = Date.now();
	var elapsedTime = (finishTime - startTime) / 1000;
	console.log('Finished checking ' + variantCount + ' variants.');
	console.log('Job took ' + elapsedTime.toString().toElapsedTime() + ' to complete.');
}
