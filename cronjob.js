const cron = require('node-cron');
const http = require('http');
require("dotenv").config();

// Function to make a request to keep the server alive
const keepServerAlive = () => {
    http.get(`${process.env.APP_URL}/api/v1/`);
    console.log('Pinged the server to keep it alive');
};

// Schedule a cron job to run every two hours
cron.schedule('0 */2 * * *', () => {
    keepServerAlive();
});

console.log('Cron job scheduled to run every two hours');
