const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

// Generate a unique attendance code
function generateCode() {
  return "BTVRSEGAME-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * Generates an HTML string for the ticket.
 * @param {object} ticketData - The user and ticket information.
 * @param {string} qrDataUrl - The base64 data URL of the QR code image.
 * @returns {string} The complete HTML string for the email body.
 */
function generateTicketHtml(ticketData, qrDataUrl) {
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
        <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #000;"/>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 2px solid #ddd;">
        <p style="color: red; font-size: 14px; font-weight: bold;">
          This ticket is valid for ONE DAY only and is NON-TRANSFERABLE.
        </p>
        <p style="font-size: 12px; color: #555;">
          For support, contact Barterverse:
        </p>
        <p style="font-size: 12px; color: #555;">
          tyabolaji@gmail.com | +2348069213941
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

    // Generate QR code as a base64 data URL
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData));

    // Generate HTML for the ticket
    const htmlContent = generateTicketHtml(ticketData, qrDataUrl);

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    // Send the email with the HTML content
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your Barterverse Gaming Meetup Ticket",
      html: htmlContent, // Send the HTML string as the body
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Registration successful!", code }) };
  } catch (err) {
    console.error("❌ Error in register function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong" }) };
  }
};