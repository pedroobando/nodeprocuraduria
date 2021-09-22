const express = require("express");
const path = require("path");
const presuRoutes = require("./presu.route");
const rutaRaizStatic = path.join(__dirname, "../../public");

const rutaError404 = (req, res) => {
  res.status(404).send(`Error 404 - No logro encontrar la ruta. `);
};

const routes = (app) => {
  app.use("/api/presu", presuRoutes);
  app.use("/", express.static(rutaRaizStatic));
  app.use(rutaError404);
};

module.exports = routes;
