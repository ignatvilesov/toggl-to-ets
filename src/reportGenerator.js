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
        `Token isn't specified. To get token go to Profile Settings section in Toggl UI.`
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
          color.info(
            `${task.client} => ${task.project} => [${formatDate(
              task.startDate
            )}, ${formatDate(task.endDate)}] => ${task.description}`
          )
        );
      });
    }

    const excelGenerator = new ExcelGenerator();

    const outputFilePath = joinPath(process.cwd(), "ets_filled.xlsx");

    await excelGenerator.generate({
      outputFilePath,
      tasks: taskEntities,
    });

    console.log(
      colors.info(
        `Toggl to ETS import completed. You can find the filled reports here: ${outputFilePath}`
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
