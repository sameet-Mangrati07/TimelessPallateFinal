require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { createAdmin } = require("./scripts/setup");
const { restoreScheduledSessionExpiries } = require("./scripts/scheduleSessionExpiry");
const { restoreScheduledInvoiceDeletions } = require("./scripts/scheduleInvoiceDeletion");
const { restoreScheduledQueryAndSubscription } = require("./scripts/scheduleQueryAndSubscription");
const { restoreScheduledOtpDeletions } = require("./scripts/scheduleOTPDeletion");

const PORT = process.env.PORT;
const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(helmet());
// app.use(mongoSanitize());

createAdmin();

app.use("/api/v1", require("./routes/admin"));
app.use("/api/v1", require("./routes/auth"));
app.use("/api/v1", require("./routes/users"));
app.use("/api/v1", require("./routes/sessions"));
app.use("/api/v1", require("./routes/otp"));
app.use("/api/v1", require("./routes/tickets"));
app.use("/api/v1", require("./routes/esewa"));
app.use("/api/v1", require("./routes/khalti"));
app.use("/api/v1", require("./routes/invoices"));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

restoreScheduledSessionExpiries();
restoreScheduledInvoiceDeletions();
restoreScheduledQueryAndSubscription();
restoreScheduledOtpDeletions();
