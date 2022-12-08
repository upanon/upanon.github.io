var currentPrice, chart;

var allQuipuStorageHistory = [];

var lastZoom = null;

var isCandle = false;

function sleep() {

	return new Promise( ( resolve ) => {

		setTimeout( resolve, 10 * 1000 );

	});

}

function format( number ) {

	return new Intl.NumberFormat().format( number );

}

function addDays( date, days ) {

	var result = new Date( date );
	result.setDate( result.getDate() + days );

	return result;

}

async function getAllQuipuStorageHistory() {

	var lastId = 0;

	await getStorageHistory( lastId );

	async function getStorageHistory( lastId ) {

		var response = await fetch( "https://api.tzkt.io/v1/contracts/KT1V4jaZpCwhfitTnUucY1EHiRfz3bjqznAU/storage/history?&limit=1000&lastId=" + lastId );
		var quipuData = await response.json();

		if ( quipuData.length > 0 ) {

			allQuipuStorageHistory = allQuipuStorageHistory.concat( quipuData );

			var newLastId = quipuData[quipuData.length-1].id;

			if ( newLastId !== lastId ) {

				lastId = newLastId;

				await getStorageHistory( lastId );

			}

		}

	}

	//allQuipuStorageHistory = [...new Set( allQuipuStorageHistory )]; // NOT NEEDED, NO DUPLICATES

}

async function updateQuipuStorageHistory() {

	var response = await fetch( "https://api.tzkt.io/v1/contracts/KT1V4jaZpCwhfitTnUucY1EHiRfz3bjqznAU/storage/history?&limit=100" );
	var quipuData = await response.json();

	allQuipuStorageHistory = allQuipuStorageHistory.concat( quipuData );

	allQuipuStorageHistory = [...new Set( allQuipuStorageHistory )];

	allQuipuStorageHistory.sort( ( a, b ) => a.id - b.id );

}

function getPriceFromStorage( storage ) {

	var price = storage.tez_pool / storage.token_pool / 1000000;

	return price;

}

function getPriceHistoryFromStorageHistory() {

	var priceHistory = [];

	for ( var i = 0; i < allQuipuStorageHistory.length; i++ ) {

		var price = getPriceFromStorage( allQuipuStorageHistory[i].value.storage );

		if ( i === allQuipuStorageHistory.length - 1 ) {

			currentPrice = price;

		}

		price = price.toFixed( 10 );
		var time = allQuipuStorageHistory[i].timestamp;

		var chartData = { x: time, y: price };

		priceHistory.push( chartData );

	}

	if ( isCandle === true ) {

		priceHistory = convertToCandle( priceHistory );

	}

	return priceHistory;

}

async function initChart() {

	await getAllQuipuStorageHistory();

	var series = [];

	var priceSerie = {};

	priceSerie.name = "Price";
	priceSerie.data = await getPriceHistoryFromStorageHistory();

	chartOptions.annotations.yaxis[0].y = currentPrice;
	chartOptions.annotations.yaxis[0].label.text = currentPrice.toFixed( 10 );

	series.push( priceSerie );

	// RENDER

	console.log( "Will render..." );

	chartOptions.series = series;

	chart = new ApexCharts( document.querySelector( "#chart" ), chartOptions );
	chart.render();

	console.log( "Rendered" );

	await updateChartLoop();

}

async function updateChart() {

	await updateQuipuStorageHistory();

	var priceHistory = await getPriceHistoryFromStorageHistory();

	chartOptions.annotations.yaxis[0].y = currentPrice;
	chartOptions.annotations.yaxis[0].label.text = currentPrice.toFixed( 10 );

	chart.updateOptions({ series: [{ data: priceHistory }] });

	if ( lastZoom !== null ) {

		chart.zoomX( lastZoom[0], lastZoom[1] );

	}

	//console.log( "Updated" );

	await logGeneralData();

}

async function updateChartLoop() {

	updateChart();

	await sleep();

	await updateChartLoop();

}

async function logGeneralData() {

	// FROM UPI

	var response = await fetch( "https://upi.upsorber.com/upsorbs" );
	var data = await response.json();

	var liqPoolResponse = await fetch( "https://upi.upsorber.com/liquidity" );
	var liqPoolData = await liqPoolResponse.json();

	var upLocked = data.up_locked;
	var upLockedWithEmittable = data.up_locked_with_emittable;
	var circulating = data.up_circulating;
	var inLiqPool = liqPoolData.up_in_liqpool;

	var total = upLockedWithEmittable + circulating;

	// LOG INFO

	var inner = "Circulating : " + format( circulating ) + " UP ( " + format( ( circulating * currentPrice ).toFixed( 2 ) ) + " ꜩ )";
	inner += "<br/>";

	inner += "Locked : " + format( upLocked ) + " UP ( " + format( ( upLocked * currentPrice ).toFixed( 2 ) ) + " ꜩ";
	inner += "<br/>";

	inner += "In liquidity pool : " + format( inLiqPool ) + " UP ( " + format( ( inLiqPool * currentPrice ).toFixed( 2 ) ) + " ꜩ )";
	inner += "<br/>";
	inner += "<br/>";

	// PERCENTS

	var percentCirculating = ( circulating * 100 ) / total;
	var percentLocked = ( upLocked * 100 ) / total;
	var percentInLiqPool = ( inLiqPool * 100 ) / total;

	inner += "Circulating : " + ( percentCirculating ).toFixed( 2 ) + "%";
	inner += "<br/>";
	inner += "Locked : " + ( percentLocked ).toFixed( 2 ) + "%";
	inner += "<br/>";
	inner += "In liquidity pool : " + ( percentInLiqPool ).toFixed( 2 ) + "%";
	inner += "<br/>";

	// 

	document.getElementById( "statics" ).innerHTML = inner;

}

async function onClickOnChart( dataPointIndex ) {

	// Get the storage history from the timestamp clicked on the chart

	var receiver = allQuipuStorageHistory[dataPointIndex].operation.parameter.value.receiver;

	var hash = allQuipuStorageHistory[dataPointIndex].operation.hash;

	var response = await fetch( "https://api.tzkt.io/v1/operations/transactions/" + hash );
	var transactionData = await response.json();

	if ( receiver[0] === "K" ) {

		// The receiver is the address that initiate the transaction

		receiver = transactionData[0].sender.address;

	}

	await logAddressData( dataPointIndex, receiver, hash, transactionData );

}

async function logAddressData( dataPointIndex, receiver, hash, transactionData ) {

	var storageHistory = allQuipuStorageHistory[dataPointIndex];

	// INNER HTML

	var inner = "Address : <a href='https://tzkt.io/" + receiver + "' target='_blank'>" + receiver + "</a><br/>";

	inner += "Transaction : <a href='https://tzkt.io/" + hash + "' target='_blank'>" + hash + "</a><br/>";

	if ( storageHistory.operation.parameter.entrypoint === "tezToTokenPayment" ) {

		inner += "Bought UP";

	} else if ( storageHistory.operation.parameter.entrypoint === "tokenToTezPayment" ) {

		inner += "Sold UP";

	}

	inner += "<br/>";
	inner += "<br/>";

	var responseBalance = await fetch( "https://api.tzkt.io/v1/accounts/" + receiver + "/balance" );
	var balanceData = await responseBalance.json();

	inner += "ꜩ in wallet : " + format( ( balanceData / 1000000 ).toFixed( 2 ) ) + " ꜩ";
	inner += "<br/>";

	// FROM UPI

	var responseFromUPI = await fetch( "https://upi.upsorber.com/upsorbers/?address=" + receiver );
	var dataFromUPI = await responseFromUPI.json();

	inner += "UP in wallet : " + format( dataFromUPI.wallet[0].upamount ) + " UP ( " + format( ( dataFromUPI.wallet[0].upamount * currentPrice ).toFixed( 2 ) ) + " ꜩ )";
	inner += "<br/>";
	inner += "<br/>";

	// TOTAL UPSORBED

	var totalUpsorbed = 0;
	var totalUnstakable = 0;

	var now = Date.now();

	for ( var i = 0; i < dataFromUPI.upsorbed.length; i++ ) {

		totalUpsorbed += Number( dataFromUPI.upsorbed[i].amount );

		// CHECK IF UNSTAKABLE

		var unstakableDate = addDays( dataFromUPI.upsorbed[i].stake_key, dataFromUPI.upsorbed[i].duration );

		if ( unstakableDate < now ) {

			totalUnstakable += Number( dataFromUPI.upsorbed[i].amount );

		}

	}

	var totalUpsorbedInTez = ( totalUpsorbed * currentPrice ).toFixed( 2 );
	var totalUnstakableInTez = ( totalUnstakable * currentPrice ).toFixed( 2 );

	inner += "Currently upsorbed : " + format( totalUpsorbed ) + " UP ( " + format( totalUpsorbedInTez ) + " ꜩ )";
	inner += "<br/>";

	inner += "Currently unstakable : " + format( totalUnstakable ) + " UP ( " + format( totalUnstakableInTez ) + " ꜩ )";;

	// 

	document.getElementById( "addresses" ).innerHTML = inner;

}

function addAnnotations( annotationsData ) {

	var toPush = { x: Date.now(), borderColor: '#004f8b', label: { style: { color: '#004f8b' }, text: 'TODAY' } };

	chart.addXaxisAnnotation( toPush, true );

}

async function switchToCandle() {

	isCandle = true;
	chart.updateSeries([{ type: "candlestick", fill: { type: "solid" } }]);

	await updateChart();

}

async function switchToLine() {

	isCandle = false;
	chart.updateSeries([{ type: "area", fill: { type: "gradient" } }]);

	await updateChart();

}

initChart();
