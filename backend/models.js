const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
            unique: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        departmentCode: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["processing", "completed", "failed"],
            default: "processing",
        },
        totalRecipients: {
            type: Number,
            required: true,
        },
        successCount: {
            type: Number,
            default: 0,
        },
        failureCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        collection: "jobs",
    }
);

const RecipientSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        departmentCode: {
            type: String,
            required: true,
        },
        jobId: {
            type: String,
            required: true,
            ref: "Job",
        },
        status: {
            type: String,
            enum: ["processing", "sent", "failed"],
            default: "processing",
        },
        hasRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        sentAt: {
            type: Date,
        },
        error: {
            type: String,
        },
    },
    {
        timestamps: true,
        collection: "recipients",
    }
);

// Add indexes for read tracking queries
RecipientSchema.index({ jobId: 1, email: 1 });
RecipientSchema.index({ jobId: 1, hasRead: 1 });
RecipientSchema.index({ jobId: 1, departmentCode: 1, hasRead: 1 });

JobSchema.index({ jobId: 1 });
JobSchema.index({ departmentCode: 1 });

const Job = mongoose.model("Job", JobSchema);
const Recipient = mongoose.model("Recipient", RecipientSchema);

module.exports = { Job, Recipient };
