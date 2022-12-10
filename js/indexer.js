var currentPrice;

var allQuipuStorageHistory = [];

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

		price = price.toFixed( 12 );
		var time = allQuipuStorageHistory[i].timestamp;

		var chartData = { x: time, y: price };

		priceHistory.push( chartData );

	}

	return priceHistory;

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