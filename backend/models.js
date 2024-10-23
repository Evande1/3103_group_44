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
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
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
            enum: ["pending", "sent", "failed"],
            default: "pending",
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

JobSchema.index({ jobId: 1 });
JobSchema.index({ departmentCode: 1 });
RecipientSchema.index({ jobId: 1 });
RecipientSchema.index({ email: 1 });
RecipientSchema.index({ departmentCode: 1 });

const Job = mongoose.model("Job", JobSchema);
const Recipient = mongoose.model("Recipient", RecipientSchema);

module.exports = { Job, Recipient };
