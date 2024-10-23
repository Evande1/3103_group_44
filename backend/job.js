const { Job, Recipient } = require("./models");
const uuid = require("uuid");

async function createEmailJob(csvData, departmentCode, fileName) {
    const jobId = uuid.v4();

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create the job
        const job = await Job.create(
            [
                {
                    jobId,
                    fileName,
                    departmentCode,
                    totalRecipients: csvData.length,
                    status: "pending",
                },
            ],
            { session }
        );

        // Create recipients
        const recipients = csvData.map((row) => ({
            email: row.email,
            name: row.name,
            departmentCode: row.department_code,
            jobId: jobId,
            status: "pending",
        }));

        await Recipient.insertMany(recipients, { session });

        await session.commitTransaction();
        return job[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

async function updateRecipientStatus(jobId, email, success, error = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update recipient status
        await Recipient.findOneAndUpdate(
            { jobId, email },
            {
                status: success ? "sent" : "failed",
                sentAt: success ? new Date() : null,
                error: error,
            },
            { session }
        );

        // Update job counters
        await Job.findOneAndUpdate(
            { jobId },
            {
                $inc: success ? { successCount: 1 } : { failureCount: 1 },
            },
            { session }
        );

        // Check if job is complete
        const job = await Job.findOne({ jobId }, null, { session });
        if (job.successCount + job.failureCount === job.totalRecipients) {
            job.status = "completed";
            await job.save({ session });
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

module.exports = { createEmailJob, updateRecipientStatus };
