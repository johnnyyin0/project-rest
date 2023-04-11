const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const cors = require('cors');
const routes = require('./routes.js');
const app = express();
const cookieParser = require('cookie-parser')
const db = require("./database");

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

app.use('/', routes);

const port = process.env.PORT || 3000;

db.connect()
  .then(() => {
    console.log("Connected to the database");
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
  });