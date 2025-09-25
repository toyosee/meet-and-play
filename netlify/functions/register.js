const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

// Generate a unique attendance code
function generateCode() {
  return "BTVRSEGAME-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * Generates an HTML string for the ticket.
 * @param {object} ticketData - The user and ticket information.
 * @returns {string} The complete HTML string for the email body.
 */
function generateTicketHtml(ticketData) {
  // We're no longer passing the QR data URL, as it will be attached and referenced by a cid.
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ddd;">
        <h1 style="color: #333;">Barterverse Meet And Play Ticket</h1>
      </div>

      <div style="padding: 20px;">
        <p style="font-size: 16px;"><strong>Name:</strong> ${ticketData.name}</p>
        <p style="font-size: 16px;"><strong>Email:</strong> ${ticketData.email}</p>
        <p style="font-size: 16px;"><strong>Game Type:</strong> ${ticketData.gameType}</p>
        <p style="font-size: 16px;"><strong>Attendance Code:</strong> ${ticketData.code}</p>
      </div>

      <div style="text-align: center; padding: 20px;">
        <p style="font-weight: bold;">Present this code for entry:</p>
        <!-- The image source now references the attachment by its Content-ID (cid) -->
        <img src="cid:qrcode_image" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #000;"/>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 2px solid #ddd;">
        <p style="color: red; font-size: 14px; font-weight: bold;">
          This ticket is valid for ONE DAY only and is NON-TRANSFERABLE.
        </p>
        <p style="font-size: 12px; color: #555;">
          For support, contact Barterverse:
        </p>
        <p style="font-size: 12px; color: #555;">
          ${process.env.MAIL_USER} | +2348069213941
        </p>
      </div>
    </div>
  `;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, phone, address, interests, hobby, gamer, gameType } = JSON.parse(event.body);
    const code = generateCode();
    const ticketData = { name, email, phone, address, interests, hobby, gamer, gameType, code };

    // Generate QR code as a buffer for attachment
    const qrImageBuffer = await QRCode.toBuffer(JSON.stringify(ticketData));

    // Generate HTML for the ticket. No need to pass the QR data URL anymore.
    const htmlContent = generateTicketHtml(ticketData);

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    // Send the email with the HTML content and the QR code as an attachment
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your Barterverse Gaming Meetup Ticket",
      html: htmlContent,
      attachments: [{
        filename: 'qrcode.png', // The name of the attachment file
        content: qrImageBuffer, // The image data as a buffer
        cid: 'qrcode_image' // The Content-ID to reference in the HTML
      }]
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Registration successful!", code }) };
  } catch (err) {
    console.error("❌ Error in register function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong" }) };
  }
};
