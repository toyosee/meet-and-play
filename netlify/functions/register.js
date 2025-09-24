const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas"); // <-- Import createCanvas and loadImage

// Generate attendance code
function generateCode() {
  return "BTVRSEGAME-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Generate image as a buffer
async function generateTicketImage(ticketData, qrDataUrl) {
  const width = 800;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill with a background color (e.g., white)
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // Set font properties and draw text
  ctx.fillStyle = "#000";
  ctx.font = '24px "Arial"';
  ctx.textAlign = "center";
  ctx.fillText("Barterverse Meet And Play Ticket", width / 2, 50);

  ctx.textAlign = "left";
  ctx.font = '20px "Arial"';
  ctx.fillText(`Name: ${ticketData.name}`, 50, 150);
  ctx.fillText(`Email: ${ticketData.email}`, 50, 180);
  ctx.fillText(`Game Type: ${ticketData.gameType}`, 50, 210);
  ctx.fillText(`Attendance Code: ${ticketData.code}`, 50, 240);
  
  // Draw QR code image
  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, width / 2 - 100, 300, 200, 200);

  ctx.font = '16px "Arial"';
  ctx.textAlign = "center";
  ctx.fillStyle = "red";
  ctx.fillText("This ticket is valid for ONE DAY only and is NON-TRANSFERABLE.", width / 2, 600);

  ctx.fillStyle = "black";
  ctx.fillText("For support, contact Barterverse:", width / 2, 650);
  ctx.fillText("tyabolaji@gmail.com | +2348069213941", width / 2, 680);

  // Return the image as a buffer
  return canvas.toBuffer("image/jpeg");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, phone, address, interests, hobby, gamer, gameType } = JSON.parse(event.body);
    const code = generateCode();
    const ticketData = { name, email, phone, address, interests, hobby, gamer, gameType, code };

    // Generate QR
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData));

    // Generate image buffer instead of PDF
    const imageBuffer = await generateTicketImage(ticketData, qrDataUrl);

    // Email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your Barterverse Gaming Meetup Ticket",
      html: `<h2>Welcome, ${name}!</h2>
        <p>Registration successful! Here is your ticket:</p>
        <p><b>Ticket Code:</b> ${code}</p>
        <p>Your ticket is attached as an image.</p>`,
      attachments: [{ filename: `Gaming_Ticket_${code}.jpeg`, content: imageBuffer }], // <-- Change filename and content
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Registration successful!", code }) };
  } catch (err) {
    console.error("❌ Error in register function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong" }) };
  }
};