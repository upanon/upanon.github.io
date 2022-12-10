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