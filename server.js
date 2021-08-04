const express = require("express");
const config = require("./app/config/db.config");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
    origin: config.URL
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());
// app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync();
// db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Database with { force: true }');
// });

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to prom application." });
});

require("./app/routes/menu.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/merchant.routes")(app);
require("./app/routes/transaction.routes")(app);
require("./app/routes/swabber.routes")(app);
require("./app/routes/history.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});