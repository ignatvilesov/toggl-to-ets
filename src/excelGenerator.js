const exceljs = require('exceljs');

class ExcelGenerator {
    async generate({
        tasks,
        outputFilePath
    }) {
        const workbook = new exceljs.Workbook();

        const worksheet = workbook.addWorksheet('Efforts');

        // Adds a header
        worksheet.addRow([
            'Project-Task',
            'Effort',
            'Description',
            'Started Date',
            'Completion Date',
        ])

        for (let task of tasks) {
            worksheet.addRow([
                task.name,
                task.duration,
                task.description,
                task.startDate,
                task.endDate,
            ]);
        }

        await workbook.xlsx.writeFile(outputFilePath);
    }
}

module.exports = ExcelGenerator;