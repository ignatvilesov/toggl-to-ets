const lodashFloor = require('lodash.floor');

class TaskEntities {
    constructor(tasks) {
        this.tasks = tasks || [];
        this.step = 0.1; // This can divide any values (0, 0.1, 5.4, etc.)

        this.iteratorIndex = 0;
    }

    filterByProjectNames(projectNames) {
        if (projectNames && projectNames.length) {
            this.tasks = this.tasks.filter(task => {
                return projectNames.some((projectName) => {
                    return task.project === projectName;
                });
            });
        }

        return this;
    }

    balance() {
        let unconsideredDurationSum = 0;

        this.tasks = this.tasks.map((task) => {
            const originalDuration = task.dur / 1000 / 60 / 60;

            const flooredDuration = this.floor(originalDuration);

            unconsideredDurationSum += originalDuration - flooredDuration;

            const name = task.tags && task.tags[0] ?
                `${task.project}.${task.tags[0]}` :
                task.project;

            return {
                ...task,
                name,
                duration: flooredDuration,
                startDate: new Date(task.start),
                endDate: new Date(task.end),
            };
        });

        let flooredUnconsideredDuration = this.floor(unconsideredDurationSum);

        // TODO: most likely we make make it with O(n) but no thoughts at 12.21 AM
        for (let taskIndex = 0; flooredUnconsideredDuration > 0; taskIndex++) {
            if (taskIndex >= this.tasks.length) {
                taskIndex = 0;
            }

            this.tasks[taskIndex].duration += this.step;

            flooredUnconsideredDuration -= this.step;
        }

        return this;
    }

    floor(value, precision = 1) {
        return lodashFloor(value, precision);
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
            }
        }
    }
}

module.exports = TaskEntities;