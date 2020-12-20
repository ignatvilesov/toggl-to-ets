import floor from "lodash.floor";
import groupBy from "lodash.groupby";

import { formatDate } from "./dateUtils.js";

export class TaskEntities {
  constructor(tasks) {
    this.tasks = tasks || [];
    this.step = 0.1; // Min duration in ETS

    this.iteratorIndex = 0;
  }

  balance() {
    const balancedTasks = [];

    const groupedTasks = this.getGroupedTasks();

    let unconsideredDurationAfterSpread = 0;

    Object.keys(groupedTasks).forEach((taskGroup) => {
      let unconsideredDurationSumForTaskGroup = 0;

      const tasks = groupedTasks[taskGroup]
        .reduce((tasks, task) => {
          const foundTask = this.getTaskByDescription(tasks, task.description);

          if (foundTask) {
            foundTask.dur += task.dur;

            return tasks;
          }

          return [...tasks, task];
        }, [])
        .map((task) => {
          const originalDuration = task.dur / 1000 / 60 / 60;

          const flooredDuration = this.floor(originalDuration);

          unconsideredDurationSumForTaskGroup +=
            originalDuration - flooredDuration;

          const name =
            task.tags && task.tags[0]
              ? `${task.project}.${task.tags[0]}`
              : task.project;

          return {
            ...task,
            name,
            duration: flooredDuration,
            startDate: task.start,
            endDate: task.end,
          };
        });

      const sortedTasks = tasks.slice().sort((a, b) => a.duration - b.duration);

      unconsideredDurationAfterSpread += this.spreadDuration(
        sortedTasks,
        unconsideredDurationSumForTaskGroup
      );

      balancedTasks.push(...tasks);
    });

    if (unconsideredDurationAfterSpread >= this.step) {
      this.spreadDuration(balancedTasks, unconsideredDurationAfterSpread);
    }

    const groupedByDuration = groupBy(balancedTasks, (task) => {
      return task.duration >= this.step;
    });

    this.tasks = groupedByDuration[true] || [];

    return groupedByDuration[false] || [];
  }

  floor(value) {
    return floor(value, 1);
  }

  getGroupedTasks() {
    return groupBy(this.tasks, (task) => {
      const formattedDate = formatDate(task.start);

      return `${task.client}-${task.project}-${formattedDate}`;
    });
  }

  getTaskByDescription(tasks, description) {
    for (let task of tasks) {
      if (task && task.description === description) {
        return task;
      }
    }

    return null;
  }

  /**
   * Spreads duration over tasks.
   *
   * It has side effect due to performance reasons.
   */
  spreadDuration(tasks, unconsideredDuration) {
    let flooredUnconsideredDuration = this.floor(unconsideredDuration);
    let unconsideredDurationCopied = unconsideredDuration;

    // this loop below has side effects due to performance optimizations
    for (
      let taskIndex = 0;
      flooredUnconsideredDuration >= this.step;
      taskIndex++
    ) {
      if (taskIndex >= tasks.length) {
        taskIndex = 0;
      }

      tasks[taskIndex].duration += this.step;

      flooredUnconsideredDuration -= this.step;
      unconsideredDurationCopied -= this.step;
    }

    return unconsideredDurationCopied;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        if (this.iteratorIndex < this.tasks.length) {
          return {
            value: {
              ...this.tasks[this.iteratorIndex++], // Copies values to prevent object from modifications
            },
            done: false,
          };
        } else {
          this.iteratorIndex = 0;

          return {
            done: true,
          };
        }
      },
    };
  }
}
