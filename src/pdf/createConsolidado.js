const PDFDocument = require("pdfkit");
const fs = require("fs");

const { formatDE, paginate } = require("../calcs/util");

const monthToName = [
  "",
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

let LineaReport = 0;

const createConsolidado = (cuenta, path, year, month) => {
  let doc = new PDFDocument({ size: "LEGAL", margin: 20, layout: "landscape" });
  LineaReport = 0;

  const itemPerPage = 14;
  let totalPag = cuenta.length / itemPerPage;
  totalPag = totalPag % 2 > 0 ? totalPag + 1 : totalPag;
  totalPag -= totalPag % 2;

  cuentaTotal = { ...cuenta[0] };
  const nuevoDatos = cuenta.filter((cta) => cta.cuentaNo !== "04.00.00.00.000");
  let page = 1;

  do {
    generateHeader(
      doc,
      { year, month: monthToName[month], page, totalPag },
      "consolidado acumulado"
    );
    generateHeaderTableMes(doc, month);
    generateInvoiceTable(doc, paginate(nuevoDatos, itemPerPage, page));
    page += 1;
    if (page <= totalPag) doc.addPage({ size: "LEGAL", margin: 20, layout: "landscape" });
  } while (page <= totalPag);
  generateFooter(doc, LineaReport, cuentaTotal);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
};

const createConsolidadoMensual = (cuenta, path, year, month) => {
  let doc = new PDFDocument({ size: "LEGAL", margin: 20, layout: "landscape" });
  LineaReport = 0;

  const itemPerPage = 14;
  let totalPag = cuenta.length / itemPerPage;
  totalPag = totalPag % 2 > 0 ? totalPag + 1 : totalPag;
  totalPag -= totalPag % 2;

  cuentaTotal = { ...cuenta[0] };
  const nuevoDatos = cuenta.filter((cta) => cta.cuentaNo !== "04.00.00.00.000");
  let page = 1;
  do {
    generateHeader(
      doc,
      {
        year,
        month: monthToName[month],
        page,
        totalPag,
        monthNum: month,
      },
      "consolidado mensual"
    );
    generateHeaderTableMes(doc, month);
    generateInvoiceTableMes(doc, paginate(nuevoDatos, itemPerPage, page));
    page += 1;
    if (page <= totalPag) doc.addPage({ size: "LEGAL", margin: 20, layout: "landscape" });
  } while (page <= totalPag);

  generateFooterMes(doc, LineaReport, cuentaTotal, month);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
};

const createDetalleCompromiso = (cuenta, path, year, month) => {
  let doc = new PDFDocument({ size: "LETTER", margin: 20, layout: "landscape" });
  LineaReport = 0;

  const itemPerPage = 14;
  let totalPag = cuenta.length / itemPerPage;
  totalPag = totalPag % 2 > 0 ? totalPag + 1 : totalPag;
  totalPag -= totalPag % 2;

  let page = 1;

  do {
    generateHeader(doc, {
      year,
      month: monthToName[month],
      page,
      totalPag,
    });
    generateHeaderTable(doc);
    generateInvoiceTable(doc, paginate(cuenta, itemPerPage, page));
    page += 1;
    if (page <= totalPag) doc.addPage({ size: "LETTER", margin: 20, layout: "landscape" });
  } while (page <= totalPag);

  generateFooter(doc, LineaReport, cuentaTotal);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
};

const generateHeader = (doc, { year, month, page, totalPag }, titleReport) => {
  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#444444")
    .text("REPÚBLICA BOLIVARIANA DE VENEZUELA", 20, 20)
    .text("GOBIERNO DEL ESTADO ANZOÁTEGUI", 30, 35)
    .image(__dirname + "/escudo.png", 90, 50, { width: 90 })
    .fontSize(10)
    .text("Procuraduria General del Estado Anzoátegui".toUpperCase(), 15, 120)
    .fontSize(12)
    .font("Helvetica")
    .text(`Ejecucion Presupuestaria y Financiera`.toUpperCase(), 200, 20, { align: "right" })
    .text(`Ejercicio Economico: ${year}`.toUpperCase(), 200, 35, { align: "right" })
    .text(`Mes: ${month}`.toUpperCase(), 200, 50, { align: "right" })
    .text(`${titleReport}`.toUpperCase(), 200, 65, { align: "right" })
    .fontSize(10)
    .text(`Pagina: ${page} de ${totalPag}`.toUpperCase(), 200, 120, { align: "right" })
    .moveDown();
};

const generateHeaderTable = (doc) => {
  doc.fillColor("#444444");
  let customerInformationTop = 140;
  doc.strokeColor("#aaaaaa").lineWidth(1).rect(20, customerInformationTop, 960, 35).stroke();
  customerInformationTop += 10;
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("CUENTA", 30, customerInformationTop)
    .text("DENOMINACION", 100, customerInformationTop)
    .text("ASIGNACION ORIGINAL", 290, customerInformationTop, { width: 90, align: "center" })
    .text("MODIFICACIONES", 385, customerInformationTop)
    .text("ASIGNACION AJUSTADA", 475, customerInformationTop, { width: 90, align: "center" })
    .text("COMPROMETIDO", 565, customerInformationTop)
    .text("CAUSADO", 660, customerInformationTop)
    .text("PAGADO", 730, customerInformationTop)
    .text("DISPONIBILIDAD PRESUPUESTARIA", 790, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .text("DISPONIBILIDAD FINANCIERA", 880, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .moveDown();
  customerInformationTop += 25;
};

const generateHeaderTableMes = (doc, month) => {
  doc.fillColor("#444444");
  let customerInformationTop = 140;
  // generateHr(doc, customerInformationTop);
  doc.strokeColor("#aaaaaa").lineWidth(1).rect(20, customerInformationTop, 960, 35).stroke();

  customerInformationTop += 10;

  const nameReplace =
    month >= 2 ? `DISPONIBILIDAD ${monthToName[month - 1]}` : "ASIGNACION ORIGINAL";

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("CUENTA", 30, customerInformationTop)
    .text("DENOMINACION", 100, customerInformationTop)
    .text(nameReplace, 290, customerInformationTop, { width: 90, align: "center" })
    .text("MODIFICACIONES", 385, customerInformationTop)
    .text("ASIGNACION AJUSTADA", 475, customerInformationTop, { width: 90, align: "center" })
    .text("COMPROMETIDO", 565, customerInformationTop)
    .text("CAUSADO", 660, customerInformationTop)
    .text("PAGADO", 730, customerInformationTop)
    .text("DISPONIBILIDAD PRESUPUESTARIA", 790, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .text("DISPONIBILIDAD FINANCIERA", 880, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .moveDown();

  customerInformationTop += 25;
  // generateHr(doc, customerInformationTop);
};

const generateInvoiceTable = (doc, data) => {
  let i;
  let invoiceTableTop = 185;
  data.forEach((theRow, idx) => generateTableRow(doc, invoiceTableTop + idx * 25, theRow));
};

const generateInvoiceTableMes = (doc, data) => {
  let i;
  let invoiceTableTop = 185;
  data.forEach((theRow, idx) => generateTableRowMes(doc, invoiceTableTop + idx * 25, theRow));
};

const generateFooter = (doc, y, rowData) => {
  const {
    cuentaNo,
    descripcion,
    monto,
    montoModMes,
    montoMod,
    montoAju,
    montoComMes,
    montoCom,
    montoCauMes,
    montoCau,
    montoPagMes,
    montoPag,
    montoDis,
  } = rowData;

  y += 30;
  const columnData = 25;

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .rect(columnData - 5, y - 10, 960, 25)
    .stroke();

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .text("TOTAL", columnData + 70, y, { width: 200, align: "left" })
    .text(formatDE(monto), columnData + 250, y, { width: 90, align: "right" })
    .text(formatDE(montoMod), columnData + 340, y, { width: 90, align: "right" })
    .text(formatDE(montoAju), columnData + 430, y, {
      width: 90,
      align: "right",
    })
    .text(formatDE(montoCom), columnData + 520, y, { width: 90, align: "right" })
    .text(formatDE(montoCau), columnData + 590, y, { width: 90, align: "right" })
    .text(formatDE(montoPag), columnData + 660, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 750, y, {
      width: 90,
      align: "right",
    })
    .text(formatDE(montoDis), columnData + 840, y, {
      width: 90,
      align: "right",
    });
};

const generateFooterMes = (doc, y, rowData, mesActivo) => {
  const {
    cuentaNo,
    descripcion,
    monto,
    montoModMes,
    montoMod,
    montoAju,
    montoComMes,
    montoCom,
    montoCauMes,
    montoCau,
    montoPagMes,
    montoPag,
    montoDis,
  } = rowData;

  const montoInical = mesActivo >= 2 ? montoDis + montoPagMes - montoModMes : monto;

  y += 35;
  const columnData = 25;
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .rect(columnData - 5, y - 10, 960, 25)
    .stroke();

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .text("TOTAL", 85, y, { width: 200, align: "left" })
    .text(formatDE(montoInical), columnData + 250, y, { width: 90, align: "right" })
    .text(formatDE(montoModMes), columnData + 340, y, { width: 90, align: "right" })
    .text(formatDE(montoModMes + montoInical), columnData + 430, y, {
      width: 90,
      align: "right",
    })
    .text(formatDE(montoComMes), columnData + 520, y, { width: 90, align: "right" })
    .text(formatDE(montoCauMes), columnData + 590, y, { width: 90, align: "right" })
    .text(formatDE(montoPagMes), columnData + 660, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 750, y, {
      width: 90,
      align: "right",
    })
    .text(formatDE(montoDis), columnData + 840, y, {
      width: 90,
      align: "right",
    });
  // generateHrd(doc, y + 15);
};

const generateTableRow = (doc, y, rowData) => {
  const {
    cuentaNo,
    descripcion,
    monto,
    montoModMes,
    montoMod,
    montoAju,
    montoComMes,
    montoCom,
    montoCauMes,
    montoCau,
    montoPagMes,
    montoPag,
    montoDis,
  } = rowData;

  const columnData = 25;
  LineaReport = y;

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .rect(columnData - 5, y - 5, 960, 25)
    .stroke();

  doc
    .fontSize(8)
    .font("Helvetica")
    .text(cuentaNo, columnData, y)
    .text(descripcion, columnData + 68, y, { width: 200, align: "left" })
    .text(formatDE(monto), columnData + 250, y, { width: 90, align: "right" })
    .text(formatDE(montoMod), columnData + 340, y, { width: 90, align: "right" })
    .text(formatDE(montoAju), columnData + 430, y, { width: 90, align: "right" })
    .text(formatDE(montoCom), columnData + 520, y, { width: 90, align: "right" })
    .text(formatDE(montoCau), columnData + 590, y, { width: 90, align: "right" })
    .text(formatDE(montoPag), columnData + 660, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 750, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 840, y, { width: 90, align: "right" });
};

const generateTableRowMes = (doc, y, rowData) => {
  const {
    mesActivo,
    cuentaNo,
    descripcion,
    monto,
    montoModMes,
    montoMod,
    montoAju,
    montoComMes,
    montoCom,
    montoCauMes,
    montoCau,
    montoPagMes,
    montoPag,
    montoDis,
  } = rowData;

  const columnData = 25;
  const montoInical = mesActivo >= 2 ? montoDis + montoPagMes - montoModMes : monto;
  LineaReport = y;

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .rect(columnData - 5, y - 5, 960, 25)
    .stroke();

  doc
    .fontSize(8)
    .font("Helvetica")
    .text(cuentaNo, columnData, y)
    .text(descripcion, columnData + 68, y, { width: 200, align: "left" })
    .text(formatDE(montoInical), columnData + 250, y, { width: 90, align: "right" })
    .text(formatDE(montoModMes), columnData + 340, y, { width: 90, align: "right" })
    .text(formatDE(montoInical + montoModMes), columnData + 430, y, {
      width: 90,
      align: "right",
    })
    .text(formatDE(montoComMes), columnData + 520, y, { width: 90, align: "right" })
    .text(formatDE(montoCauMes), columnData + 590, y, { width: 90, align: "right" })
    .text(formatDE(montoPagMes), columnData + 660, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 750, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 840, y, { width: 90, align: "right" });
  // generateHrd(doc, y + 19);
};

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(10, y).lineTo(990, y).stroke();
}

function generateHrd(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).dash(1).moveTo(10, y).lineTo(990, y).stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createConsolidado,
  createConsolidadoMensual,
  createDetalleCompromiso,
};
