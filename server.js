"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const cors = require("cors");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

app.use(helmet.frameguard({ action: "SAMEORIGIN" }))
app.use(helmet.dnsPrefetchControl());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));

app.set('view engine', 'pug')
app.use(
	"/public",
	express.static(process.cwd() + "/public")
);

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//For FCC testing purposes
fccTestingRoutes(app);

myDB(async (client) => {
	// Database
	const db = await client
		.db("message_board")
		.collection("threads");
	//Routing for API
	apiRoutes(app, db);

	//404 Not Found Middleware
	app.use(function (req, res, next) {
		res.status(404).type("text").send("Not Found");
	});

	//Start our server and tests!
	app.listen(process.env.PORT || 3000, function () {
		console.log("Listening on port " + process.env.PORT);
		if (process.env.NODE_ENV === "test") {
			console.log("Running Tests...");
			setTimeout(function () {
				try {
					runner.run();
				} catch (e) {
					var error = e;
					console.log("Tests are not valid:");
					console.log(error);
				}
			}, 1500);
		}
	});

	module.exports = {app: app, db: db};
});

// module.exports = {app: app, db: db}; //for testing
