const User = require("../models/users");
const Invoice = require("../models/invoices");
const { generateInvoiceNumber } = require("../scripts/generateInvoiceNumber");
const { scheduleInvoiceDeletion } = require("../scripts/scheduleInvoiceDeletion");
const { handleUserSubscriptionUpdate } = require("../scripts/scheduleQueryAndSubscription");
const { generateInvoicePDF } = require("../scripts/generateInvoicePdf");
const { transporter } = require("../scripts/nodemailerTransporter");
const path = require("path");

/**
 * @desc Initiate khalti payment
 * @route POST /api/v1/users/payment/khalti/initiate/:id
 * @access Private
 */
exports.initiateKhaltiPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const { plan, billingCycle, price, nonRefundAgreement } = req.body;

        if (!id || !plan || !billingCycle || !price || !nonRefundAgreement) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (nonRefundAgreement !== "yes") {
            return res.status(400).json({ message: "You must agree to the non-refund policy" });
        }

        const invoiceNumber = generateInvoiceNumber();

        const KHALTI_URL = process.env.NODE_ENV === "production" ? "https://khalti.com/api/v2/epayment/initiate/" : "https://dev.khalti.com/api/v2/epayment/initiate/";

        // Check for existing pending / failed invoices
        let invoice = await Invoice.findOne({
            userId: id,
            plan,
            billingCycle,
            price,
            status: { $in: ["pending", "failed"] },
            paymentMethod: "khalti"
        });

        if (invoice) {
            // Update existing invoice with new invoice number
            invoice.invoiceNumber = invoiceNumber;
        } else {
            // Create new invoice
            invoice = new Invoice({
                userId: id,
                userFullName: user.fullName,
                userEmail: user.email,
                invoiceNumber,
                productCode: "KHALTI",
                signature: "",
                transactionCode: "",
                plan,
                billingCycle,
                price,
                status: "pending",
                paymentMethod: "khalti",
                nonRefundAgreement,
                issuedDate: new Date()
            });
        }

        try {
            // Initialize Khalti payment using fetch
            const response = await fetch(KHALTI_URL, {
                method: "POST",
                headers: {
                    "Authorization": `key ${process.env.KHALTI_SECRET_KEY}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "return_url": "http://localhost:5173/settings",
                    "website_url": "http://localhost:5173",
                    "amount": price * 100, // Convert to paisa (Khalti expects amount in paisa)
                    "purchase_order_id": invoiceNumber,
                    "purchase_order_name": `${plan}-${billingCycle}`,
                    "customer_info": {
                        "name": user.fullName,
                        "email": user.email
                    }
                })
            });

            if (!response.ok) {
                invoice.status = "failed";
                await invoice.save();
                scheduleInvoiceDeletion(invoice);
                return res.status(400).json({ message: "Khalti API error" });
            }

            await invoice.save();

            const khaltiResponse = await response.json();

            // Schedule the deletion of the invoice if it's status is pending / failed after 48 hours
            scheduleInvoiceDeletion(invoice);

            res.status(200).json({ paymentUrl: khaltiResponse.payment_url });
        } catch (error) {
            console.error("Error initiating payment - khalti:", error);
            res.status(500).json({ message: "Server error - Initiating Payment Khalti" });
        }
    } catch (error) {
        console.error("Error initiating payment - khalti:", error);
        res.status(500).json({ message: "Server error - Initiating Payment Khalti" });
    }
}

/**
 * @desc Verify khalti payment
 * @route POST /api/v1/users/payment/khalti/verify/:id
 * @access Private
 */
exports.verifyKhaltiPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const { khaltiData } = req.body;

        if (!id || !khaltiData) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Required fields to validate
        const requiredFields = [
            "pidx",
            "transaction_id",
            "status",
            "purchase_order_id"
        ];

        const missingFields = requiredFields.filter(field => !(field in khaltiData));

        if (missingFields.length > 0) {
            return res.status(400).json({ message: "Missing fields in khalti data" });
        }

        if (khaltiData.status !== "Completed") {
            return res.status(400).json({ message: "Payment not completed - Khalti" });
        }

        const invoiceNumber = khaltiData.purchase_order_id;

        const pidx = khaltiData.pidx;

        const invoice = await Invoice.findOne({ invoiceNumber, userId: id, status: { $in: ["pending", "failed"] }, paymentMethod: "khalti" });

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const KHALTI_VERIFY_URL = process.env.NODE_ENV === "production" ? "https://khalti.com/api/v2/epayment/lookup/" : "https://dev.khalti.com/api/v2/epayment/lookup/";

        const response = await fetch(KHALTI_VERIFY_URL, {
            method: "POST",
            headers: {
                "Authorization": `key ${process.env.KHALTI_SECRET_KEY}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pidx })
        });

        const result = await response.json();

        if (!response.ok || result.status !== "Completed") {
            invoice.status = "failed";
            await invoice.save();
            scheduleInvoiceDeletion(invoice);
            return res.status(400).json({ success: false, message: "Khalti verification failed or not completed" });
        }

        // Update invoice
        invoice.signature = result.pidx
        invoice.transactionCode = result.transaction_id;
        invoice.status = "paid";
        invoice.issuedDate = new Date();

        await invoice.save();

        const now = new Date();

        let planEndDate;

        const isSamePlan = user.plan === invoice.plan;

        const isSameCycle = user.billingCycle === invoice.billingCycle;

        const hasSubscription = (user.subscriptionStatus === "active" || user.subscriptionStatus === "cancelled") && new Date(user.planEndDate) > now;

        // Decide base date for extension or reset
        const baseDate = (isSamePlan && isSameCycle && hasSubscription)
            ? new Date(user.planEndDate)
            : now;

        // If it's a new plan or different billing cycle, reset start date
        user.planStartDate = baseDate === now ? now : user.planStartDate;

        if (invoice.billingCycle === "monthly") {
            planEndDate = new Date(baseDate);
            planEndDate.setMonth(planEndDate.getMonth() + 1);
        } else if (invoice.billingCycle === "yearly") {
            planEndDate = new Date(baseDate);
            planEndDate.setFullYear(planEndDate.getFullYear() + 1);
        } else {
            return res.status(400).json({ message: "Invalid billing cycle" });
        }

        let queryLimit = 0;
        if (invoice.plan === "regular") {
            queryLimit = 100;
        } else if (invoice.plan === "pro") {
            queryLimit = 200;
        } else {
            return res.status(400).json({ message: "Invalid plan" });
        }

        user.plan = invoice.plan;
        user.billingCycle = invoice.billingCycle;
        user.subscriptionStatus = "active";
        user.planEndDate = planEndDate;
        user.queryLimit = queryLimit;

        await user.save();

        handleUserSubscriptionUpdate(user);

        const invoiceData = {
            invoiceNumber: invoice.invoiceNumber,
            transactionDate: invoice.issuedDate.toLocaleDateString(),
            transactionId: invoice.transactionCode,
            subscriberName: invoice.userFullName,
            email: invoice.userEmail,
            plan: invoice.plan.charAt(0).toUpperCase() + invoice.plan.slice(1), // Capitalize first letter
            billingCycle: invoice.billingCycle.charAt(0).toUpperCase() + invoice.billingCycle.slice(1), // Capitalize first letter
            price: `NPR Rs.${invoice.price}`,
            paymentMethod: "Khalti"
        };

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoiceData);

        const htmlContentKhalti = `
                 <div style="background-color: #F6F6F6; font-family: Helvetica, sans-serif; text-align: left; padding: 20px; border: 1px solid #ddd; max-height: 100vh; max-width: 100vw; margin: auto; border-radius: 10px">
                     <div style="margin-bottom: 14px; display: flex; align-items: center;">
                        <img src="cid:logo" alt="logo" style="width: 50px; height: 50px;">
                        <h1 style="font-size: 18px; margin-left: 14px;">Sajilo AI</h1>
                     </div>
                     <div style="background-color: #FFFFFF; text-align: left; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto; border-radius: 10px">
                        <p style="font-size: 16px;">Dear ${invoice.userFullName},</p>
                        <p style="font-size: 16px; text-color: black;">Greetings from Sajilo AI,</p>
                        <p style="font-size: 16px; text-color: black;">Please find your invoice attached below. If you have any questions, feel free to contact us through the Contact page on our website or email us at<br/>
                        <a href="mailto:raijohn54321@gmail.com" target="_blank" rel="noopener noreferrer" style="text: blue; text-decoration: underline;">raijohn54321@gmail.com</a></p>
                        <p style="font-size: 16px; text-color: black;">Thank you for your business.</p>
                        <p style="font-size: 16px; text-color: black;">Regards, Sajilo AI</p>
                     </div>
                     <footer style="margin-top: 20px; text-align:center; font-size: 12px; color: #888;">This message was sent from Sajilo AI, 44600 Kathmandu, NP.</footer>
                 </div>
             `;

        const mailOptions = {
            from: process.env.EMAIL,
            to: invoice.userEmail,
            subject: `Sajilo AI - Invoice #${invoice.invoiceNumber}`,
            html: htmlContentKhalti,
            attachments: [
                {
                    filename: `Invoice-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf"
                },
                {
                    filename: "logo.png",
                    path: path.join(__dirname, "logo.png"),
                    cid: "logo"
                }]
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Payment successful - Khalti" });
    } catch (error) {
        console.error("Error verifying payment - eSewa:", error);
        res.status(500).json({ success: false, message: "Server error - Verifying Payment eSewa" });
    }
}
