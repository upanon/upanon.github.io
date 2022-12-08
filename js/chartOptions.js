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

			autoSelected: 'zoom',
			tools: {

				customIcons: [

					{

						icon: '<img src="assets/candlestick.png" width="20">',
						index: -7,
						title: 'Switch to candlestick',
						class: 'custom-icon',
						click: function ( chart, options, e ) {

		  					switchToCandle();

						}

					},

					{

						icon: '<img src="assets/line.png" width="20">',
						index: -7,
						title: 'Switch to line',
						class: 'custom-icon',
						click: function ( chart, options, e ) {

		  					switchToLine();

						}

					}
					
				]

			}

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