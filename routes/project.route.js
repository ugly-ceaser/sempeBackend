const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const adminCheck = require("../middlewares/adminCheck");
const { createProject, getAllProjects, getProject, updateProject, deleteProject } = require("../controllers/project.controller");

const projectRoute = express.Router();

projectRoute.route("/")
    .post(validateToken, adminCheck, checkForMissingFields(["projectType","endDate","budget", "overview"]),createProject)
    .get(getAllProjects);

projectRoute.route("/:projectId")
    .get(getProject)
    .put(validateToken, adminCheck, updateProject)
    .delete(validateToken, adminCheck, deleteProject)

module.exports = projectRoute;