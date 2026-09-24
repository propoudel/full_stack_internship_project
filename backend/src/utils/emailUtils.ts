import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  toEmail: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Job Portal" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2>Hi ${name},</h2>
        <p>Thanks for registering on Job Portal. Please verify your email address to activate your account.</p>
        <a href="${verificationLink}" style="display:inline-block; padding:10px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:5px;">
          Verify Email
        </a>
        <p>Or copy this link into your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  });
};

export const sendProfileReminderEmail = async(toEmail:string):Promise<void> =>{
  await transporter.sendMail({
    from: `"Job Portal" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Complete your Employer profile",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2>Hi ,</h2>
        <p>We noticed you created a company while your account is still set to the default role.</p>
        <p>To get the full Employer experience — including managing job postings and applications — please consider updating your role in your profile settings.</p>
      </div>
    `,
  })
}