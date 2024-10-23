const fs = require("fs");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
// SMTP configuration
const SMTP_SERVER = "smtp.gmail.com";
const SMTP_PORT = 587;
const SENDER_EMAIL = "fy.faiyew@gmail.com";
const SENDER_PASSWORD = "btiladgtfgdhbmnj";

// Create email transporter
const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    secure: false,
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
    },
});

// Load email data from CSV buffer
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
}

// Send single email
async function sendEmail(recipientEmail, name, department, emailSubject) {
    try {
        const jobId = "1";
        const emailBody = `
            <html>
                <body>
                    <p>Hello ${name},</p>
                    <p>This is a test email for department ${department}.</p>
                    <p>Job ID: ${jobId}</p>
                </body>
            </html>
        `;

        const mailOptions = {
            from: SENDER_EMAIL,
            to: recipientEmail,
            subject: emailSubject,
            html: emailBody,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        return false;
    }
}

module.exports = { parseCSV, sendEmail };
