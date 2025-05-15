/**
 * @desc Generate a PDF invoice with proper formatting, equal column widths, and compact size
 */
const generateInvoicePDF = async (invoiceData) => {
    const PDFDocument = require("pdfkit");

    return new Promise((resolve, reject) => {
        try {
            // Extract invoice data
            const {
                invoiceNumber,
                transactionDate,
                transactionId,
                subscriberName,
                plan,
                billingCycle,
                price,
                paymentMethod,
                email
            } = invoiceData;

            // Create a new PDF document with custom size (smaller than A4)
            const doc = new PDFDocument({
                size: [595, 650], // Reduced height from standard A4 (595x842)
                margin: 40
            });

            // Buffer to store PDF
            const buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Set document metadata
            doc.info.Title = `Invoice-${invoiceNumber}`;
            doc.info.Author = "Sajilo AI";

            // Add header with company name
            doc.fontSize(12)
                .font("Helvetica-Bold")
                .text("Sajilo AI", {
                    align: "center"
                });
            doc.fontSize(12)
                .font("Helvetica-Bold")
                .text("Kathmandu 44600, Nepal", {
                    align: "center"
                });

            // Add company email
            doc.fontSize(12)
                .font("Helvetica-Bold")
                .text("Email: sajiloai@gmail.com", {
                    align: "center",
                    lineGap: 5
                });

            // Add INVOICE title
            doc.moveDown(1);
            doc.fontSize(18)
                .font("Helvetica-Bold")
                .text("INVOICE", {
                    align: "center"
                });
            doc.moveDown(1);

            // Add invoice basic details
            const invoiceDetailsY = doc.y;
            doc.font("Helvetica-Bold")
                .fontSize(10)
                .text("Invoice No:", 40, invoiceDetailsY);
            doc.font("Helvetica")
                .text(invoiceNumber || "", 100, invoiceDetailsY);

            doc.font("Helvetica-Bold")
                .text("Date:", 470, invoiceDetailsY);
            doc.font("Helvetica")
                .text(transactionDate || "", 500, invoiceDetailsY);

            doc.moveDown(1);

            // Define the table layout with equal column widths
            const tableTop = doc.y + 10;
            const tableLeft = 40;
            const tableWidth = doc.page.width - 80;
            const columnWidths = [tableWidth / 2, tableWidth / 2]; // Equal columns
            const rowHeight = 25;
            
            // Define all rows including the Total Amount row
            const rows = [
                ["Subscriber's Name", subscriberName || ""],
                ["Subscriber's Email", email || ""],
                ["Transaction ID", transactionId || ""],
                ["Plan", plan || ""],
                ["Billing Cycle", billingCycle || ""],
                ["Payment Method", paymentMethod || ""],
                ["Total Amount", price || ""] // Include Total Amount as the last row
            ];
            
            // Set position for table start
            doc.y = tableTop;

            // Draw table header background
            doc.rect(tableLeft, doc.y, tableWidth, rowHeight).fillAndStroke("#E9E9E9", "#000000");

            // Draw header text
            doc.fillColor("#000000")
                .fontSize(12)
                .font("Helvetica-Bold")
                .text("Description", tableLeft + 10, doc.y + 8, { width: columnWidths[0] - 10 });
            doc.text("Details", tableLeft + columnWidths[0] + 10, doc.y - 12, { width: columnWidths[1] - 10 });

            // Reset stroke color for consistent borders
            doc.strokeColor("#000000");

            // Draw all vertical lines for the table
            doc.moveTo(tableLeft, tableTop).lineTo(tableLeft, tableTop + (rows.length + 1) * rowHeight).stroke(); // Left border
            doc.moveTo(tableLeft + columnWidths[0], tableTop).lineTo(tableLeft + columnWidths[0], tableTop + (rows.length + 1) * rowHeight).stroke(); // Middle vertical line
            doc.moveTo(tableLeft + tableWidth, tableTop).lineTo(tableLeft + tableWidth, tableTop + (rows.length + 1) * rowHeight).stroke(); // Right border
            
            // Draw all horizontal lines for the table
            for (let i = 0; i <= rows.length + 1; i++) {
                const lineY = tableTop + i * rowHeight;
                doc.moveTo(tableLeft, lineY).lineTo(tableLeft + tableWidth, lineY).stroke();
            }
            
            // Now fill in the text for each row
            let currentY = tableTop + rowHeight; // Start after header
            
            // Fill in all rows except the last one (Total Amount)
            for (let i = 0; i < rows.length - 1; i++) {
                doc.font("Helvetica")
                   .fontSize(10)
                   .text(rows[i][0], tableLeft + 10, currentY + 8, { width: columnWidths[0] - 20 });
                doc.text(rows[i][1], tableLeft + columnWidths[0] + 10, currentY + 8, { width: columnWidths[1] - 20 });
                
                currentY += rowHeight;
            }
            
            // Draw the Total Amount row with bold text
            doc.font("Helvetica-Bold")
               .fontSize(12)
               .text(rows[rows.length - 1][0], tableLeft + 10, currentY + 8, { width: columnWidths[0] - 20 });
            doc.text(rows[rows.length - 1][1], tableLeft + columnWidths[0] + 10, currentY + 8, { width: columnWidths[1] - 20 });
            
            // Update y position after the full table
            doc.y = tableTop + (rows.length + 1) * rowHeight;
            doc.moveDown(1);

            // Add a horizontal line
            doc.moveTo(40, doc.y)
                .lineTo(doc.page.width - 40, doc.y)
                .stroke();

            // Reset text position to the left margin
            const pageWidth = doc.page.width;
            const textX = doc.page.margins.left;
            const textWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

            // Add footer note
            doc.moveDown(1);
            doc.font("Helvetica")
                .fontSize(10);
            doc.text("Thank you for your business with Sajilo AI.", textX, doc.y, {
                width: textWidth,
                align: "center",
                italic: true
            });

            // Add payment verification text
            doc.moveDown(1);
            doc.fontSize(8);
            doc.text("This is an automatically generated invoice after payment verification.", textX, doc.y, {
                width: textWidth,
                align: "center"
            });

            // Add timestamp at the bottom
            doc.moveDown(0.5);
            doc.fontSize(8);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, textX, doc.y, {
                width: textWidth,
                align: "center"
            });

            // Finalize the PDF document
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
