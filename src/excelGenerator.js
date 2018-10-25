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
        ]);

        worksheet.getColumn(1).width = 24;
        worksheet.getColumn(2).width = 12;
        worksheet.getColumn(3).width = 78;
        worksheet.getColumn(4).width = 16;
        worksheet.getColumn(5).width = 16;

        const headerRow = worksheet.lastRow;

        headerRow.height = 25;

        [
            worksheet.getCell('A1'),
            worksheet.getCell('B1'),
            worksheet.getCell('C1'),
            worksheet.getCell('D1'),
            worksheet.getCell('E1'),
        ].forEach((element) => {
            this.applyHeaderStyles(element);
        });

        for (let task of tasks) {
            worksheet.addRow([
                task.name,
                task.duration,
                task.description,
                task.startDate,
                task.endDate,
            ]);

            worksheet.lastRow.font = {
                name: 'Tahoma',
                color: {
                    argb: '00000000'
                },
                family: 2,
                size: 10,
            };
        }

        await workbook.xlsx.writeFile(outputFilePath);
    }

    applyHeaderStyles(element) {
        element.font = {
            name: 'Tahoma',
            color: {
                argb: '00FFFFFF'
            },
            family: 2,
            size: 8,
            bold: true,
        };

        element.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };

        element.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: '00130082'
            }
        };

        element.border = {
            top: {
                style: 'thin',
                color: {
                    argb: '00FFFFFF'
                }
            },
            left: {
                style: 'thin',
                color: {
                    argb: '00FFFFFF'
                }
            },
            bottom: {
                style: 'thin',
                color: {
                    argb: '00FFFFFF'
                }
            },
            right: {
                style: 'thin',
                color: {
                    argb: '00FFFFFF'
                }
            }
        };
    }
}

module.exports = ExcelGenerator;