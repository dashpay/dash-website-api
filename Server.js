var express      = require('express');
var app          = express();
var AWS          = require('aws-sdk');
var Exchange     = require('./service/ExchangeService');
var Budget       = require('./service/BudgetService');
var AppConfig    = require('./AppConfig');
var Cache        = require('./service/CacheRepository');
var Masternode   = require('./service/MasternodeService');
var Blockchain   = require('./service/BlockchainService');

// Add headers
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});


app.get('/chain/latestBlocks', function(req,res){

	Blockchain.fetchLatestBlocks(function(err, result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});
});

app.get('/masternodes/history', function(req,res){

	Masternode.fetchMasternodeHistory(function(err, result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});
});

app.get('/masternodes/stats', function(req,res){

	Masternode.fetchMasternodeStats(function(err, result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});
});


app.get('/budgets', function(req,res){
	
	Budget.fetchDashBudgetsData(function(err,result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});

});

app.get('/exchange', function(req,res){

	Exchange.fetchAll(function(err,result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});

});

global.cacheConnection = Cache.connect();

var server = app.listen(AppConfig.port, function () {

	var host = process.env.BIND_HOST || server.address().address;
	var port = server.address().port;
	console.log('dash.org api server listening at http://%s:%s', host, port);
});
