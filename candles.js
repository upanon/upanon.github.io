// ASSUME DATA ARE IN FORM [{ x: time, y: price }, { x: time, y: price }]

function convertToCandle( data ) {

	var lastTimestamp = data[0].x;
	var firstTimestamp = data[data.length-1];

	var converted = [];

	for ( var i = 0; i < data.length; i++ ) {

		// SET AN ARRAY OF TICK DATA FOR EACH DAYS

		var time = new Date( data[i].x );
		time.setHours( 12, 0, 0, 0 );

		var candleFound = converted.find( x => x.time.getTime() === time.getTime() );

		if ( typeof candleFound === "undefined" ) {

			var candle = { time: time, ticks: [] };

			candle.ticks.push( data[i].y );

			converted.push( candle );

		} else {

			candleFound.ticks.push( data[i].y );

		}

	}

	//console.log( converted );

	// GET THE OHLC FOR EACH CANDLE

	var ohlcVersion = [];

	for ( var i = 0; i < converted.length; i++ ) {

		var open = converted[i].ticks[0];
		var close = converted[i].ticks[converted[i].ticks.length-1];

		var sortedTicks = converted[i].ticks.sort();

		var low = sortedTicks[0];
		var high = sortedTicks[sortedTicks.length-1];

		var candle = {

			x: converted[i].time,
			y: [ open, high, low, close ]

		}

		ohlcVersion.push( candle );

	}

	//console.log( ohlcVersion );

	return ohlcVersion;

}