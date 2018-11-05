'use strict'

const inquirer = require('inquirer');

async function askList(choices, message) {
    const question = {
        message,
        choices,
        type: 'list',
        name: 'result',
    };

    const userSelection = await inquirer.prompt([question]);

    return userSelection && userSelection.result || '';
}

async function askCheckbox(choices, message) {
    const question = {
        message,
        choices,
        type: 'checkbox',
        name: 'result',
    };

    const userSelection = await inquirer.prompt([question]);

    return userSelection && userSelection.result || [];
}

module.exports = {
    askList,
    askCheckbox,
};