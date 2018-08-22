var request   = require('request');
var AppConfig = require('../AppConfig');
var Cache     = require('./CacheRepository');
var Logger    = require('log');

var log = new Logger(AppConfig.logLevel);

var fetchBudgetsData = function(budgetSource, url, callback){

	request.get(url, function (err, response, body) {
		if ( !err && response.statusCode == 200 ){

			try {
	            callback(null, JSON.parse(body));
	        }catch (e) {
	            return callback('ERROR parsing response from ' + budgetSource + '. Details: ' + e + '\nResponse::' + body, null);
	        }

		}else if ( err ){
            return callback('ERROR: fetching data from ' + budgetSource + ' (' + url + ') Details: ' + err, null);
        }else{
        	return callback('ERROR: unexpected response code (' + response.statusCode + ') from url=[' + url + '] Details: ' + body, null);
        }
	});
};

var fetchDashBudgetsData = function(callback){

	Cache.getBudgetsData(function(err, data){
		if ( err ){
			callback(err);
		}else{

			if ( data === undefined ){
				log.debug('Budgets not found in cache.');
				log.debug('Fetching budgets from ' + AppConfig.budgets.dashCentral.name + ' at ' + AppConfig.budgets.dashCentral.url);
				fetchBudgetsData(AppConfig.budgets.dashCentral.name, AppConfig.budgets.dashCentral.url,function(err, results){
					if ( !err ){
						Cache.storeBudgetsData(results);
					}
					callback(err,results);
				});
			}else{
				log.debug('Using Budgets found in cache.');
				callback(null, data);
			}
		}
	});
};

module.exports = {
	fetchDashBudgetsData: fetchDashBudgetsData
}