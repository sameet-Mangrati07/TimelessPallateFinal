const mongoose = require("../configs/db");

const invoiceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userFullName: { type: String, required: true },
    userEmail: { type: String, required: true },
    invoiceNumber: { type: String, unique: true, required: true },
    productCode: { type: String },
    signature: { type: String },
    transactionCode: { type: String },
    plan: { type: String, required: true, enum: ["regular", "pro"] },
    billingCycle: { type: String, required: true, enum: ["monthly", "yearly"] },
    price: { type: Number, required: true, enum: [1000, 2000, 10800, 21600] },
    status: { type: String, required: true, enum: ["pending", "paid", "failed", "refunded"] },
    paymentMethod: { type: String, required: true, enum: ["esewa", "khalti"] },
    nonRefundAgreement: { type: String, required: true, enum: ["yes", "no"] }, // yes - user agrees to non-refund policy, no - user does not agree
    issuedDate: { type: Date, required: true }
}, {
    timestamps: true
});

const Invoice = mongoose.model("Invoices", invoiceSchema, "invoices");

module.exports = Invoice;
