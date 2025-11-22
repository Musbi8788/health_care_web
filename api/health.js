export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    emailConfigured: !!(
      process.env.SENDER_EMAIL &&
      process.env.SENDER_PASSWORD &&
      process.env.RECEIVER_EMAIL
    ),
  });
}
