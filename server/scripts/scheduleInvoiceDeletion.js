const schedule = require("node-schedule");
const Invoice = require("../models/invoices");

let scheduledInvoiceDeletions = new Map();

/**
 * Initialize invoice deletion scheduler
 */
function initializeInvoiceDeletionScheduler() {
    for (const job of scheduledInvoiceDeletions.values()) {
        job.cancel();
    }
    scheduledInvoiceDeletions.clear();

    scheduleAllPendingOrFailedInvoiceDeletions();

    console.log("Invoice deletion scheduler initialized");
    return { scheduledInvoiceDeletions };
}

/**
 * Schedule deletion jobs for all pending or failed invoices
 */
async function scheduleAllPendingOrFailedInvoiceDeletions() {
    const now = new Date();
    let count = 0;

    try {
        const invoices = await Invoice.find({
            status: { $in: ["pending", "failed"] },
            issuedDate: { $exists: true },
        }).select("_id issuedDate status");

        for (const invoice of invoices) {
            const deletionTime = new Date(invoice.issuedDate.getTime() + 48 * 60 * 60 * 1000);

            if (deletionTime > now) {
                scheduleInvoiceDeletion(invoice);
                count++;
            }
        }

        console.log(`Scheduled deletion for ${count} invoices`);
        return count;
    } catch (error) {
        console.error("Error scheduling invoice deletions:", error);
    }
}

/**
 * Schedule a job to delete invoice 48 hours after issuedDate,
 * or cancel it if marked as paid
 */
function scheduleInvoiceDeletion(invoice) {
    const invoiceId = invoice._id.toString();

    // Cancel existing job if any
    if (scheduledInvoiceDeletions.has(invoiceId)) {
        scheduledInvoiceDeletions.get(invoiceId).cancel();
        scheduledInvoiceDeletions.delete(invoiceId);
    }

    if (invoice.status === "paid") {
        console.log(`[Invoice Deletion Cancelled] Invoice ${invoiceId} marked as paid`);
        return;
    }

    if (!invoice.issuedDate) {
        console.warn(`[Invoice Skipped] Invoice ${invoiceId} has no issuedDate`);
        return;
    }

    const deletionTime = new Date(invoice.issuedDate.getTime() + 48 * 60 * 60 * 1000);

    if (deletionTime <= new Date()) {
        console.log(`[Invoice Already Expired] Invoice ${invoiceId} is past deletion time`);
        return;
    }

    const job = schedule.scheduleJob(deletionTime, async () => {
        try {
            const latest = await Invoice.findById(invoiceId);
            if (latest && ["pending", "failed"].includes(latest.status)) {
                await Invoice.deleteOne({ _id: invoiceId });
                console.log(`[Invoice Deleted] Invoice ${invoiceId} deleted after 48 hrs`);
            }
        } catch (error) {
            console.error(`[Error deleting invoice ${invoiceId}]:`, error);
        } finally {
            scheduledInvoiceDeletions.delete(invoiceId);
        }
    });

    scheduledInvoiceDeletions.set(invoiceId, job);

    const minsToDelete = Math.floor((deletionTime - new Date()) / (1000 * 60));
    console.log(`Scheduled deletion of invoice ${invoiceId} in ${minsToDelete} minutes`);
}

/**
 * Restore all invoice deletion jobs on server restart
 */
async function restoreScheduledInvoiceDeletions() {
    try {
        initializeInvoiceDeletionScheduler();

        const now = new Date();
        const expiredInvoices = await Invoice.find({
            status: { $in: ["pending", "failed"] },
            issuedDate: { $lte: new Date(now.getTime() - 48 * 60 * 60 * 1000) }
        });

        for (const invoice of expiredInvoices) {
            await Invoice.deleteOne({ _id: invoice._id });
        }

        if (expiredInvoices.length > 0) {
            console.log(`Deleted ${expiredInvoices.length} overdue invoices at startup`);
        }
    } catch (error) {
        console.error("Error restoring invoice deletion scheduler:", error);
    }
}

module.exports = { scheduleInvoiceDeletion, restoreScheduledInvoiceDeletions };