const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const routeApp = require("./routes");

const app = express();
require("dotenv").config();

const thePort = process.env.PORT || 3001;
const theHost = process.env.HOST || "0.0.0.0";

// middlewares
if (process.env.NODE_ENV === "DEV") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
routeApp(app);

const main = () => {
  app.listen(thePort, () => {
    console.log(`http://${theHost}:${thePort}/`);
    console.log(`Starting  ${process.env.NODE_ENV} mode :-)`);
  });
};

main();
