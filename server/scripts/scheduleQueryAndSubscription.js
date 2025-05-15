const schedule = require("node-schedule");
const User = require("../models/users");

let scheduledUserSubscripionAndQuery = new Map();

/**
 * Initialize the subscription management scheduler
 */
function initializeSubscriptionScheduler() {
    for (const job of scheduledUserSubscripionAndQuery.values()) {
        job.cancel();
    }
    scheduledUserSubscripionAndQuery.clear();

    scheduleMonthlyQueryReset();
    scheduleAllUserExpiryJobs();

    console.log("Subscription scheduler initialized");
    return { scheduledUserSubscripionAndQuery };
}

/**
 * Schedule a global reset job for usedQuery on the 1st of every month
 */
function scheduleMonthlyQueryReset() {
    // 0 0 1 * * => midnight on the 1st of every month
    schedule.scheduleJob("0 0 1 * *", async () => {
        try {
            const result = await User.updateMany({}, { $set: { usedQuery: 0 } });
            console.log(`[Monthly Reset] Reset usedQuery for ${result.modifiedCount} users`);
        } catch (error) {
            console.error("[Monthly Reset Error]:", error);
        }
    });

    console.log("Scheduled monthly query reset for all users (1st of month)");
}

/**
 * Schedule expiry jobs for all active paid users
 */
async function scheduleAllUserExpiryJobs() {
    const now = new Date();
    let totalScheduled = 0;

    try {
        const users = await User.find({
            plan: { $in: ["regular", "pro"] },
            subscriptionStatus: "active",
            planEndDate: { $gt: now }
        }).select("_id planEndDate plan subscriptionStatus");

        for (const user of users) {
            scheduleUserExpiry(user);
            totalScheduled++;
        }

        console.log(`Scheduled ${totalScheduled} users active subscription expiry`);
        return totalScheduled;
    } catch (error) {
        console.error("Error scheduling expiry jobs:", error);
        return 0;
    }
}

/**
 * Schedule a job to set subscriptionStatus to "expired" at planEndDate
 */
function scheduleUserExpiry(user) {
    const userId = user._id.toString();
    const planEndDate = user.planEndDate;

    if (!planEndDate || !(planEndDate instanceof Date)) {
        console.warn(`[Skip Expiry] User ${userId} has invalid or missing planEndDate`);
        return;
    }

    if (scheduledUserSubscripionAndQuery.has(userId)) {
        scheduledUserSubscripionAndQuery.get(userId).cancel();
    }

    if (planEndDate <= new Date()) {
        console.log(`[Already Expired] User ${userId} planEndDate already passed`);
        return;
    }

    const job = schedule.scheduleJob(planEndDate, async () => {
        try {
            const refreshedUser = await User.findById(userId);

            if (
                refreshedUser &&
                refreshedUser.subscriptionStatus === "active" &&
                ["regular", "pro"].includes(refreshedUser.plan)
            ) {
                await User.updateOne(
                    { _id: userId },
                    { $set: { subscriptionStatus: "expired" } }
                );
                console.log(`[Plan Expired] User ${userId} subscription expired at planEndDate: ${planEndDate.toISOString()}`);
            }

            scheduledUserSubscripionAndQuery.delete(userId);
        } catch (error) {
            console.error(`[Error in expiry job for user ${userId}]:`, error);
        }
    });

    scheduledUserSubscripionAndQuery.set(userId, job);

    const timeToExpiry = Math.floor((planEndDate - new Date()) / (1000 * 60));
    console.log(`Scheduled subcription expiry of user ${userId} in ${timeToExpiry} minutes`);
}

/**
 * Handle subscription update for a single user
 */
async function handleUserSubscriptionUpdate(user) {
    const userId = user._id.toString();
    const now = new Date();

    if (user.planEndDate <= now && user.subscriptionStatus !== "expired") {
        await User.updateOne(
            { _id: userId },
            { $set: { subscriptionStatus: "expired" } }
        );
        console.log(`[Subscription Expired Immediately] User ${userId}`);

        if (scheduledUserSubscripionAndQuery.has(userId)) {
            scheduledUserSubscripionAndQuery.get(userId).cancel();
            scheduledUserSubscripionAndQuery.delete(userId);
        }
    } else if (
        user.subscriptionStatus === "active" &&
        ["regular", "pro"].includes(user.plan) &&
        user.planEndDate > now
    ) {
        scheduleUserExpiry(user);
    }
}

/**
 * Restore all scheduled jobs on server restart
 */
async function restoreScheduledQueryAndSubscription() {
    try {
        initializeSubscriptionScheduler();

        const now = new Date();

        // Log active subscriptions
        const activePaidCount = await User.countDocuments({
            planEndDate: { $gte: now },
            plan: { $in: ["regular", "pro"] },
            subscriptionStatus: "active"
        });
        console.log(`Restored expiry scheduling for ${activePaidCount} active paid subscriptions`);

        // Immediately expire overdue subscriptions
        const expiredUsers = await User.find({
            planEndDate: { $lt: now },
            subscriptionStatus: { $ne: "expired" },
            plan: { $in: ["regular", "pro"] }
        });

        for (const user of expiredUsers) {
            await User.updateOne(
                { _id: user._id },
                { $set: { subscriptionStatus: "expired" } }
            );
        }

        if (expiredUsers.length > 0) {
            console.log(`Expired ${expiredUsers.length} users whose plans ended during downtime`);
        }

        // If it's the 1st day of the month, perform immediate monthly reset
        if (now.getDate() === 1) {
            const result = await User.updateMany({}, { $set: { usedQuery: 0 } });
            console.log(`[Startup Monthly Reset] Reset usedQuery for ${result.modifiedCount} users`);
        }

    } catch (error) {
        console.error("Error restoring subscription system:", error);
    }
}

module.exports = { handleUserSubscriptionUpdate, restoreScheduledQueryAndSubscription };
