import { join as joinPath } from "path";
import colors from "colors/safe.js";

import { TogglApi } from "./togglApi.js";
import { TaskEntities } from "./taskEntities.js";
import { ExcelGenerator } from "./excelGenerator.js";
import { formatDate } from "./dateUtils.js";

colors.setTheme({
  silly: "rainbow",
  input: "grey",
  verbose: "cyan",
  prompt: "grey",
  info: "green",
  data: "grey",
  help: "cyan",
  warn: "yellow",
  debug: "blue",
  error: "red",
});

export async function generate({ token, start, end }) {
  try {
    if (!token) {
      throw new Error(
        `Token isn't specified. To get token go to Profile Settings section in Toggl Track UI.`
      );
    }

    const togglApi = new TogglApi({
      token,
    });

    const currentDate = new Date();

    const startDate = start
      ? new Date(start)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of month

    const endDate = end
      ? new Date(end)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // End of month

    const rawTasksFromTogglApi = await togglApi.getTasks({
      startDate,
      endDate,
    });

    const taskEntities = new TaskEntities(rawTasksFromTogglApi);

    const unconsideredTasks = taskEntities.balance();

    if (unconsideredTasks && unconsideredTasks.length) {
      console.log(
        colors.warn(
          `These tasks can't be included into an ETS report because their duration is too short`
        )
      );

      unconsideredTasks.forEach((task) => {
        console.log(
          colors.info(
            `${task.client} | ${task.project} | ${formatDate(
              task.start
            )} - ${formatDate(task.end)} | ${task.description}`
          )
        );
      });
    }

    const excelGenerator = new ExcelGenerator();

    const reportName = getReportName(startDate, endDate);
    const outputFilePath = joinPath(process.cwd(), reportName);

    await excelGenerator.generate({
      outputFilePath,
      tasks: taskEntities,
    });

    console.log(
      colors.info(
        `Toggl Track to ETS import completed. You can find a report here: ${outputFilePath}`
      )
    );
  } catch (err) {
    if (err && err.message) {
      console.log(colors.error(err.message));
    } else if (err) {
      console.log(colors.error(err));
    } else {
      console.log(colors.error("Something went wrong"));
    }

    process.exit(1);
  }
}

function getReportName(startDate, endDate) {
  const name = [
    "ets",
    "report",
    formatDate(startDate),
    formatDate(endDate),
  ].join("_");

  return `${name}.xlsx`;
}
