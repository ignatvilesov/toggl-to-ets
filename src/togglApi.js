const requestModule = require('request-promise-native');
const cliClient = require('./cliClient');

class TogglApi {
    async requestWorkspaces(token) {
        const options = {
            uri: 'https://toggl.com/api/v8/workspaces',
            auth: {
                user: token,
                pass: 'api_token'
            }
        }

        return requestModule(options);
    }

    async getWorkspaceId(token) {
        let res = await this.requestWorkspaces(token);
        let workspaces = JSON.parse(res);

        if (workspaces.length > 1) {
            let res = await cliClient.askWorkspaceNumber(workspaces);
            return workspaces[res.workspaceNumber - 1].id;
        }

        return workspaces[0].id;
    }

    async getTasks(options) {
        let accumulatedData = [];
        let pageIndex = 1;
        let totalCount = 0;
        let workspaceId = await this.getWorkspaceId(options.token);

        do {
            const data = await this.requestTogglApi({
                ...options,
                workspace: workspaceId,
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

        return requestModule(options);
    }
}

module.exports = TogglApi;