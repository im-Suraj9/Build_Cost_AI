const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendWelcome = async (to, name) => {
  if (!process.env.EMAIL_USER) return;
  await transporter.sendMail({
    from: `"BuildCost AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to BuildCost AI! 🏗️',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to BuildCost AI</h1>
        </div>
        <div style="padding: 30px; background: #fff; border-radius: 0 0 10px 10px;">
          <h2>Hello, ${name}! 👋</h2>
          <p>Thank you for joining BuildCost AI — your intelligent construction cost estimation platform.</p>
          <p>With BuildCost AI, you can:</p>
          <ul>
            <li>Get AI-powered cost estimates instantly</li>
            <li>Plan materials and timelines</li>
            <li>Find verified contractors near you</li>
            <li>Download detailed PDF reports</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">Get Started</a>
        </div>
      </div>
    `
  });
};

const sendProjectUpdate = async (to, name, projectName, update) => {
  if (!process.env.EMAIL_USER) return;
  await transporter.sendMail({
    from: `"BuildCost AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Project Update: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Project Update 📋</h2>
        <p>Hi ${name}, your project <strong>${projectName}</strong> has an update:</p>
        <p>${update}</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #f97316; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View Project</a>
      </div>
    `
  });
};

module.exports = { sendWelcome, sendProjectUpdate };
