'use strict';

const colors = require('colors/safe');
const request = require('request-promise-native');
const exceljs = require('exceljs');
const pathModule = require('path');

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
  ets,
} = require('minimist')(process.argv.slice(2));

Promise.resolve()
  .then(() => {
    if (!token || !workspace || !since || !until || !ets) {
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

    console.log(data);

    const filteredData = project ?
      data.data.filter(data => {
        return data.project === project;
      }) :
      data.data;

    const aggregatedMap = {};

    const aggregatedData = [];

    filteredData.forEach(data => {
      const {
        description,
        dur,
        tags
      } = data;

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

    return filteredData;
  })
  .then((data) => {
    return new Promise((resolve, reject) => {
      const workbook = new exceljs.Workbook();

      workbook.xlsx.readFile(ets)
        .then(() => {
          resolve([
            workbook,
            data
          ])
        })
        .catch(reject);
    });
  })
  .then(([workbook, data]) => {
    const worksheet = workbook.getWorksheet(1);

    data.forEach((task, taskIndex) => {
      const rowIndex = taskIndex + 2;
      const row = worksheet.getRow(rowIndex);

      // Project-Task
      row.getCell(1).value = `${task.project}.${task.tags[0]}`

      // Effort
      row.getCell(2).value = task.dur / 1000 / 60 / 60;

      // Description
      row.getCell(3).value = task.description;

      // Started Date
      row.getCell(4).value = new Date(task.start);

      // Ended Date
      row.getCell(5).value = new Date(task.end);

      row.commit();
    });

    const parsedPath = pathModule.parse(ets);

    const outputFile = pathModule.join(
      parsedPath.dir,
      `${parsedPath.name}_filled${parsedPath.ext}`,
    );

    return workbook.xlsx
      .writeFile(outputFile)
      .then(() => {
        return outputFile;
      });
  })
  .then((outputFile) => {
    console.log(colors.info(`Toggl to ETS import completed. You can find the filled reports here: ${outputFile}`))
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