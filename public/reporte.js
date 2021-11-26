const { PdfMakeWrapper, Table } = require("pdfmake-wrapper");

// type TableRow = [String, String, Number];

const createTable = (data) => {
  return new Table([]).end;
};

const presupuesto = (data) => {
  const pdf = new PdfMakeWrapper();
  const win = window.open("carabana", "_blank");

  pdf.pageSize("LETTER");
  pdf.pageMargins(20, 10);
  pdf.pageOrientation("portrait");
  pdf.header("Reporte de Presupuesto");
  console.log(data);

  // pdf.footer('This is a footer');

  pdf.create().open({}, win);
};

module.exports = presupuesto;
