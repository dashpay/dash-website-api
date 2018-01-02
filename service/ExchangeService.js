var request    = require('request');
var Async      = require('async');
var AppConfig  = require('../AppConfig');
var Cache      = require('./CacheRepository');
var Logger     = require('log');
var btcPrice   = null;
var krwUsd     = null;
var log = new Logger(AppConfig.logLevel);


var fetchExchangeData = function(exchange, url, callback){
	request.get(url, function (err, response, body) {
		console.log(body);
		if ( !err && response.statusCode == 200 ){
			try {
				callback(null, JSON.parse(body));
			}catch (e) {
				log.debug('ERROR parsing response from ' + exchange + '. Details: ' + e + '\nResponse::' + body);
				return callback(null, null);
			}
		}else if ( err ){
			log.debug('ERROR: fetching data from ' + exchange + ' (' + url + ') Details: ' + err + '. BODY=' + body, null);
			return callback(null, null);
		}else{
			log.debug('ERROR: unexpected response code (' + response.statusCode + ') from url=[' + url + '] Details: ' + body);
			return callback(null, null);
		}
	});
};

var fetchFromCoinCap = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.coincap.name + ' at ' + AppConfig.exchanges.coincap.url);
	fetchExchangeData(AppConfig.exchanges.coincap.name, AppConfig.exchanges.coincap.url, function(err, result){
		if ( err ){
			callback(err);
		} else if (result === null) {
			callback(null, null);
		}else{
			var data = {
				exchange: AppConfig.exchanges.coincap.name,
				url: AppConfig.exchanges.coincap.orgUrl,
				price: result[0].price_usd,
				volume: result[0]['24h_volume_usd'],
				percent_change: result[0].percent_change_24h,
				market_cap: result[0].market_cap_usd
			};
			callback(null, data);
		}
	});
};

var fetchFromCoinCapBtc = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.coincapbtc.name + ' at ' + AppConfig.exchanges.coincapbtc.url);
	fetchExchangeData(AppConfig.exchanges.coincapbtc.name, AppConfig.exchanges.coincapbtc.url, function(err, result){
		if ( err ){
			callback(err);
		} else if (result === null) {
			callback(null, null);
		}else{
			btcPrice = result[0].price_usd;
			var data ={
				btcPrice: result[0].price_usd
			}
			callback(null, data);
		}
	});
};

var fetchFromWorldCoinIndex = function(callback){

	var url = AppConfig.exchanges.worldcoin.url + '?key=' + AppConfig.exchanges.worldcoin.apiKey

	log.debug('Fetching exchange data from ' + AppConfig.exchanges.worldcoin.name + ' at ' + url);

	fetchExchangeData(AppConfig.exchanges.worldcoin.name, url, function(err, result){
		if ( err ){
			callback(err);
		} else if (result === null) {
			callback(null, null);
		}else{
			var dashResults = result.Markets.find(function (market) {
				return market.Name === "Dash";
			});
			if ( dashResults ){
				var data = {
					exchange: AppConfig.exchanges.worldcoin.name,
					url: AppConfig.exchanges.worldcoin.orgUrl,
					price: dashResults.Price_usd,
					volume: dashResults.Volume_24h,
					percent_change: -1
				};
				callback(null, data);
			}else{
				callback('Unable to find the Dash Market data in the response from WorldCoinIndex. Endpoint is [' + url + ']');
			}
			
		}
	});
};

var fetchFromKraken = function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.kraken.name + ' at ' + AppConfig.exchanges.kraken.url);
	fetchExchangeData(AppConfig.exchanges.kraken.name, AppConfig.exchanges.kraken.url, function(err, result){
		if ( err ){
			callback(err);
		} else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.kraken.name,
				url: AppConfig.exchanges.kraken.orgUrl,
				price: result.result.DASHUSD.c[0]
			};
			data.volume = result.result.DASHUSD.v[1]*data.price;
			fetchExchangeData(AppConfig.exchanges.kraken.name, AppConfig.exchanges.kraken.urlEur, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_eur'] = result.result.DASHEUR.c[0];
					fetchExchangeData(AppConfig.exchanges.kraken.name, AppConfig.exchanges.kraken.urlBTC, function(err, result){
						if ( err ){
							callback(err);
						}else{
							data['price_btc'] = result.result.DASHXBT.c[0];
							callback(null, data);
						}
					});
				}
			});
		}
	});
};

var fetchFromPoloniex = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.poloniex.name + ' at ' + AppConfig.exchanges.poloniex.url);
	fetchExchangeData(AppConfig.exchanges.poloniex.name, AppConfig.exchanges.poloniex.url, function(err, result){
		if ( err ){
			callback(err);
		} else if (result === null) {
			callback(null, null);
		}else{
			var data = {
				exchange: AppConfig.exchanges.poloniex.name,
				url: AppConfig.exchanges.poloniex.orgUrl,
				price_btc: result.poloniex.DASH_BTC
			};
			callback(null, data);
		}
	});
};

var fetchFromBittrex= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.bittrex.name + ' at ' + AppConfig.exchanges.bittrex.url);
	fetchExchangeData(AppConfig.exchanges.bittrex.name, AppConfig.exchanges.bittrex.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.bittrex.name,
				url: AppConfig.exchanges.bittrex.orgUrl,
				price_btc: result.result[0].Last
			};
			data.volume = result.result[0].Volume*data.price;
			//fetching ETH price
			fetchExchangeData(AppConfig.exchanges.bittrex.name, AppConfig.exchanges.bittrex.urlEth, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_eth'] = result.result[0].Last;
					callback(null, data);
				}
			});
		}
	});

};

var fetchFromBitfinex = function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.bitfinex.name + ' at ' + AppConfig.exchanges.bitfinex.url);
	fetchExchangeData(AppConfig.exchanges.bitfinex.name, AppConfig.exchanges.bitfinex.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.bitfinex.name,
				url: AppConfig.exchanges.bitfinex.orgUrl,
				price: result.last_price
			};
			data.volume = result.volume*data.price;
			//fetching BTC price
			fetchExchangeData(AppConfig.exchanges.bitfinex.name, AppConfig.exchanges.bitfinex.urlBTC, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_btc'] = result.last_price
					callback(null, data);
				}
			});
		}
	});

};

var fetchFromHitbtc= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.hitbtc.name + ' at ' + AppConfig.exchanges.hitbtc.url);
	fetchExchangeData(AppConfig.exchanges.hitbtc.name, AppConfig.exchanges.hitbtc.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.hitbtc.name,
				url: AppConfig.exchanges.hitbtc.orgUrl,
				price: result.last,
			};
			data.volume = result.volume*data.price;
			//Fetch BTC
			fetchExchangeData(AppConfig.exchanges.hitbtc.name, AppConfig.exchanges.hitbtc.urlBTC, function(err, result){
				if ( err ){
					callback(err);
				}else{
					data['price_btc'] = result.last;
					callback(null, data);
				}
			});
		}
	});

};

var fetchFromLivecoin= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.livecoin.name + ' at ' + AppConfig.exchanges.livecoin.url);
	fetchExchangeData(AppConfig.exchanges.livecoin.name, AppConfig.exchanges.livecoin.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.livecoin.name,
				url: AppConfig.exchanges.livecoin.orgUrl,
				price: result.last
			};
			data.volume = result.volume*data.price;
			// Fetching BTC price
			fetchExchangeData(AppConfig.exchanges.livecoin.name, AppConfig.exchanges.livecoin.urlBTC, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_btc'] = result.last;
					callback(null, data);
				}
			});
		}
	});
};

var fetchFromExmo= function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.exmo.name + ' at ' + AppConfig.exchanges.exmo.url);
	fetchExchangeData(AppConfig.exchanges.exmo.name, AppConfig.exchanges.exmo.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			var data = {
				exchange: AppConfig.exchanges.exmo.name,
				url: AppConfig.exchanges.exmo.orgUrl,
				price: result.DASH_USD.last_trade,
				price_btc: result.DASH_BTC.last_trade,
				volume: result.DASH_USD.vol_curr,
			};
			callback(null, data);
		}
	});
};

var fetchFromYobit= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.yobit.name + ' at ' + AppConfig.exchanges.yobit.url);
	fetchExchangeData(AppConfig.exchanges.yobit.name, AppConfig.exchanges.yobit.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.yobit.name,
				url: AppConfig.exchanges.yobit.orgUrl,
				price: result.dash_usd.last
			};
			data.volume = result.dash_usd.vol*data.price;
			fetchExchangeData(AppConfig.exchanges.yobit.name, AppConfig.exchanges.yobit.urlBTC, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_btc'] = result.dash_btc.last;
					fetchExchangeData(AppConfig.exchanges.yobit.name, AppConfig.exchanges.yobit.urlRur, function(err, result){
						if ( err ){
							callback(err);
						}else if (result === null) {
							callback(null, null);
						}else{
							data['price_rur'] = result.dash_rur.last;
							callback(null, data);
						}
					});
				}
			});
		}
	});
};

var fetchFromCcex= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.ccex.name + ' at ' + AppConfig.exchanges.ccex.url);
	fetchExchangeData(AppConfig.exchanges.ccex.name, AppConfig.exchanges.ccex.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.ccex.name,
				url: AppConfig.exchanges.ccex.orgUrl,
				price: result.ticker.lastprice,
			};
			// Fetching BTC price
			fetchExchangeData(AppConfig.exchanges.ccex.name, AppConfig.exchanges.ccex.urlBTC, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_btc'] = result.ticker.lastprice;
					callback(null, data);
				}
			});
		}
	});

};

var fetchFromCexio= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.cexio.name + ' at ' + AppConfig.exchanges.cexio.url);
	fetchExchangeData(AppConfig.exchanges.cexio.name, AppConfig.exchanges.cexio.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			data = {
				exchange: AppConfig.exchanges.cexio.name,
				url: AppConfig.exchanges.cexio.orgUrl,
				price: result.lprice,
			};
			fetchExchangeData(AppConfig.exchanges.cexio.name, AppConfig.exchanges.cexio.urlEur, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					data['price_eur'] = result.lprice;
					fetchExchangeData(AppConfig.exchanges.cexio.name, AppConfig.exchanges.cexio.urlBTC, function(err, result){
						if ( err ){
							callback(err);
						}else if (result === null) {
							callback(null, null);
						}else{
							data['price_btc'] = result.lprice;
							callback(null, data);
						}
					});
				}
			});
		}
	});


};

var fetchFromBithumb= function(callback){
	fetchExchangeData(AppConfig.exchanges.yahoofinance.name, AppConfig.exchanges.yahoofinance.url, function(err, result){
		if ( err ){
			callback(err);
		}else if (result === null) {
			callback(null, null);
		}else{
			krwUsd = result.query.results.rate.Rate;
			fetchExchangeData(AppConfig.exchanges.bithumb.name, AppConfig.exchanges.bithumb.url, function(err, result){
				if ( err ){
					callback(err);
				}else if (result === null) {
					callback(null, null);
				}else{
					var data = {
						exchange: AppConfig.exchanges.bithumb.name,
						url: AppConfig.exchanges.bithumb.orgUrl,
						price: result.data.closing_price*krwUsd,
					};
					data.volume = result.data.volume_1day*data.price;
					callback(null, data);
				}
			});
		}
	});


};

var fetchAll = function(callback){
	var callstack = [];

	Cache.getExchangeData(function(err, data){
		if ( err ){
			callback(err);
		}else{
			
			if ( data === undefined ){

				console.log('Latest exchange data not found in cache.');

				callstack.push(fetchFromCoinCapBtc);
				callstack.push(fetchFromWorldCoinIndex);
				callstack.push(fetchFromCoinCap);
				callstack.push(fetchFromKraken);
				callstack.push(fetchFromBittrex);
				callstack.push(fetchFromBitfinex);
				callstack.push(fetchFromHitbtc);
				//callstack.push(fetchFromBithumb);
				callstack.push(fetchFromLivecoin);
				callstack.push(fetchFromExmo);
				callstack.push(fetchFromYobit);
				callstack.push(fetchFromPoloniex);
				callstack.push(fetchFromCcex);
				//callstack.push(fetchFromCexio);
				Async.parallel(callstack, function(err, result){
					Cache.storeExchangeData(result);
					callback(err,result);
				});

			}else{
				log.debug('Using exchange data found in cache.');
				callback(null,data);
			}
		}
	});

};

module.exports = {
	fetchFromCoinCapBtc: fetchFromCoinCapBtc,
	fetchFromCoinCap: fetchFromCoinCap,
	fetchFromWorldCoinIndex: fetchFromWorldCoinIndex,
	fetchFromKraken: fetchFromKraken,
	fetchFromPoloniex: fetchFromBittrex,
	fetchFromBitfinex: fetchFromBitfinex,
	fetchFromHitbtc: fetchFromHitbtc,
	fetchFromBithumb: fetchFromBithumb,
	fetchFromLivecoin: fetchFromLivecoin,
	fetchFromExmo: fetchFromExmo,
	fetchFromYobit: fetchFromYobit,
	fetchFromCcex: fetchFromCcex,
	fetchAll: fetchAll
}