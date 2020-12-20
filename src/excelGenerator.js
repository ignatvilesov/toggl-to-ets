import exceljs from "exceljs";

export class ExcelGenerator {
  async generate({ tasks, outputFilePath }) {
    const workbook = new exceljs.Workbook();

    const worksheet = workbook.addWorksheet("Efforts");

    this.addReportTypeCell(worksheet);
    this.addHeader(worksheet);
    this.addTasks(worksheet, tasks);

    await workbook.xlsx.writeFile(outputFilePath);
  }

  addReportTypeCell(worksheet) {
    worksheet.mergeCells("A1:D1");

    const reportTypeCell = worksheet.getCell("A1");

    reportTypeCell.value = "ETSI_OneDayTaskReportTemplate";

    this.applyReportTypeCellStyles(reportTypeCell);
  }

  applyReportTypeCellStyles(element) {
    element.font = {
      name: "Arial",
      color: {
        argb: "00000000",
      },
      family: 2,
      size: 10,
    };

    element.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  }

  addHeader(worksheet) {
    worksheet.addRow(["Project-Task", "Effort", "Description", "Date"]);

    worksheet.getColumn(1).width = 24;
    worksheet.getColumn(2).width = 12;
    worksheet.getColumn(3).width = 78;
    worksheet.getColumn(4).width = 16;

    const headerRow = worksheet.lastRow;

    headerRow.height = 25;

    [
      worksheet.getCell("A2"),
      worksheet.getCell("B2"),
      worksheet.getCell("C2"),
      worksheet.getCell("D2"),
    ].forEach((element) => {
      this.applyHeaderStyles(element);
    });
  }

  applyHeaderStyles(element) {
    element.font = {
      name: "Tahoma",
      color: {
        argb: "00FFFFFF",
      },
      family: 2,
      size: 8,
      bold: true,
    };

    element.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    element.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "00130082",
      },
    };

    element.border = {
      top: {
        style: "thin",
        color: {
          argb: "00FFFFFF",
        },
      },
      left: {
        style: "thin",
        color: {
          argb: "00FFFFFF",
        },
      },
      bottom: {
        style: "thin",
        color: {
          argb: "00FFFFFF",
        },
      },
      right: {
        style: "thin",
        color: {
          argb: "00FFFFFF",
        },
      },
    };
  }

  addTasks(worksheet, tasks) {
    for (let task of tasks) {
      const row = worksheet.addRow([
        task.name,
        task.duration,
        task.description,
        task.startDate,
      ]);

      this.applyTaskStyles(row);
    }
  }

  applyTaskStyles(element) {
    element.font = {
      name: "Tahoma",
      color: {
        argb: "00000000",
      },
      family: 2,
      size: 10,
    };
  }
}
