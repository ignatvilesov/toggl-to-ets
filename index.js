'use strict';

const colors = require('colors/safe');
const request = require('request-promise-native');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

const {
  token,
  workspace,
  since,
  until,
  project,
} = require('minimist')(process.argv.slice(2));

Promise.resolve()
  .then(() => {
    if (!token || !workspace || !since || !until) {
      throw new Error('Required arguments are not specified')
    }
  })
  .then(() => {
    const options = {
      uri: 'https://toggl.com/reports/api/v2/details',
      qs: {
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
    }

    return request(options);
  })
  .then((data) => {
    if (!data || !data.data) {
      throw new Error('Response contains no data');
    }

    const filteredData = project
      ? data.data.filter(data => {
        return data.project === project;
      })
      : data.data;

    const aggregatedMap = {};

    const aggregatedData = [];

    filteredData.forEach(data => {
      const { description, dur, tags } = data;

      const item = aggregatedMap[data.description];

      if (item) {
        item.dur += dur;
      } else {
        const newItem = {
          description,
          dur,
          tag: tags[0],
        };

        aggregatedMap[data.description] = newItem;

        aggregatedData.push(newItem);
      }
    });

    return aggregatedData;
  })
  .then((data) => {
    // write data to excel

    console.log(data);
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(colors.error(err.message));
    } else if (err) {
      console.log(colors.error(err));
    } else {
      console.log(colors.error('Something went wrong'));
    }

    process.exit(1);
  });