document.querySelector('html').classList.add('nukerJSoverride');
document.querySelector('body').innerHTML += ('<div id="nukerJSbar" class="fadein"></div>');
document.querySelector('#nukerJSbar').innerHTML += ('<div class="wrapper clearfix"></div>');
document.querySelector('#nukerJSbar .wrapper').innerHTML += ('<ul id="nukerJSnav"></ul>');
document.querySelector('#nukerJSnav').innerHTML += ('<li><a id="bn_about">About Nuker</a></li>');
document.querySelector('#nukerJSnav').innerHTML += ('<li class="hidden"></li>');
document.querySelector('#nukerJSnav').innerHTML += ('<li><select id="ns-selector"></select></li>');
document.querySelector('#ns-selector').innerHTML += ('<option value="bold_measurement">Buy the Measurement</option>');
document.querySelector('#ns-selector').innerHTML += ('<option value="shappify_csp">Customer Pricing</option>');
document.querySelector('#ns-selector').innerHTML += ('<option value="csp">New Customer Pricing</option>');
document.querySelector('#ns-selector').innerHTML += ('<option value="shappify_bundle">Product Bundles</option>');
document.querySelector('#ns-selector').innerHTML += ('<option value="inventory">Product Discount</option>');
document.querySelector('#ns-selector').innerHTML += ('<option value="shappify_qb">Quantity Breaks</option>');

document.querySelector('#ns-selector').innerHTML += ('<option value="bold_rp">Recurring Orders</option>');


document.querySelector('#nukerJSnav').innerHTML += ('<li><a id="bn_nuke">Nuke Metafields</a></li>');
document.querySelector('#nukerJSnav').innerHTML += ('<li><a id="bn_settings">Settings</a></li>');
document.querySelector('#nukerJSnav').innerHTML += ('<li></li>');
document.querySelector('#nukerJSbar .wrapper').innerHTML += ('<input type="hidden" id="namespace" value="bold_measurement">');
document.querySelector('#nukerJSbar .wrapper').innerHTML += ('<input type="hidden" id="logging" value="true">');

document.querySelector('#ns-selector').addEventListener('change', function () {
	document.querySelector("#namespace").value = document.querySelector("#ns-selector").value;
});
document.querySelector('#bn_nuke').addEventListener('click', function () {
	startMetafieldNuker();
});

// Extend the String class with a function that 
String.prototype.toElapsedTime = function () {
	var sec_num = parseInt(this, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	var time = hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds';
	return time;
}

var BOLD = BOLD || {};
BOLD.metafieldNuker = {
	startTime: null,
	finishTime: null,
	productCount: null,
	variantCount: null,
	targetNamespace: null,
	loggingEnabled: null,
	totalPages: null,
	productList: null,
	pageIndex: null,
	variantList: null,
	variantIndex: null,
	productIndex: null

}

function startMetafieldNuker() {
	// Get the current time so we can determine the job duration
	BOLD.metafieldNuker.startTime = Date.now();

	// Get the namespace & logging setting
	BOLD.metafieldNuker.targetNamespace = document.querySelector('#namespace').value;
	console.log("Target Namespace: " + BOLD.metafieldNuker.targetNamespace);
	BOLD.metafieldNuker.loggingEnabled = document.querySelector('#logging').value;

	getProductCount();
}

function getProductCount() {
	BOLD.metafieldNuker.productCount = 0;
	BOLD.metafieldNuker.variantCount = 0;


	// Shopify has a limit of 250 objects per API call, so we need to know how
	// many products the store has. That will tell us how many pages we need to request.
	var xhr = new XMLHttpRequest();
	xhr.open('GET', location.origin + "/admin/products/count.json");
	xhr.send();

	xhr.onreadystatechange = function (e) {
		if (xhr.readyState == 2) {
			console.log("Sending Request in progress");

		} else if (xhr.readyState == 3) {
			//request completed, error?
			if (xhr.status == 200) {
				BOLD.metafieldNuker.productCount = JSON.parse(xhr.response).count;
				// Print a message detailing how many products were found and on what store
				console.log("Found " + BOLD.metafieldNuker.productCount + " products on " + location.origin);
				BOLD.metafieldNuker.totalPages = 1;

				// Figure out how many pages of products we need to pull
				if (BOLD.metafieldNuker.productCount > 250) {
					BOLD.metafieldNuker.totalPages = Math.ceil(BOLD.metafieldNuker.productCount / 250);
				}

				BOLD.metafieldNuker.productList = [];
				BOLD.metafieldNuker.pageIndex = 1;
				getProductsByPage(BOLD.metafieldNuker.pageIndex);
			} else {
				// Throw an error to bail out of the try block
				throw "Oops! Something happened getting the product count... Error: " + xhr.response;
			}
		}
	}
}

function getProductsByPage() {
	// Loop through the total page count to build out the entire product array
	if (BOLD.metafieldNuker.pageIndex <= BOLD.metafieldNuker.totalPages) {
		// If there are multiple pages, log which page we're grabbing.
		if (BOLD.metafieldNuker.totalPages > 1) {
			console.log("Grabbing products in blocks of 250 at a time - Page " + BOLD.metafieldNuker.pageIndex + "...");
		} else {
			console.log("Grabbing products...");
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', location.origin + "/admin/products.json?fields=id,variants&limit=250&page=" + BOLD.metafieldNuker.pageIndex);
		xhr.setRequestHeader('data-type', 'json')
		xhr.send();

		// Get the products for the current page
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 2) {
				console.log("Sending Request in progress");

			} else if (xhr.readyState == 3) {
				//request completed, error?
				if (xhr.status == 200) {
					var data = JSON.parse(xhr.response)["products"];

					// Loop through each product
					for (var i = 0; i < data.length; i++) {
						// Build an array of the variants for this product
						var variants = [];
						for (var o = 0; o < data[i].variants.length; o++) {
							variants.push({
								id: data[i].variants[o].id
							});
							BOLD.metafieldNuker.variantCount++;
						}

						// Push the product ID and the variant array into the products array
						BOLD.metafieldNuker.productList.push({
							id: data[i].id,
							variants: variants
						});
					}

					BOLD.metafieldNuker.pageIndex++;
					getProductsByPage(BOLD.metafieldNuker.pageIndex);

				} else {
					// Throw an error to bail out of the try block
					throw "Oops! Something happened getting the product list... Error: " + xhr.response;
				}
			}
		}
	} else {
		// We have all the products, lets go forward.
		BOLD.metafieldNuker.variantList = null;
		BOLD.metafieldNuker.productIndex = 0;
		BOLD.metafieldNuker.variantIndex = 0;
		checkProducts();
		console.log("MOVING ON!!!");
	}
}

function checkProducts() {

	// Loop through each product and start checking for the metafields
	if (BOLD.metafieldNuker.productIndex < BOLD.metafieldNuker.productList.length) {
		if (BOLD.metafieldNuker.variantList == null) {
			BOLD.metafieldNuker.variantList = BOLD.metafieldNuker.productList[BOLD.metafieldNuker.productIndex].variants;
		}

		if (BOLD.metafieldNuker.variantIndex < BOLD.metafieldNuker.variantList.length) {
			// Print the variant ID that we're checking
			console.log('%c    Checking variant ID: ' + BOLD.metafieldNuker.variantList[BOLD.metafieldNuker.variantIndex].id + ' for metafields in namespace: ' + BOLD.metafieldNuker.targetNamespace + ' - (' + (BOLD.metafieldNuker.variantIndex + 1) + '/' + BOLD.metafieldNuker.variantList.length + ')', "background:blue;color:white");

			var xhr = new XMLHttpRequest();
			xhr.open('GET', location.origin + "/admin/variants/" + BOLD.metafieldNuker.variantList[BOLD.metafieldNuker.variantIndex].id + "/metafields.json?fields=id,namespace");
			xhr.setRequestHeader('data-type', 'json')

			xhr.send();

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 2) {

				} else if (xhr.readyState == 3) {
					//request completed, error?
					if (xhr.status == 200) {
						var data = JSON.parse(xhr.response)["metafields"];

						for (var m = 0; m < data.length; m++) {

							console.log(data[m].namespace);
							console.log(BOLD.metafieldNuker.targetNamespace);

							if (data[m].namespace == BOLD.metafieldNuker.targetNamespace) {
								// Delete the metafield
								deleteMetafield("variant", BOLD.metafieldNuker.variantList[BOLD.metafieldNuker.variantIndex].id, data[m].id);
							}
						}

						BOLD.metafieldNuker.variantIndex++;
						checkProducts();

					} else {
						// Throw an error to bail out of the try block
						throw "Oops! Something happened getting the metafields for variant ID: " + BOLD.metafieldNuker.productList[BOLD.metafieldNuker.productIndex].variants[o].id + ". Error: " + result.status + " (" + result.statusText + ")";
					}
				}
			}
		} else {
			// Print the product ID that we're checking
			console.log('%c  Checking product ID: ' + BOLD.metafieldNuker.productList[BOLD.metafieldNuker.productIndex].id + ' for metafields in namespace: ' + BOLD.metafieldNuker.targetNamespace, "background:green;color:white");


			var xhr = new XMLHttpRequest();
			xhr.open('GET', location.origin + "/admin/products/" + BOLD.metafieldNuker.productList[BOLD.metafieldNuker.productIndex].id + "/metafields.json?fields=id,namespace");
			xhr.setRequestHeader('data-type', 'json')

			xhr.send();

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 2) {

				} else if (xhr.readyState == 3) {
					//request completed, error?
					if (xhr.status == 200) {
						var data = JSON.parse(xhr.response)["metafields"];

						for (var m = 0; m < data.length; m++) {
							if (data[m].namespace == BOLD.metafieldNuker.targetNamespace) {
								// Delete the metafield
								deleteMetafield("product", BOLD.metafieldNuker.productList[BOLD.metafieldNuker.productIndex].id, data[m].id);
							}
						}

						BOLD.metafieldNuker.productIndex++;
						BOLD.metafieldNuker.variantList = null;
						BOLD.metafieldNuker.variantIndex = 0
						checkProducts();
					} else {
						// Throw an error to bail out of the try block
						throw "Oops! Something happened getting the metafields for product ID: " + BOLD.metafieldNuker.productList[BOLD.metafieldNuker.productIndex].id + ". Error: " + result.status + " (" + result.statusText + ")";
					}
				}
			}
		}
	} else {
		// We're done!
		console.log('  Finished nuking current product...');
		houseKeeping();
	}
}

function deleteMetafield(objectType, objectId, metafieldId) {

	var csrfToken = null;
	if (document.querySelector('meta[name=csrf-token]')) {
		csrfToken = document.querySelector('meta[name=csrf-token]').getAttribute('content');
	}
	else{
		throw "Csrf meta tag element is non existant, either you're not on the 'All products' admin page or Shopify did a dumb"
	}

	var xhr = new XMLHttpRequest();

	xhr.open('DELETE', "/admin/api/2019-07/products/" + objectId + "/metafields/" + metafieldId + ".json");

	xhr.setRequestHeader("x-csrf-token", csrfToken);

	xhr.send();

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 2) {

		} else if (xhr.readyState == 3) {
			//request completed, error?
			if (xhr.status == 200) {
				console.log('%c      Nuked metafield ID ' + metafieldId + ' in namespace "' + BOLD.metafieldNuker.targetNamespace + '" for ' + objectType + ' ID: ' + objectId, "background:darkred;color:white");

			} else {
				// Throw an error to bail out of the try block
				throw "Oops! Something happened deleting the metafield... Error: " + result.status + " (" + result.statusText + ")";
			}
		}
	}
}

function houseKeeping() {
	finishTime = Date.now();
	var elapsedTime = (BOLD.metafieldNuker.finishTime - BOLD.metafieldNuker.startTime) / 1000;
	console.log('Finished checking ' + BOLD.metafieldNuker.variantCount + ' variants.');
	console.log('Job took ' + elapsedTime.toString().toElapsedTime() + ' to complete.');
}