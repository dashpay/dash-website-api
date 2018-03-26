var path     = require('path');
var rootPath = path.normalize(__dirname + '/..');
var env      = process.env.NODE_ENV || 'development';

var config = {
  development: {
    exchanges: {
      coincap: {
        name: 'CoinCap',
        orgUrl: 'http://coincap.io/',
        url: 'https://api.coinmarketcap.com/v1/ticker/dash'
      },
      coincapbtc: {
        name: 'CoinCapBtc',
        orgUrl: 'http://coincap.io/',
        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin/'
      },
      worldcoin: {
        name: 'WorldCoinIndex',
        orgUrl: 'https://www.worldcoinindex.com',
        url: 'https://www.worldcoinindex.com/apiservice/json',
        apiKey: 'ePSl8tl8dsFhLyReZ6aIwCQNw'
      },
      kraken: {
        name: 'Kraken',
        orgUrl: 'https://www.kraken.com/',
        url: 'https://api.kraken.com/0/public/Ticker?pair=DASHUSD',
        urlEur: 'https://api.kraken.com/0/public/Ticker?pair=DASHEUR',
        urlBTC: 'https://api.kraken.com/0/public/Ticker?pair=DASHXBT'
      },
      poloniex: {
        name: 'Poloniex',
        orgUrl: 'https://poloniex.com/',
        url: 'https://poloniex.com/public?command=returnTicker'
      },
      bittrex: {
        name: 'Bittrex',
        orgUrl: 'https://bittrex.com/',
        url: 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-dash',
        urlEth: 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=ETH-dash'
      },
      bitfinex: {
        name: 'Bitfinex',
        orgUrl: 'https://www.bitfinex.com/',
        url: 'https://api.bitfinex.com/v1/pubticker/dshusd',
        urlBTC: 'https://api.bitfinex.com/v1/pubticker/dshbtc'
      },
      hitbtc: {
        name: 'Hitbtc',
        orgUrl: 'https://hitbtc.com/',
        url: 'https://api.hitbtc.com/api/1/public/DASHUSD/ticker',
        urlBTC: 'https://api.hitbtc.com/api/1/public/DASHBTC/ticker'
      },
      bithumb: {
        name: 'Bithumb',
        orgUrl: 'https://www.bithumb.com/',
        url: 'https://api.bithumb.com/public/ticker/DASH'
      },
      livecoin: {
        name: 'Livecoin',
        orgUrl: 'https://www.livecoin.net',
        url: 'https://api.livecoin.net/exchange/ticker?currencyPair=DASH/USD',
        urlBTC: 'https://api.livecoin.net/exchange/ticker?currencyPair=DASH/BTC',
      },
      exmo: {
        name: 'Exmo',
        orgUrl: 'https://exmo.me/',
        url: 'https://api.exmo.com/v1/ticker'
      },
      yobit: {
        name: 'Yobit',
        orgUrl: 'https://yobit.net/',
        url: 'https://yobit.net/api/3/ticker/dash_usd',
        urlBTC: 'https://yobit.net/api/3/ticker/dash_btc',
        urlRur: 'https://yobit.net/api/3/ticker/dash_rur'
      },
      ccex: {
        name: 'C-cex',
        orgUrl: 'https://c-cex.com/',
        url: 'https://c-cex.com/t/dash-usd.json',
        urlBTC: 'https://c-cex.com/t/dash-btc.json'
      },
      cexio: {
        name: 'Cex.io',
        orgUrl: 'https://cex.io/',
        url: 'https://cex.io/api/last_price/DASH/USD',
        urlBTC: 'https://cex.io/api/last_price/DASH/BTC',
        urlEur: 'https://cex.io/api/last_price/DASH/EUR'
      },
      yahoofinance: {
        name: 'Yahoo',
        orgUrl: 'https://www.yahoo.com/',
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22KRWUSD%22)&format=json&env=store://datatables.org/alltableswithkeys&callback='
      }
    },
    budgets: {
      dashwhale: {
        name: 'DashWhale',
        url: 'https://www.dashwhale.org/api/v1/budget'
      }
    },
    masternodes: {
      node40: {
        name: 'Node40',
        apiKey: '8e4ec80a6394db3411b8af9afa3b5156d36fd18102f1278fef59a3e40d9bf6af',
        apiKeyHeader: 'X-Api-Key',
        historyUrl: 'https://node40.com/monitor/api/masterNode/history',
        statsUrl: 'https://node40.com/monitor/api/masterNode/stats'
      }
    },
    chain: {
      insight: {
        name: 'Insight',
        url: 'https://insight.dash.siampm.com/api/blocks',
        maxBlocks: 10
      }
    },
    root: rootPath,
    app: {
      name: 'dash.org-api'
    },
    port: process.env.PORT || 9090,
    logLevel: 'DEBUG' // EMERGENCY|ALERT|CRITICAL|ERROR|WARNING|NOTICE|INFO|DEBUG
  },

  test: {
    root: rootPath,
    app: {
      name: 'dash.org-api'
    },
    port: process.env.PORT || 9090
  },

  production: {
    root: rootPath,
    app: {
      name: 'dash.org-api'
    },
    port: process.env.PORT || 9090
  }
};

module.exports = config[env];
