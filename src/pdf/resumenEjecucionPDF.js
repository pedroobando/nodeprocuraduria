const PDFDocument = require("pdfkit");
const fs = require("fs");

const { formatDE, paginate, formatPorcDE } = require("../calcs/util");

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

const resumenEjecucionPDF = (cuenta, path, year, month) => {
  let doc = new PDFDocument({ size: "LEGAL", margin: 20, layout: "landscape" });
  LineaReport = 0;

  const itemPerPage = 15;

  cuentaTotal = { ...cuenta[0] };
  let nuevoDatos = cuenta.filter((cta) => cta.cuentaNo !== "04.00.00.00.000");
  nuevoDatos = nuevoDatos.filter((cta) => cta.cuentaNo.substr(-10) === ".00.00.000");

  let totalPag = nuevoDatos.length / itemPerPage;
  totalPag = totalPag % 2 > 0 ? totalPag + 1 : totalPag;
  totalPag -= totalPag % 2;

  let page = 1;

  do {
    generateHeader(
      doc,
      { year, month: monthToName[month], page, totalPag },
      "RESUMEN EJECUCION PRESUPUESTARIA POR PARTIDAS"
    );
    generateHeaderTable(doc);
    generateInvoiceTable(doc, paginate(nuevoDatos, itemPerPage, page));
    page += 1;
    if (page <= totalPag) doc.addPage({ size: "LEGAL", margin: 20, layout: "landscape" });
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
    .text("MODIFICACIONES", 385, customerInformationTop, { width: 90, align: "center" })
    .text("ASIGNACION AJUSTADA", 475, customerInformationTop, { width: 90, align: "center" })
    .text("PRESUPUESTO COMPROMETIDO", 560, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .text("PRESUPUESTO EJECUTADO", 640, customerInformationTop, { width: 90, align: "center" })
    .text("PAGADO", 720, customerInformationTop, { width: 90, align: "center" })
    .text("DISPONIBILIDAD PRESUPUESTARIA", 800, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .text("PORCENTAJE EJECUTADO", 890, customerInformationTop, {
      width: 90,
      align: "center",
    })
    .moveDown();
  customerInformationTop += 25;
};

const generateInvoiceTable = (doc, data) => {
  let i;
  let invoiceTableTop = 185;
  data.forEach((theRow, idx) => generateTableRow(doc, invoiceTableTop + idx * 25, theRow));
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

  y += 37;
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
    .text(formatDE(montoCau), columnData + 600, y, { width: 90, align: "right" })
    .text(formatDE(montoPag), columnData + 680, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 770, y, {
      width: 90,
      align: "right",
    })
    .text(formatPorcDE((montoPag * 100) / cuentaTotal.montoAju), columnData + 840, y, {
      width: 90,
      align: "right",
    });
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
    .text(formatDE(montoCau), columnData + 600, y, { width: 90, align: "right" })
    .text(formatDE(montoPag), columnData + 680, y, { width: 90, align: "right" })
    .text(formatDE(montoDis), columnData + 770, y, { width: 90, align: "right" })
    .text(formatPorcDE((montoPag * 100) / cuentaTotal.montoAju), columnData + 840, y, {
      width: 90,
      align: "right",
    });
};

module.exports = resumenEjecucionPDF;
