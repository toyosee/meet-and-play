const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

function generateCode() {
  return "BTVRSEGAME-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Convert PDF stream to buffer
function generateTicketPDF(ticketData, qrDataUrl) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // PDF content
    doc.fontSize(20).text("Barterverse Meet And Play Ticket", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${ticketData.name}`);
    doc.text(`Email: ${ticketData.email}`);
    doc.text(`Phone: ${ticketData.phone}`);
    doc.text(`Address: ${ticketData.address}`);
    doc.text(`Game Type: ${ticketData.gameType}`);
    doc.text(`Attendance Code: ${ticketData.code}`);
    doc.moveDown();

    doc.fontSize(12).text("Show this QR code at the entrance:", { align: "left" });
    doc.image(qrDataUrl, { fit: [150, 150], align: "center" });
    doc.moveDown();

    doc.fontSize(10).fillColor("red")
      .text("This ticket is valid for ONE DAY only and is NON-TRANSFERABLE.", {
        align: "center",
      })
      .moveDown();

    doc.fillColor("black")
      .text("For support, contact Barterverse:", { align: "center" });
    doc.text(`${process.env.MAIL_USER} | +2348069213941`, { align: "center" });

    doc.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, phone, address, interests, hobby, gamer, gameType } = JSON.parse(event.body);

    const code = generateCode();
    const ticketData = { name, email, phone, address, interests, hobby, gamer, gameType, code };

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData));

    // Generate PDF as Buffer
    const pdfBuffer = await generateTicketPDF(ticketData, qrDataUrl);

    // Mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your Barterverse Gaming Meetup Ticket",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Registration successful!</p>
        <p>Here is your ticket to attend the <b>Barterverse Gaming Meetup</b>:</p>
        <ul>
          <li><b>Ticket Code:</b> ${code}</li>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Game Type:</b> ${gameType}</li>
        </ul>
        <p>🎟 Show this QR code at the event entrance:</p>
        <img src="${qrDataUrl}" alt="QR Code Ticket"/>
        <br><br>
        <p style="color:red"><b>⚠️ Note:</b> This ticket is valid for <u>ONE DAY only</u> and is <u>NON-TRANSFERABLE</u>.</p>
        <hr/>
        <p>For support, contact Barterverse:</p>
        <p>📧 ${process.env.MAIL_USER}<br/>☎️ +2348069213941</p>
      `,
      attachments: [
        {
          filename: `Gaming_Ticket_${code}.pdf`,
          content: pdfBuffer, // ✅ Now a Buffer, works in serverless
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Registration successful! Check your email for your ticket.",
        code,
      }),
    };
  } catch (err) {
    console.error("❌ Error in register function:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
};
