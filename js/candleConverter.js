// ASSUME DATA ARE IN FORM [{ x: time, y: price }, { x: time, y: price }]
// WILL CONVERT TO [{ open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876 }]

function setToDaily( timeData ) {

	var time = new Date( timeData );
	time.setHours( 0, 0, 0, 0 );

	return time;

}

function setToOneHour( timeData ) {

	var time = new Date( timeData );
	time.setMinutes( 0, 0, 0 );

	return time;

}

function convertToCandle( data ) {

	var lastTimestamp = data[0].x;
	var firstTimestamp = data[data.length-1];

	var converted = [];

	for ( var i = 0; i < data.length; i++ ) {

		// SET AN ARRAY OF TICK DATA FOR EACH DAYS

		var time;

		if ( timeframe === "D" ) {

			time = setToDaily( data[i].x );

		} else if ( timeframe === "1H" ) {

			time = setToOneHour( data[i].x );

		}

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

	converted.sort( ( a, b ) => a.time - b.time ); // TRADINGVIEW IS DIFFERENT FROM APEXCHART, WILL SET TO ASCENDANT ORDER

	//converted.reverse();  // SAME BUT LESS ACCURATE

	//console.log( converted );

	var ohlcVersion = [];

	for ( var i = 0; i < converted.length; i++ ) {

		converted[i].ticks.reverse();

		var close = converted[i].ticks[converted[i].ticks.length-1];

		//var open = converted[i].ticks[0];

		if ( i > 0 ) {

			var previousTicks = converted[i-1].ticks;

			var previousClose = previousTicks[previousTicks.length-1];

			//open = previousClose;

			//converted[i].ticks.push( previousClose ); // TO AVOID HUGE WICK

			//open = ohlcVersion[i-1].close;

			converted[i].ticks.unshift( previousClose );

		}

		var open = converted[i].ticks[0];

		var sortedTicks = [...converted[i].ticks].sort(); // [...arr].sort();

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