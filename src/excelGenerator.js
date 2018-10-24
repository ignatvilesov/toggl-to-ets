const exceljs = require('exceljs');

class ExcelGenerator {
    async generate({
        tasks,
        inputFilePath,
        outputFilePath
    }) {
        const workbook = new exceljs.Workbook();

        await workbook.xlsx.readFile(inputFilePath); // TODO: generate xlsx on fly

        const worksheet = workbook.getWorksheet(1);

        let rowIndex = 2; // We start from the second row because the first is header

        for (let task of tasks) {
            const row = worksheet.getRow(rowIndex);

            // Project-Task
            row.getCell(1).value = task.name;

            // Effort
            row.getCell(2).value = task.duration

            // Description
            row.getCell(3).value = task.description;

            // Started Date
            row.getCell(4).value = task.startDate;

            // Ended Date
            row.getCell(5).value = task.endDate;

            row.commit();

            rowIndex++;
        }

        await workbook.xlsx.writeFile(outputFilePath);
    }
}

module.exports = ExcelGenerator;