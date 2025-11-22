import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("📩 /api/contact called");
  console.log("Body:", req.body);

  const { name, phone, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({
      error: "All fields are required",
      received: { name: !!name, phone: !!phone, message: !!message },
    });
  }

  // Load environment variables
  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  const SENDER_PASSWORD = process.env.SENDER_PASSWORD;
  const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;

  if (!SENDER_EMAIL || !SENDER_PASSWORD || !RECEIVER_EMAIL) {
    console.error("❌ Missing email environment variables");
    return res.status(500).json({
      error: "Email server not configured",
    });
  }

  // Configure transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD,
    },
  });

  try {
    const emailInfo = await transporter.sendMail({
      from: `"JBHC Contact" <${SENDER_EMAIL}>`,
      to: RECEIVER_EMAIL,
      subject: `New Contact Request from ${name}`,
      text: `
Name: ${name}
Phone: ${phone}
Message:
${message}
      `,
      html: `
      <h3>🌿 New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    console.log("✅ Email sent:", emailInfo.messageId);

    return res.status(200).json({
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
}
