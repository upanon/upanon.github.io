var chartContainer = document.getElementById( 'tradingviewContainer' );

var buttonMonthly = document.getElementById( 'M' );
var buttonWeekly = document.getElementById( 'W' );
var buttonDaily = document.getElementById( 'D' );
var button4H = document.getElementById( '4H' );
var button1H = document.getElementById( '1H' );

var timeframe = "D";

const chart = LightweightCharts.createChart( chartContainer );

var greenColor = "#4bffb5";
var redColor = "#ff4976";

var candlestickSeries;

chart.applyOptions({ crosshair: { mode: LightweightCharts.CrosshairMode.Normal } });

chart.applyOptions({

	layout: { backgroundColor: "#1c283d", textColor: "#DDDDDD" },
	grid: { vertLines: { color: "#334158" }, horzLines: { color: "#334158" } },
	priceScale: { borderColor: "#485c7b" },
	timeScale: { borderColor: "#485158", timeVisible: true, secondsVisible: false }

 });

var currentChartData = [];

var stopUpdateLoop = false;

var resizeChart = function() {

	chart.resize( window.innerWidth * 0.92, window.innerHeight * 0.88 );

}

async function initChart() {

	window.addEventListener( 'resize', resizeChart );

	resizeChart();

	createCandlestickSerie();

	await getAllQuipuStorageHistory();

	var tickData = await getPriceHistoryFromStorageHistory();

	var candles = convertToCandle( tickData );

	currentChartData = candles;

	candlestickSeries.setData( candles );

	chart.timeScale().fitContent();

	await updateChartLoop();

}

async function resetChart() {

	stopUpdateLoop = true;

	chart.removeSeries( candlestickSeries );

	createCandlestickSerie();

	await updateQuipuStorageHistory();

	var tickData = await getPriceHistoryFromStorageHistory();

	tickData.reverse();

	var candles = convertToCandle( tickData );

	currentChartData = candles;

	candlestickSeries.setData( candles );

	chart.timeScale().fitContent();

	stopUpdateLoop = false;

	await updateChartLoop();

}

async function updateChart() {

	await updateQuipuStorageHistory();

	var tickData = await getPriceHistoryFromStorageHistory();

	tickData.reverse(); // BECAUSE APEXCHARTS ( LINECHART ) NEEDS A REVERSE ORDER AT UPDATE, SO WE HAVE TO RE_REVERSE IT

	var candles = convertToCandle( tickData );

	var lastCandle = candles[candles.length-1];

	for ( var i = 0; i < candles.length; i++ ) {

		if ( candles[i].time >= lastCandle.time ) {

			candlestickSeries.update( candles[i] );

		}

	}

	currentChartData = candles;

	//console.log( "Updated" );

}

async function updateChartLoop() {

	if ( stopUpdateLoop === false ) {

		updateChart();

		await sleep();

		await updateChartLoop();

	}

}

function createCandlestickSerie() {

	candlestickSeries = chart.addCandlestickSeries({

		downColor: redColor,
		upColor: greenColor,
		borderUpColor: greenColor,
		borderDownColor: redColor,
		wickDownColor: "#838ca1",
		wickUpColor: "#838ca1"

	});

	candlestickSeries.applyOptions({ priceFormat: { type: 'price', precision: 10, minMove: 0.0000000001 } });

	candlestickSeries.applyOptions({ color: '#2962FF' });

}

buttonMonthly.onclick = async function() {

	timeframe = "M";
	await resetChart();

};

buttonWeekly.onclick = async function() {

	timeframe = "W";
	await resetChart();

};

buttonDaily.onclick = async function() {

	timeframe = "D";
	await resetChart();

};

button4H.onclick = async function() {

	timeframe = "4H";
	await resetChart();

};

button1H.onclick = async function() {

	timeframe = "1H";
	await resetChart();

};

initChart();