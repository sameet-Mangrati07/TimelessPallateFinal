const express = require("express");
const { getAllInvoices, updateInvoiceStatus, deleteInvoice } = require("../controllers/invoices");
const { verifyTokenAdmin } = require("../middlewares/authAdmin");

const router = express.Router();

router.get("/admin/get-all-invoices", verifyTokenAdmin, getAllInvoices);
router.put("/admin/edit-invoice-status/:id", verifyTokenAdmin, updateInvoiceStatus);
router.delete("/admin/delete-invoice/:id", verifyTokenAdmin, deleteInvoice);

module.exports = router;
