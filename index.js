'use strict';

const colors = require('colors/safe');
const request = require('request-promise-native');
const exceljs = require('exceljs');
const pathModule = require('path');

const TogglApi = require('./src/togglApi');

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

(async ({
  token,
  workspace,
  since,
  until,
  project,
  ets,
}) => {
  try {
    if (!token || !workspace || !since || !until || !ets) {
      throw new Error('Required arguments are not specified');
    }
    const togglApi = new TogglApi();

    const tasks = await togglApi.request({
      token,
      since,
      until,
      workspace,
    });

    const filteredTasks = project ?
      tasks.filter(task => {
        return task.project === project;
      }) :
      tasks || [];

    const workbook = new exceljs.Workbook();

    await workbook.xlsx.readFile(ets);

    const worksheet = workbook.getWorksheet(1);

    filteredTasks.forEach((task, taskIndex) => {
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

    await workbook.xlsx.writeFile(outputFile);

    console.log(colors.info(`Toggl to ETS import completed. You can find the filled reports here: ${outputFile}`));
  } catch (err) {
    if (err && err.message) {
      console.log(colors.error(err.message));
    } else if (err) {
      console.log(colors.error(err));
    } else {
      console.log(colors.error('Something went wrong'));
    }

    process.exit(1);
  }
})(require('minimist')(process.argv.slice(2)));
