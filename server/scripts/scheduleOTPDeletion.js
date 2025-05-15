const schedule = require("node-schedule");
const Otp = require("../models/otp");

let scheduledOtpDeletions = new Map();

/**
 * Initialize OTP deletion scheduler
 */
function initializeOtpDeletionScheduler() {
    for (const job of scheduledOtpDeletions.values()) {
        job.cancel();
    }
    scheduledOtpDeletions.clear();

    scheduleAllOtpDeletions();
    console.log("OTP deletion scheduler initialized");
    return { scheduledOtpDeletions };
}

/**
 * Schedule deletion jobs for all OTPs not yet deleted and not past 24hrs after expiry
 */
async function scheduleAllOtpDeletions() {
    const now = new Date();
    let count = 0;

    try {
        const otps = await Otp.find({ expiry: { $exists: true } }).select("_id expiry");

        for (const otp of otps) {
            const deletionTime = new Date(otp.expiry.getTime() + 24 * 60 * 60 * 1000);
            if (deletionTime > now) {
                scheduleOtpDeletion(otp);
                count++;
            }
        }

        console.log(`Scheduled deletion for ${count} OTP records`);
        return count;
    } catch (error) {
        console.error("Error scheduling OTP deletions:", error);
    }
}

/**
 * Schedule deletion of OTP exactly 24 hours after its expiry
 */
function scheduleOtpDeletion(otp) {
    const otpId = otp._id.toString();

    if (!otp.expiry) {
        console.warn(`[OTP Skipped] OTP ${otpId} has no expiry`);
        return;
    }

    const deletionTime = new Date(otp.expiry.getTime() + 24 * 60 * 60 * 1000);

    if (scheduledOtpDeletions.has(otpId)) {
        scheduledOtpDeletions.get(otpId).cancel();
    }

    if (deletionTime <= new Date()) {
        console.log(`[OTP Already Expired] OTP ${otpId} is past deletion time`);
        return;
    }

    const job = schedule.scheduleJob(deletionTime, async () => {
        try {
            await Otp.deleteOne({ _id: otpId });
            console.log(`[OTP Deleted] OTP ${otpId} deleted 24 hours after expiry`);
        } catch (error) {
            console.error(`[Error deleting OTP ${otpId}]:`, error);
        } finally {
            scheduledOtpDeletions.delete(otpId);
        }
    });

    scheduledOtpDeletions.set(otpId, job);

    const minsToDelete = Math.floor((deletionTime - new Date()) / (1000 * 60));
    console.log(`Scheduled OTP ${otpId} deletion in ${minsToDelete} minutes`);
}

/**
 * Restore OTP deletions on server restart
 */
async function restoreScheduledOtpDeletions() {
    try {
        initializeOtpDeletionScheduler();

        const now = new Date();

        // Immediately delete expired OTPs that are past their 24hr grace period
        const expiredOtps = await Otp.find({
            expiry: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        });

        for (const otp of expiredOtps) {
            await Otp.deleteOne({ _id: otp._id });
        }

        if (expiredOtps.length > 0) {
            console.log(`Deleted ${expiredOtps.length} OTPs that were past 24hr expiry period`);
        }

    } catch (error) {
        console.error("Error restoring OTP deletion scheduler:", error);
    }
}

module.exports = { scheduleOtpDeletion, restoreScheduledOtpDeletions };