import round from "lodash.round";
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

          const flooredDuration = round(originalDuration, 1);

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
        })

      unconsideredDurationAfterSpread += this.balanceTaskDurations(
        tasks,
        unconsideredDurationSumForTaskGroup
      );

      balancedTasks.push(...tasks);
    });

    this.balanceTaskDurations(
      balancedTasks,
      unconsideredDurationAfterSpread
    );

    const groupedByDuration = groupBy(balancedTasks, (task) => {
      return task.duration >= this.step;
    });

    this.tasks = groupedByDuration[true] || [];

    return groupedByDuration[false] || [];
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
  balanceTaskDurations(tasks, leftDuration) {
    const sortedTasks = tasks.sort((a, b) => b.duration - a.duration);

    const sign = Math.sign(leftDuration);
    const signedStep = this.step * sign;

    const doubledStep = this.step * 2;

    let currentLeftDuration = leftDuration;
    let sumDuration = 0;

    let allowedNumberOfLoops = 10;

    // this loop below has side effects due to performance optimizations
    for (
      let taskIndex = 0;
      Math.abs(currentLeftDuration) >= this.step && allowedNumberOfLoops > 0;
      taskIndex++
    ) {
      if (taskIndex >= sortedTasks.length) {
        taskIndex = 0;
        allowedNumberOfLoops--;
      }

      const currentDuration = sortedTasks[taskIndex].duration;

      if (currentDuration < doubledStep && sign < 0) {
        continue;
      }

      sortedTasks[taskIndex].duration += signedStep;
      sumDuration += signedStep;
      currentLeftDuration -= signedStep;
    }

    return leftDuration - sumDuration;
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
