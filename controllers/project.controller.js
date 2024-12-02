const  mongoose = require("mongoose");
const Project = require("../models/project.model");
const asyncHandler = require("express-async-handler");

// /projects/
// METHOD: POST
// ACCESS: Admins only
// DESC: this function handles creating a new project 

const createProject = asyncHandler(async(req,res)=>{
    const {projectType, endDate, budget, overview, isPublished} = req.body;
    
    // check if endDate is a future date
    if(new Date(endDate) < new Date()){
        res.status(400)
        throw new Error("End date must be a future date");
    }

    const timeline = {
        startDate: new Date(),
        endDate: new Date(endDate)
    };
    let project = null;
    try{        
        project = await Project.create({
            projectType,
            timeline,
            budget: parseInt(budget),
            overview,
            isPublished
        });
    }catch(error){
        res.status(400);
        throw new Error("Database Error occured please check input data");
    }

    if(!project){
        res.status(500);
        throw new Error("Something went wrong try again");
    }

    return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project
    });
});

// /projects/
// METHOD: GET
// ACCESS: Public
// DESC: this function handles fetching all projects

const getAllProjects = asyncHandler(async(req,res)=>{
    // Check for pagination queries
    const {page = 1, limit = 10} = req.query;

    let projects = null;
    try{
        projects = await Project.find({})
       .skip((page - 1) * limit)
       .limit(parseInt(limit));
    }catch(error){
        res.status(500);
        throw new Error("Database Error occured please check input data");
    }
    
    if(!projects || projects.length < 1){
        res.status(404);
        throw new Error("No projects found");
    }

    // add pagination to response
    const totalProjects = await Project.countDocuments({});
    const totalPages = Math.ceil(totalProjects / limit);
    res.header("X-Pagination-Total-Pages", totalPages);
    res.header("X-Pagination-Page", page);
    res.header("X-Pagination-Limit", limit);

    const pagination = {
        total: totalProjects,
        totalPages,
        page,
        limit
    }
    
    return res.status(200).json({
        success: true,
        message: "Projects fetched successfully",
        data: projects,
        pagination
    });
});

// /projects/:projectId
// METHOD: GET
// ACCESS: Public
// DESC: this function handles fetching project by project Id

const getProject = asyncHandler(async(req,res)=>{
    const {projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID format",
        });
    }

    let project = null;
    try{
        project = await Project.findById(projectId);
    }catch(error){
        res.status(500);
        throw new Error("Database Error occured please confirm input");
    }
    
    if(!project){
        res.status(404);
        throw new Error("Project not found");
    }
    return res.status(200).json({
        success: true,
        data: project
    });
});

// /projects/:projectId
// METHOD: PUT
// ACCESS: admin only
// DESC: Update allowed project details

const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Validate the projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID format",
        });
    }

    // Ensure there is data to update
    if (!req.body || Object.keys(req.body).length < 1) {
        res.status(400);
        throw new Error("No data provided to update");
    }

    // Find the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error("Project not found");
    }

    // Validate endDate if provided
    if (req.body.endDate) {
        if (new Date(req.body.endDate) <= new Date()) {
            res.status(400);
            throw new Error("`endDate` must be a future date");
        }
        project.timeline.endDate = req.body.endDate;
    }

    // Validate and filter request body keys
    const validKeys = Object.keys(Project.schema.obj); // Get schema keys
    validKeys.push("endDate");
    const invalidKeys = Object.keys(req.body).filter(key => !validKeys.includes(key));

    // Throw an error if there are invalid keys
    if (invalidKeys.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Invalid field(s): ${invalidKeys.join(", ")}`,
        });
    }

    // Assign valid updates to the project
    Object.assign(project, req.body);
    await project.save();

    // Respond with the updated project
    return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: project,
    });
});

// /projects/:projectId
// METHOD: DELETE
// ACCESS: admin only
// DESC: Delete project

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Validate the projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID format",
        });
    }

    // Find the project by ID and delete
    try{
        await Project.findByIdAndDelete(projectId);
    }catch(err){
        res.status(500);
        throw new Error("Failed to delete project")
    }
    

    // Respond with a success message
    return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
    });
});



module.exports = {
    createProject,
    getAllProjects,
    getProject,
    updateProject,
    deleteProject,
};