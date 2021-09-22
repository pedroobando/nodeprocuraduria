"use strict";
const chalk = require("chalk");

const ceroleft = (valor, cantidad) => {
  return valor.toString().padStart(cantidad, "0");
};

const ordenCuenta = (a, b) => (a.cuentaNo > b.cuentaNo ? 1 : a.cuentaNo < b.cuentaNo ? -1 : 0);

const ordenCuentaDesc = (a, b) =>
  a.cuentaNo < b.cuentaNo ? 1 : a.cuentaNo > b.cuentaNo ? -1 : 0;

const consolaPresup = (record) =>
  `${chalk.blueBright(record.cuentaNo)} |${chalk.blue(record.fatherId)} |${
    record.Tipo !== "D" ? "---" : "==>"
  } |${chalk.yellow(record.Descripcion)} |${chalk.blue(record.Inicial)}`;

const consolaCompromiso = (record) =>
  `${record.cuentaNo} |${record.fatherId} |${record.Referencia} |${record.Observaciones}  |${record.MontoComprometido}`;

const consolaCausado = (record) =>
  `${record.cuentaNo} |${record.fatherId} |${record.Referencia} |${record.Observaciones}  |${record.MontoCausado}`;

const consolaPagado = (record) =>
  `${record.cuentaNo} |${record.fatherId} |${record.Referencia} |${record.Observaciones}  |${record.MontoPag}`;

const consolaModif = (record) =>
  `${record.cuentaNo} |${record.fatherId} |${record.TipoMod} |${record.Observaciones}  |${record.MontoMod}`;

const numeroCuenta = (cta) =>
  `${ceroleft(cta.Part, 2)}.${ceroleft(cta.Gene, 2)}.${ceroleft(cta.Espe, 2)}.${ceroleft(
    cta.Sub,
    2
  )}.${ceroleft(cta.Ordi, 3)}`;

const numeroCuentaFather = (cta) =>
  cta.Ordi > 0
    ? numeroCuenta(cta).slice(0, -4) + ".000"
    : cta.Ordi == 0 && cta.Sub > 0
    ? numeroCuenta(cta).slice(0, -7) + ".00.000"
    : cta.Ordi == 0 && cta.Sub == 0 && cta.Espe > 0
    ? numeroCuenta(cta).slice(0, -10) + ".00.00.000"
    : cta.Ordi == 0 && cta.Sub == 0 && cta.Espe == 0 && cta.Gene > 0
    ? numeroCuenta(cta).slice(0, -13) + ".00.00.00.000"
    : numeroCuenta(cta).slice(0, -13) + ".00.00.00.000";

const numeroCuentaCreateFather = (cuentaNo = "01.01.01.01.001") =>
  cuentaNo.slice(12, 0) >= "001"
    ? cuentaNo.slice(0, -4) + ".000"
    : cuentaNo.slice(9, -4) >= "01"
    ? cuentaNo.slice(0, -7) + ".00.000"
    : cuentaNo.slice(6, -7) >= "01"
    ? cuentaNo.slice(0, -10) + ".00.00.000"
    : cuentaNo.slice(3, -10) >= "01"
    ? cuentaNo.slice(0, -13) + ".00.00.00.000"
    : "00.00.00.00.000";

const sumaCuenta = (laColleccion, amoutName, accountName, accountFather) => {
  var totSumaCuenta = 0;
  laColleccion
    .filter((item) => item[accountName] == accountFather)
    .forEach((element) => {
      totSumaCuenta += element[amoutName];
    });
  return totSumaCuenta;
};

const sumaPadre = (laColleccion, elPadre) => {
  var total = 0;
  laColleccion
    .filter((item) => item.fatherId == elPadre)
    .forEach((element) => {
      total += element.Inicial;
    });
  return total;
};

const addCuentaNo = (laColleccion) =>
  laColleccion.map((cta) => ({
    ...cta,
    cuentaNo: numeroCuenta(cta),
    fatherId: numeroCuentaFather(cta),
  }));

const paginate = (array, page_size, page_number) => {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
};

const formatCurrency = (cents) => {
  return cents.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const formatDE = (num) => {
  return num
    .toFixed(2) // always two decimal digits
    .replace(".", ",") // replace decimal point character with ,
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // use . as a separator
};

const formatPorcDE = (num) => {
  return (
    num
      .toFixed(2) // always two decimal digits
      .replace(".", ",") // replace decimal point character with ,
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "%"
  ); // use . as a separator
};

// const verificarCuenta = (anoTrabajo, cuentaOrigen, nombreMonto, mesTrabajo = 12) => {
//   let nuevaCuentaVerifica = [];
//   let plantCuentas = addCuentaNo(cuentaPresup.filter((cta) => cta.Año == anoTrabajo)).sort(
//     ordenCuenta
//   );
//   let cuentaVerificar = addCuentaNo(
//     cuentaOrigen.filter((cta) => cta.Año == anoTrabajo && cta.Mes <= mesTrabajo)
//   ).sort(ordenCuenta);

//   // plantCuentas = addCuentaNo(plantCuentas);
//   // cuentaVerificar = addCuentaNo(cuentaVerificar);

//   plantCuentas.map((ctaFind) => {
//     let cuentaExiste = cuentaVerificar.find((laCta) => laCta.cuentaNo == ctaFind.cuentaNo);
//     if (!cuentaExiste) {
//       const findFather = {
//         cuentaNo: ctaFind.cuentaNo,
//         fatherId: numeroCuentaCreateFather(ctaFind.cuentaNo),
//         Referencia: "0000000",
//         nombreCuenta: ctaFind.Descripcion,
//         Observaciones: "",
//         [nombreMonto]: 0,
//         Dia: 1,
//         Mes: mesTrabajo,
//         Año: anoTrabajo,
//         Nivel: ctaFind.Nivel,
//       };
//       cuentaVerificar = [...cuentaVerificar, findFather];
//     } else {
//       cuentaExiste = {
//         ...cuentaExiste,
//         nombreCuenta: ctaFind.Descripcion,
//         Nivel: ctaFind.Nivel,
//       };
//       cuentaVerificar = [
//         ...cuentaVerificar.filter((cta) => cta.cuentaNo !== ctaFind.cuentaNo),
//         cuentaExiste,
//       ];
//     }
//   });

//   // let totalx = 0;
//   // plantCuentas.map((ctaFind) => {
//   //   totalx = cuentaVerificar.reduce((prev, curr) =>
//   //     prev + ctaFind.cuentaNo === curr.cuentaNo ? curr[nombreMonto] : 0
//   //   );
//   //   nuevaCuentaVerifica = [...nuevaCuentaVerifica, { ...ctaFind, [nombreMonto]: totalx }];

//   //   // let cuentaExiste = cuentaVerificar.find((laCta) => laCta.cuentaNo == ctaFind.cuentaNo);
//   // });

//   return cuentaVerificar;
// };

module.exports = {
  ceroleft,
  ordenCuenta,
  ordenCuentaDesc,
  numeroCuenta,
  numeroCuentaCreateFather,
  sumaPadre,
  addCuentaNo,
  sumaCuenta,
  consolaCompromiso,
  consolaPresup,
  consolaCausado,
  consolaPagado,
  consolaModif,
  formatCurrency,
  formatDE,
  formatPorcDE,
  paginate,
};
