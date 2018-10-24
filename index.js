'use strict';

const colors = require('colors/safe');
const pathModule = require('path');

const TogglApi = require('./src/togglApi');
const TaskEntities = require('./src/taskEntities');
const ExcelGenerator = require('./src/excelGenerator');

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
  since,
  until,
  projects,
}) => {
  try {
    if (!token || !since || !until) {
      throw new Error('Required arguments are not specified');
    }

    const togglApi = new TogglApi();

    const rawTasksFromTogglApi = await togglApi.getTasks({
      token,
      since,
      until,
    });

    const taskEntities = new TaskEntities(rawTasksFromTogglApi);

    const parsedProjects = projects && projects.length > 0
      ? projects.split(';')
      : [];

    taskEntities
      .filterByProjectNames(parsedProjects)
      .balance();

    const excelGenerator = new ExcelGenerator();

    const outputFilePath = pathModule.join(
      process.cwd(),
      'ets_filled.xlsx'
    );

    await excelGenerator.generate({
      outputFilePath,
      tasks: taskEntities,
    });

    console.log(colors.info(`Toggl to ETS import completed. You can find the filled reports here: ${outputFilePath}`));
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