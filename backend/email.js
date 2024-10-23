const fs = require("fs");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const uuid = require("uuid");
const { Job, Recipient } = require("./models");

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
async function sendEmail(
    jobId,
    recipientEmail,
    name,
    department,
    emailSubject
) {
    try {
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
        console.log(`Email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        return false;
    }
}

function validateCSVRow(row) {
    const requiredFields = ["name", "email", "department_code"];
    const missingFields = requiredFields.filter((field) => !row[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!row.email.includes("@")) {
        throw new Error(`Invalid email format for: ${row.email}`);
    }
}

// Process CSV and create job
async function processEmailCSVAndCreateJob(
    filePath,
    departmentFilter = "all",
    original_file_name
) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Parse CSV first to validate all data before creating job
        const emailData = await parseCSV(filePath);

        // Validate data and filter by department if needed
        const validatedData = emailData.filter((row) => {
            try {
                validateCSVRow(row);
                return (
                    departmentFilter === "all" ||
                    row.department_code === departmentFilter
                );
            } catch (error) {
                console.warn(`Skipping invalid row: ${error.message}`);
                return false;
            }
        });

        if (validatedData.length === 0) {
            throw new Error("No valid recipients found in CSV");
        }

        // Create job
        const jobId = generateJobId(departmentFilter);
        const [job] = await Job.create(
            [
                {
                    jobId,
                    fileName: original_file_name, // Extract filename from path
                    departmentCode: departmentFilter,
                    totalRecipients: validatedData.length,
                    status: "processing",
                },
            ],
            { session }
        );

        // Create recipients
        const recipients = validatedData.map((row) => ({
            email: row.email,
            name: row.name,
            departmentCode: row.department_code,
            jobId: jobId,
            status: "processing",
        }));

        await Recipient.insertMany(recipients, { session });

        // Commit transaction
        await session.commitTransaction();

        // Clean up the temporary file
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting temporary file:", err);
        });

        return {
            job,
            recipients: validatedData,
            totalRecipients: validatedData.length,
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

// Background email sending function
async function sendEmailsInBackground(jobId, recipients) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update job status to processing
        await Job.findOneAndUpdate(
            { jobId },
            { status: "processing" },
            { session }
        );

        for (const recipient of recipients) {
            try {
                await sendEmail(
                    jobId,
                    recipient.email,
                    recipient.name,
                    recipient.department_code
                );

                // Update recipient status
                await Recipient.findOneAndUpdate(
                    { jobId, email: recipient.email },
                    {
                        status: "sent",
                        sentAt: new Date(),
                    },
                    { session }
                );

                // Update job success counter
                await Job.findOneAndUpdate(
                    { jobId },
                    { $inc: { successCount: 1 } },
                    { session }
                );
            } catch (error) {
                console.error(
                    `Failed to send email to ${recipient.email}:`,
                    error
                );

                // Update recipient failure status
                await Recipient.findOneAndUpdate(
                    { jobId, email: recipient.email },
                    {
                        status: "failed",
                        error: error.message,
                    },
                    { session }
                );

                // Update job failure counter
                await Job.findOneAndUpdate(
                    { jobId },
                    { $inc: { failureCount: 1 } },
                    { session }
                );
            }

            // Add delay between emails
            // can cause spam issues if not handled properly
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Update job status to completed
        await Job.findOneAndUpdate(
            { jobId },
            { status: "completed" },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        console.error("Error in background processing:", error);
        await session.abortTransaction();

        // Update job status to failed
        await Job.findOneAndUpdate({ jobId }, { status: "failed" });
    } finally {
        session.endSession();
    }
}

function generateJobId(department) {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
    const timeStr = timestamp.toTimeString().split(" ")[0].replace(/:/g, ""); // HHMMSS
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars

    // Format: DEPT-YYYYMMDD-HHMMSS-RAND
    // Example: CS-20240223-143022-X7B9
    return `${department.toUpperCase()}-${dateStr}-${timeStr}-${randomStr}`;
}

function formatJobDateTime(jobId) {
    // Extract date and time from jobId (e.g., "CS-20240223-143022-X7B9")
    const [_, dateStr, timeStr] = jobId.split("-");

    // Parse date (YYYYMMDD)
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    // Parse time (HHMMSS)
    const hour = timeStr.substring(0, 2);
    const minute = timeStr.substring(2, 4);
    const second = timeStr.substring(4, 6);

    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toLocaleString();
}

function parseJobId(jobId) {
    const [department, dateStr, timeStr, randomStr] = jobId.split("-");
    return {
        department,
        date: formatJobDateTime(jobId),
        reference: randomStr,
    };
}

module.exports = {
    parseCSV,
    sendEmail,
    sendEmailsInBackground,
    processEmailCSVAndCreateJob,
};
