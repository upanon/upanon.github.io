var chartContainer = document.getElementById( 'tradingviewContainer' );

const chart = LightweightCharts.createChart( chartContainer );
const candlestickSeries = chart.addCandlestickSeries({
	downColor: "#4bffb5",
	upColor: "#ff4976",
	borderUpColor: "#ff4976",
	borderDownColor: "#4bffb5",
	wickDownColor: "#838ca1",
	wickUpColor: "#838ca1"
});

candlestickSeries.applyOptions({ priceFormat: { type: 'price', precision: 10, minMove: 0.0000000001 } });
chart.applyOptions({ crosshair: { mode: LightweightCharts.CrosshairMode.Normal } });

candlestickSeries.applyOptions({ color: '#2962FF' });

chart.applyOptions({

	layout: { backgroundColor: "#1c283d", textColor: "#DDDDDD" },
	grid: { vertLines: { color: "#334158" }, horzLines: { color: "#334158" } },
	priceScale: { borderColor: "#485c7b" },
	timeScale: { borderColor: "#485158" }

 });

var resizeChart = function() {

	chart.resize( window.innerWidth * 0.92, window.innerHeight * 0.88 );

}

async function initChart() {

	window.addEventListener( 'resize', resizeChart );

	resizeChart();

	await getAllQuipuStorageHistory();

	var tickData = await getPriceHistoryFromStorageHistory();

	var candles = convertToCandle( tickData );

	candlestickSeries.setData( candles );

	chart.timeScale().fitContent();

	await updateChartLoop();

}

async function updateChart() {

	await updateQuipuStorageHistory();

	var tickData = await getPriceHistoryFromStorageHistory();

	var candles = convertToCandle( tickData );

	//candlestickSeries.setData( candles );

}

async function updateChartLoop() {

	updateChart();

	await sleep();

	await updateChartLoop();

}

initChart();