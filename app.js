require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");

// NEW
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("flash");
const passportSetup = require("./passport/setup");

mongoose.Promise = Promise;
mongoose
  .connect(process.env.database_url, { useMongoClient: true })
  .then(() => {
    console.log("Connected to Mongo!");
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// new
app.use(
  session({
    secret: "secret different for every app",
    saveUninitialized: true,
    resave: true,
    // STORE session data in MongoDB (otherwise we are logged out constantly)
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
// FLASH FEEDBACK
app.use(flash());

//must come after  session
passportSetup(app);

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

const index = require("./routes/index");
app.use("/", index);

//new routes
const authRouter = require("./routes/auth-router");
app.use("/", authRouter);

const adminRouter = require("./routes/admin-router");
app.use("/", adminRouter);

const trip = require("./routes/trip");
app.use("/", trip);

const activity = require("./routes/activity-router");
app.use("/", activity);

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

module.exports = app;
