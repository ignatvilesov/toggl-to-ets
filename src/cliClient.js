'use strict'

const inquirer = require('inquirer');

function buildWorkspaceNames(workspaces) {
    let str = '';
    let i = 1;
    workspaces.forEach(element => {
        str += `\n${i++}: ${element.name}`
    });
    return str;
}

module.exports = {

    askWorkspaceNumber: (workspaces) => {
        const questions = [
            {
                name: 'workspaceNumber',
                type: 'input',
                message: `You have several workspaces: ${buildWorkspaceNames(workspaces)} \nPlease enter workspace number to generate report from:`,
                validate: function (value) {
                    let workspaceNumber = parseInt(value, NaN)
                    if (workspaceNumber && workspaceNumber >= 1 && workspaceNumber <= workspaces.length) {
                        return true;
                    } else {                        
                        return `Workspace number is expected to be a value from 1 to ${workspaces.length}`;
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    }
}