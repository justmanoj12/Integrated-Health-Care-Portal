const nodemailer = require('nodemailer');

// ------------------ OTP Email Template ------------------
function generateOtpEmail(firstName, otp) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px;">
      <h2 style="text-align:center; color:#2a7a3b;">Integrated Health Care</h2>
      <h3 style="text-align:center; color:#4CAF50;">Email Verification</h3>

      <p>Hello <strong>${firstName}</strong>,</p>

      <p>Thank you for signing up with <strong>Integrated Health Care</strong>.
      Please use the verification code below to complete your account setup:</p>

      <div style="background:#f0f0f0; padding: 20px; margin:20px 0; border-radius:6px; text-align:center;">
        <span style="font-size:32px; letter-spacing: 8px;"><strong>${otp}</strong></span>
      </div>

      <p style="text-align:center;">This code expires in <strong>10 minutes</strong>.</p>

      <hr>

      <p style="font-size:12px; color:#777;">If you did not request this verification, please ignore this email.</p>
      <p style="text-align:center; font-size:12px; color:#777;">© 2025 Integrated Health Care. All rights reserved.</p>
    </div>
  </div>
  `;
}

function appointmentConfirmedEmail({
  patientName,
  doctorName,
  date,
  time
}) {
  return `
  <div style="background:#f4f6f8; padding:30px; font-family: Arial, sans-serif;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#2563eb; padding:22px; text-align:center;">
        <h1 style="margin:0; color:#ffffff;">Integrated Health Care</h1>
        <p style="margin:6px 0 0; color:#dbeafe; font-size:14px;">
          Appointment Confirmation
        </p>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <h2 style="color:#111827;">Hello ${patientName},</h2>

        <p style="font-size:15px; color:#374151; line-height:1.6;">
          We’re happy to inform you that your appointment has been
          <strong style="color:#16a34a;">successfully approved</strong>
          by <strong>Dr. ${doctorName}</strong>.
        </p>

        <!-- Appointment Details -->
        <div style="margin:25px 0; padding:18px; border-radius:8px; background:#f9fafb; border:1px solid #e5e7eb;">
          <h3 style="margin-top:0; color:#1f2937;">📋 Appointment Details</h3>
          <p style="margin:8px 0;"><strong>📅 Date:</strong> ${date}</p>
          <p style="margin:8px 0;"><strong>⏰ Time:</strong> ${time}</p>
          <p style="margin:8px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
        </div>

        <p style="font-size:14px; color:#374151;">
          Please log in to your dashboard to view full details, prescriptions,
          or to manage your appointment.
        </p>

        <!-- CTA -->
        <div style="text-align:center; margin-top:30px;">
          <a href="http://localhost:3000/dashboard"
            style="background:#2563eb; color:#ffffff; padding:12px 26px;
                   border-radius:6px; text-decoration:none; font-size:15px;
                   font-weight:600; display:inline-block;">
            Go to Dashboard
          </a>
        </div>

        <!-- Support -->
        <p style="margin-top:30px; font-size:13px; color:#6b7280;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
        © 2025 Integrated Health Care · All rights reserved
      </div>

    </div>
  </div>
  `;
}



// ------------------ Transporter ------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    family: 4,                 // ✅ FORCE IPV4
    rejectUnauthorized: false
  }
});


// ------------------ Send Mail Function ------------------
async function sendMail(to, subject, html, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });

    console.log(`Email sent → ${to}`);
    return info;

  } catch (error) {
    console.error(`❌ Error sending email:`, error.message);
    return null;
  }
}

// ------------------ Export Functions ------------------
module.exports = {
  sendMail,
  generateOtpEmail,
  appointmentConfirmedEmail
};

