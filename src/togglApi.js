class TogglApi {
    constructor() {
        this.requestModule = require('request-promise-native');
    }

    async request(options) {
        let accumulatedData = [];
        let pageIndex = 1;
        let totalCount = 0;

        do {
            const data = await this.requestTogglApi({
                ...options,
                page: pageIndex,
            });

            totalCount += data.data.length;

            accumulatedData = accumulatedData.concat(data.data || []);

            if (totalCount === data.total_count) {
                break;
            }

            pageIndex++;
        } while (true);

        return accumulatedData;
    }

    requestTogglApi({
        since,
        until,
        workspace,
        token,
        page,
    }) {
        const options = {
            uri: 'https://toggl.com/reports/api/v2/details',
            qs: {
                page,
                since,
                until,
                workspace_id: workspace,
                user_agent: 'cli_toggle_to_ets'
            },
            auth: {
                user: token,
                pass: 'api_token'
            },
            json: true
        };

        return this.requestModule(options);
    }
}

module.exports = TogglApi;