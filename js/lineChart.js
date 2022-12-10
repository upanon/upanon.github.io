var apexchart;

var lastZoom = null;

var chartOptions = {

	chart: {

		type: "area", // "area", "candlestick"
		stacked: false,
		height: "50%",
		zoom: { type: 'x', enabled: true, autoScaleYaxis: false },
		animations: { enabled: false },
		events: {

			beforeResetZoom: function () { lastZoom = null; },
			zoomed: function( chartContext, value ) { lastZoom = [ value.xaxis.min, value.xaxis.max ]; },
			click: function( event, chartContext, config ) { onClickOnChart( config.dataPointIndex ); },

		},

		toolbar: {

			autoSelected: 'zoom'

		}

	},
	
	dataLabels: { enabled: false },
	markers: { size: 0 },
	title: { text: 'Upsorber price', align: 'left' },
	grid: { row: { colors: [ "#f3f3f3", "transparent" ], opacity: 0 } },
	stroke: { show: true, curve: 'straight', lineCap: 'round', width: 2, dashArray: 0 },
	yaxis: { title: { text: 'Price in ꜩ' }, max: function( max ) { return max * 1.06 } },
	xaxis: { type: 'datetime' },
	annotations: {

		yaxis: [{ y: currentPrice, borderColor: '#004f8b', label: { style: { color: '#004f8b' }, text: '', position: "left", textAnchor: "start", offsetX: 10 } }],
		//xaxis: [{ x: Date.now(), borderColor: '#004f8b', label: { style: { color: '#004f8b' }, text: 'TODAY' } }]
		xaxis: []

	},

	tooltip: { intersect: false, shared: false },

};

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

	apexchart = new ApexCharts( document.querySelector( "#chart" ), chartOptions );
	apexchart.render();

	console.log( "Rendered" );

	await updateChartLoop();

}

async function updateChart() {

	await updateQuipuStorageHistory();

	var priceHistory = await getPriceHistoryFromStorageHistory();

	chartOptions.annotations.yaxis[0].y = currentPrice;
	chartOptions.annotations.yaxis[0].label.text = currentPrice.toFixed( 10 );

	apexchart.updateOptions({ series: [{ data: priceHistory }] });

	if ( lastZoom !== null ) {

		apexchart.zoomX( lastZoom[0], lastZoom[1] );

	}

	//console.log( "Updated" );

	await logGeneralData();

}

async function updateChartLoop() {

	updateChart();

	await sleep();

	await updateChartLoop();

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

initChart();