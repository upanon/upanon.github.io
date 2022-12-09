// ASSUME DATA ARE IN FORM [{ x: time, y: price }, { x: time, y: price }]
// WILL CONVERT TO [{ open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876 }]

function convertToCandle( data ) {

	var lastTimestamp = data[0].x;
	var firstTimestamp = data[data.length-1];

	var converted = [];

	for ( var i = 0; i < data.length; i++ ) {

		// SET AN ARRAY OF TICK DATA FOR EACH DAYS

		var time = new Date( data[i].x );
		time.setHours( 0, 0, 0, 0 );

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

	converted.reverse(); // TRADINGVIEW IS DIFFERENT FROM APEXCHART

	var ohlcVersion = [];

	for ( var i = 0; i < converted.length; i++ ) {

		var open = converted[i].ticks[0];
		var close = converted[i].ticks[converted[i].ticks.length-1];

		var sortedTicks = converted[i].ticks.sort();

		var low = sortedTicks[0];
		var high = sortedTicks[sortedTicks.length-1];

		var candle = {

			open: open,
			high: high,
			low: low,
			close: close,
			time: Math.floor( converted[i].time / 1000 ) // BECAUSE UTCTimestamp 

		}

		ohlcVersion.push( candle );

	}

	//console.log( ohlcVersion );

	return ohlcVersion;

}