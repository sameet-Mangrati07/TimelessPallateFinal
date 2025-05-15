const schedule = require("node-schedule");
const Session = require("../models/sessions");

let scheduledSessionExpirations = new Map();

/**
 * Initialize session expiration scheduler
 */
function initializeSessionExpirationScheduler() {
    for (const job of scheduledSessionExpirations.values()) {
        job.cancel();
    }
    scheduledSessionExpirations.clear();

    scheduleAllActiveSessionExpirations();
    console.log("Session expiration scheduler initialized");
    return { scheduledSessionExpirations };
}

/**
 * Schedule all active sessions for expiration at their expiresAt datetime
 */
async function scheduleAllActiveSessionExpirations() {
    const now = new Date();
    let count = 0;

    try {
        const sessions = await Session.find({
            status: "active",
            expiresAt: { $gt: now }
        }).select("_id expiresAt");

        for (const session of sessions) {
            scheduleSessionExpiry(session);
            count++;
        }

        console.log(`Scheduled expiration for ${count} sessions`);
        return count;
    } catch (error) {
        console.error("Error scheduling session expirations:", error);
        return 0;
    }
}

/**
 * Schedule expiration for a single session
 */
function scheduleSessionExpiry(session) {
    const sessionId = session._id.toString();
    const expiresAt = session.expiresAt;

    if (!expiresAt || expiresAt <= new Date()) {
        console.warn(`[Skip Scheduling] Session ${sessionId} has already expired or invalid expiresAt`);
        return;
    }

    if (scheduledSessionExpirations.has(sessionId)) {
        scheduledSessionExpirations.get(sessionId).cancel();
    }

    const job = schedule.scheduleJob(expiresAt, async () => {
        try {
            const fresh = await Session.findById(sessionId);
            if (fresh && fresh.status === "active") {
                await Session.updateOne({ _id: sessionId }, { $set: { status: "expired" } });
                console.log(`[Session Expired] Session ${sessionId} expired at ${expiresAt.toISOString()}`);
            }
        } catch (error) {
            console.error(`[Error Expiring Session ${sessionId}]:`, error);
        } finally {
            scheduledSessionExpirations.delete(sessionId);
        }
    });

    scheduledSessionExpirations.set(sessionId, job);

    const minsToExpire = Math.floor((expiresAt - new Date()) / (1000 * 60));
    console.log(`Scheduled session ${sessionId} to expire in ${minsToExpire} minutes`);
}

/**
 * Restore session expirations on server restart
 */
async function restoreScheduledSessionExpiries() {
    try {
        initializeSessionExpirationScheduler();

        const now = new Date();

        // Immediately expire overdue active sessions
        const expired = await Session.find({
            status: "active",
            expiresAt: { $lte: now }
        });

        for (const session of expired) {
            await Session.updateOne({ _id: session._id }, { $set: { status: "expired" } });
        }

        if (expired.length > 0) {
            console.log(`[Startup Cleanup] Expired ${expired.length} sessions past expiresAt`);
        }
    } catch (error) {
        console.error("Error restoring session expirations:", error);
    }
}

module.exports = { scheduleSessionExpiry, restoreScheduledSessionExpiries };
