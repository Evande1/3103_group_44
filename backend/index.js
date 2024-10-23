const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const fs = require("fs");
const app = express();
const cors = require("cors");
const port = 3030;
const upload = multer({ dest: "uploads/" });

const { Job, Recipient } = require("./models");
const path = require("path");
const {
    processEmailCSVAndCreateJob,
    sendEmailsInBackground,
} = require("./email");

// connect to mongodb
mongoose.connect(
    "mongodb+srv://3103:RBm2TluHJL2X8V2B@3103.4rmps.mongodb.net/mailing?retryWrites=true&w=majority&appName=3103/"
);
// mongodb+srv://3103:RBm2TluHJL2X8V2B@3103.4rmps.mongodb.net/?retryWrites=true&w=majority&appName=3103

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// get image
app.use("/images", express.static("images"));

// track viewing
// app.get("/image.png", async (req, res) => {
//     const userId = req.query.userId; // Either get userId from query or generate a new one
//     const jobId = req.query.jobId;

//     console.log("userId:", userId);
//     console.log("jobId:", jobId);
//     if (!userId && !jobId) {
//         console.log("error no userId or jobId");
//         res.sendFile(path.join(__dirname, "images/download.png"));
//         return;
//     }
//     try {
//         // Check if there is already a click from this user with the same params
//         const user = await Departments.findOne({ email: userId, jobId });

//         if (!user) {
//             // Store the click data in MongoDB if no existing record is found
//             console.log("error no user found");
//         } else {
//             await Departments.updateOne(
//                 { email: userId, jobId },
//                 { $set: { hasRead: true } }
//             );
//             console.log(`User ${userId} clicked the link with jobId ${jobId}`);
//             // might need to redo this in the future
//             res.sendFile(path.join(__dirname, "images/download.png"));
//         }
//     } catch (error) {
//         console.error("Failed to track click:", error);
//         res.status(500).send("Failed to track click");
//     }
// });

app.get("/image.png", async (req, res) => {
    const userId = req.query.userId;
    const jobId = req.query.jobId;
    console.log("Tracking - userId:", userId, "jobId:", jobId);

    // Always have a default path to the tracking pixel
    const defaultImagePath = path.join(__dirname, "images/download.png");

    if (!userId || !jobId) {
        console.log("Error: Missing userId or jobId");
        return res.sendFile(defaultImagePath);
    }

    try {
        // Find recipient and update read status
        const recipient = await Recipient.findOne({
            email: userId,
            jobId: jobId,
            status: "sent", // Only track if email was successfully sent
        });

        if (!recipient) {
            console.log("Error: No recipient found for", userId, jobId);
            return res.sendFile(defaultImagePath);
        }

        // Update read status if not already read
        if (!recipient.hasRead) {
            await Recipient.updateOne(
                { email: userId, jobId: jobId },
                {
                    $set: {
                        hasRead: true,
                        readAt: new Date(),
                    },
                }
            );
            console.log(
                `Updated read status for user ${userId} with jobId ${jobId}`
            );
        } else {
            console.log(
                `Email already marked as read for user ${userId} with jobId ${jobId}`
            );
        }

        // Always send the tracking pixel
        res.sendFile(defaultImagePath);
    } catch (error) {
        console.error("Failed to track email read:", error);
        res.sendFile(defaultImagePath);
    }
});

// get all jobs
app.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find()
            .sort({ createdAt: -1 }) // Most recent first
            .limit(50); // Limit to last 50 jobs
        res.status(200).send(jobs);
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        res.status(500).send("Failed to fetch jobs");
    }
});

app.get("/api/jobs/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;

        // First find the job
        const job = await Job.findOne({ jobId });

        if (!job) {
            return res.status(404).send("Job not found");
        }

        // Use aggregation to group recipients and include read status
        const departmentStats = await Recipient.aggregate([
            // Match recipients for this job
            {
                $match: {
                    jobId: jobId,
                },
            },
            // Group by department
            {
                $group: {
                    _id: "$departmentCode",
                    count: { $sum: 1 },
                    recipients: {
                        $push: {
                            email: "$email",
                            name: "$name",
                            status: "$status",
                            sentAt: "$sentAt",
                            hasRead: { $ifNull: ["$hasRead", false] },
                            readAt: "$readAt",
                            error: "$error",
                        },
                    },
                    // Count statuses
                    sent: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "sent"] }, 1, 0],
                        },
                    },
                    failed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
                        },
                    },
                    processing: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "processing"] }, 1, 0],
                        },
                    },
                    // Count read status
                    read: {
                        $sum: {
                            $cond: [{ $eq: ["$hasRead", true] }, 1, 0],
                        },
                    },
                },
            },
            // Reshape for final output
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    count: 1,
                    recipients: 1,
                    stats: {
                        sent: "$sent",
                        failed: "$failed",
                        processing: "$processing",
                        read: "$read",
                        unread: { $subtract: ["$count", "$read"] },
                        readRate: {
                            $cond: [
                                { $eq: ["$sent", 0] },
                                0,
                                {
                                    $multiply: [
                                        {
                                            $divide: ["$read", "$sent"],
                                        },
                                        100,
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
            // Sort by department name
            {
                $sort: {
                    name: 1,
                },
            },
        ]);

        // Calculate total stats safely
        const totalStats = departmentStats.reduce(
            (acc, dept) => {
                const stats = dept.stats || {};
                return {
                    sent: (acc.sent || 0) + (stats.sent || 0),
                    failed: (acc.failed || 0) + (stats.failed || 0),
                    processing: (acc.processing || 0) + (stats.processing || 0),
                    read: (acc.read || 0) + (stats.read || 0),
                    unread: (acc.unread || 0) + (stats.unread || 0),
                };
            },
            { sent: 0, failed: 0, processing: 0, read: 0, unread: 0 }
        );

        // Calculate read rate for total stats
        totalStats.readRate =
            totalStats.sent > 0 ? (totalStats.read / totalStats.sent) * 100 : 0;

        // Combine job data with department stats
        const response = {
            ...job.toObject(),
            departments: departmentStats,
            totalStats,
        };

        res.status(200).send(response);
    } catch (error) {
        console.error("Failed to fetch job details:", error);
        res.status(500).send("Failed to fetch job details");
    }
});
app.post("/api/send-emails", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // default to all departments if not specified
        const department = req.body.department || "all";

        const original_file_name = req.file.originalname;
        // creates a job in the database
        const result = await processEmailCSVAndCreateJob(
            req.file.path,
            department,
            original_file_name
        );

        // Start sending emails in background
        sendEmailsInBackground(result.job.jobId, result.recipients);

        res.json({
            success: true,
            jobId: result.job.jobId,
            totalRecipients: result.totalRecipients,
            message: `Started processing ${result.totalRecipients} emails for job ${result.job.jobId}`,
        });
    } catch (error) {
        console.error("Error processing CSV:", error);
        res.status(500).json({
            error: "Failed to process CSV file",
            details: error.message,
        });
    }
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// nic can try later
// {id, dept, filename, viewcount, total} ->
// {id : count }
// app.get('/stats/all', async (req, res) => {
//   const clicks = await Click.find({}); // return the whole list
//   res.send({
//     clicks: clicks,
//   });
// });

// get clicks for job
// app.get('/stats', async (req, res) => {
//   const clicksForJob = await Click.find({ jobId: req.query.jobId });
//   res.send({
//     jobId: req.query.jobId,
//     clicks: clicksForJob.length,
//   });
// });
