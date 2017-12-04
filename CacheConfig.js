
var cacheConfig = {

	endpoint: 'localhost:11211',

	exchange: {
		key: 'dashapi_exchange',
		timeout_seconds: 20
	},

	budgets: {
		key: 'dashapi_budgets_all',
		timeout_seconds: 10
	},

	masternodes: {
		history: {
			key: 'dashapi_masternodes_history',
			timeout_seconds: 10
		},
		stats: {
			key: 'dashapi_masternodes_stats',
			timeout_seconds: 10
		}
	},

	chain: {
		blocks: {
			key: 'dashapi_chain_latest_blocks',
			timeout_seconds: 10
		}
	}
};

module.exports = cacheConfig;
