const uuid = require("uuid-random");

function generateInvoiceNumber(prefix = "SA") {
    // Generate UUID and remove dashes
    const uuidPart = uuid().replace(/-/g, "").toUpperCase();

    return `${prefix}-${uuidPart}`;
}

module.exports = { generateInvoiceNumber };
