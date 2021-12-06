const { Router } = require("express");
const path = require("path");

const {
  cuentaPresupuesto,
  cuentaModificacion,
  cuentaCompromiso,
  cuentaCompromisoDet,
  cuentaCausado,
  cuentaPagado,
} = require("../calcs/readPresupuesto");

const { consolidado, detMesComprometido } = require("../calcs/calcConsolidado");
const {
  createConsolidado,
  createConsolidadoMensual,
  createDetalleCompromiso,
} = require("../pdf/createConsolidado");
const resumenEjecucionPDF = require("../pdf/resumenEjecucionPDF");

const theRouter = Router();

theRouter.get("/", async (req, res) => {
  try {
    res.status(200).json("ok");
  } catch (error) {
    console.log(error);
  }
});

theRouter.post("/readdata", async (req, res) => {
  try {
    const typereport = req.body.typereport || "null";
    if (typereport === "CACUMULADO") await yearConsolidado(req, res);
    if (typereport === "CMENSUAL") await monthConsolidado(req, res);
    if (typereport === "DCOMPROMISOMENSUAL") await monthDetalladoComprometido(req, res);
    if (typereport === "REJECUCION") await resumenEjecucion(req, res);
  } catch (error) {
    res.status(401).json(`Error - ${error}`);
  }
});

const yearConsolidado = async (req, res) => {
  try {
    const year = parseInt(req.body.year, 10) || 2019;
    const month = parseInt(req.body.month, 10) || 12;

    const dataPresu = await cuentaPresupuesto(year);
    const dataModif = await cuentaModificacion(dataPresu, year, month);
    const dataCompro = await cuentaCompromiso(dataPresu, year, month);
    const dataCausado = await cuentaCausado(dataPresu, year, month);
    const dataPagado = await cuentaPagado(dataPresu, year, month);

    const retConsolidado = consolidado({
      presupuesto: dataPresu,
      modificacion: dataModif,
      comprometido: dataCompro,
      causado: dataCausado,
      pagado: dataPagado,
    });

    const fileName = "presupuesto.pdf";
    createConsolidado(retConsolidado, `./public/${fileName}`, year, month);
    setTimeout(() => {
      res.status(200).download(`./public/${fileName}`, `${fileName}`, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not download the file." + err,
          });
        }
      });
    }, 1000);
  } catch (error) {
    res.status(401).json(`Error - ${error}`);
  }
};

const monthConsolidado = async (req, res) => {
  try {
    const year = parseInt(req.body.year, 10) || 2019;
    const month = parseInt(req.body.month, 10) || 12;

    const dataPresu = await cuentaPresupuesto(year);
    const dataModif = await cuentaModificacion(dataPresu, year, month);
    const dataCompro = await cuentaCompromiso(dataPresu, year, month);
    const dataCausado = await cuentaCausado(dataPresu, year, month);
    const dataPagado = await cuentaPagado(dataPresu, year, month);

    const retConsolidado = consolidado({
      presupuesto: dataPresu,
      modificacion: dataModif,
      comprometido: dataCompro,
      causado: dataCausado,
      pagado: dataPagado,
      mesActivo: month,
    });

    const fileName = `presupuesto.pdf`;
    createConsolidadoMensual(retConsolidado, `./public/${fileName}`, year, month);
    setTimeout(() => {
      res.status(200).download(`./public/${fileName}`, `${fileName}`, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not download the file." + err,
          });
        }
      });
    }, 1000);
  } catch (error) {
    res.status(401).json(`Error - ${error}`);
  }
};

const monthDetalladoComprometido = async (req, res) => {
  try {
    const year = parseInt(req.body.year, 10) || 2019;
    const month = parseInt(req.body.month, 10) || 12;
    const cuenta = req.body.cuenta || "";

    // res.status(401).send("<h1>El Reporte no ha sido creado...</h1>");
    // return;

    const dataPresu = await cuentaPresupuesto(year);
    const dataCompro = await cuentaCompromisoDet(dataPresu, cuenta, year, month);

    // const retDetalleCompromiso = detMesComprometido({
    //   presupuesto: dataPresu,
    //   comprometido: dataCompro,
    // });

    const fileName = `presupuesto.pdf`;
    createDetalleCompromiso(dataCompro, `./public/${fileName}`, year, month);

    setTimeout(() => {
      res.status(200).download(`./public/${fileName}`, `${fileName}`, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not download the file." + err,
          });
        }
      });
    }, 1000);
  } catch (error) {
    res.status(401).json(`Error - ${error}`);
  }
};

const resumenEjecucion = async (req, res) => {
  try {
    const year = parseInt(req.body.year, 10) || 2019;
    const month = parseInt(req.body.month, 10) || 12;

    const dataPresu = await cuentaPresupuesto(year);
    const dataModif = await cuentaModificacion(dataPresu, year, month);
    const dataCompro = await cuentaCompromiso(dataPresu, year, month);
    const dataCausado = await cuentaCausado(dataPresu, year, month);
    const dataPagado = await cuentaPagado(dataPresu, year, month);

    const retConsolidado = consolidado({
      presupuesto: dataPresu,
      modificacion: dataModif,
      comprometido: dataCompro,
      causado: dataCausado,
      pagado: dataPagado,
    });



    const fileName = "presupuesto.pdf";
    resumenEjecucionPDF(retConsolidado, `./public/${fileName}`, year, month);
    setTimeout(() => {
      res.status(200).download(`./public/${fileName}`, `${fileName}`, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not download the file." + err,
          });
        }
      });
    }, 1000);
  } catch (error) {
    res.status(401).json(`Error - ${error}`);
  }
};

module.exports = theRouter;
