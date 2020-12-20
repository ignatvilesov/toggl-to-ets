import inquirer from "inquirer";

export async function askList(choices, message) {
  const question = {
    message,
    choices,
    type: "list",
    name: "result",
  };

  const userSelection = await inquirer.prompt([question]);

  return (userSelection && userSelection.result) || "";
}

export async function askCheckbox(choices, message) {
  const question = {
    message,
    choices,
    type: "checkbox",
    name: "result",
  };

  const userSelection = await inquirer.prompt([question]);

  return (userSelection && userSelection.result) || [];
}
