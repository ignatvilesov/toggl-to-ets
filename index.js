'use strict';

const colors = require('colors/safe');
const pathModule = require('path');

const TogglApi = require('./src/togglApi');
const TaskEntities = require('./src/taskEntities');
const ExcelGenerator = require('./src/excelGenerator');

const formatDate = require('./src/dateUtils').formatDate;

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
    if (!token) {
      throw new Error(`Token isn't specified. To get token go to Profile Settings section in Toggl UI.`);
    }

    const togglApi = new TogglApi();

    const currentDate = new Date();

    const startDate = since ?
      new Date(since) :
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of month

    const endDate = until ?
      new Date(until) :
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // End of month

    const rawTasksFromTogglApi = await togglApi.getTasks({
      token,
      startDate,
      endDate,
    });

    const taskEntities = new TaskEntities(rawTasksFromTogglApi);

    const parsedProjects = projects && projects.length > 0 ?
      projects.split(';') : [];

    taskEntities.filterByProjectNames(parsedProjects);

    const unconsideredTasks = taskEntities.balance();

    if (unconsideredTasks && unconsideredTasks.length) {
      console.log(colors.warn(`These tasks can't be included into an ETS report because their duration is too short`));

      unconsideredTasks.forEach((task) => {
        console.log(color.info(`${task.client} => ${task.project} => [${formatDate(task.startDate)}, ${formatDate(task.endDate)}] => ${task.description}`));
      });
    }

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