const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

// Generate a unique attendance code
function generateCode() {
  return "BTVRSEGAME-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * Generates an HTML string for the ticket (sent to user).
 */
function generateTicketHtml(ticketData) {
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

/**
 * Generates an HTML string for the admin notification.
 */
function generateAdminHtml(ticketData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fefefe;">
      <h2 style="color: #444;">📩 New User Signup</h2>
      <p><strong>Name:</strong> ${ticketData.name}</p>
      <p><strong>Email:</strong> ${ticketData.email}</p>
      <p><strong>Phone:</strong> ${ticketData.phone || "N/A"}</p>
      <p><strong>Game Type:</strong> ${ticketData.gameType}</p>
      <p><strong>Attendance Code:</strong> ${ticketData.code}</p>
      <hr/>
      <p style="font-size: 12px; color: #555;">
        This is an automated notification to <b>${process.env.MAIL_USER}</b>.
      </p>
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

    const htmlContent = generateTicketHtml(ticketData);
    const adminContent = generateAdminHtml(ticketData);

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    // 1️⃣ Send ticket to user
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your Barterverse Gaming Meetup Ticket",
      html: htmlContent,
      attachments: [{
        filename: "qrcode.png",
        content: qrImageBuffer,
        cid: "qrcode_image"
      }]
    });

    // 2️⃣ Send notification to admin
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_USER,
      subject: `📥 New Signup: ${name}`,
      html: adminContent
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Registration successful!", code }) };
  } catch (err) {
    console.error("❌ Error in register function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong" }) };
  }
};
