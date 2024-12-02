const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const projectRoute = require("./project.route");
const eventRoute = require("./event.route");
const adminRoute = require("./admin.route");
const Router = express.Router();


Router.use("/auth",authRoute);
Router.use("/users", userRoute);
Router.use("/projects", projectRoute);
Router.use("/events", eventRoute);
Router.use("/admin", adminRoute);
module.exports = Router;