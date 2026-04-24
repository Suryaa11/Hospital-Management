const nodemailer = require('nodemailer');

const sendInviteEmail = async (name, email, password, loginLink) => {
    try {
        // Create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, 
                pass: process.env.SMTP_PASS, 
            },
        });

        // HTML Email Template
        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2b6cb0; text-align: center;">Welcome to Hospital Management System</h2>
                <p>Hello Dr. <strong>${name}</strong>,</p>
                <p>An administrator has created an account for you. Please use the following credentials to log in for the first time.</p>
                <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${password}</p>
                </div>
                <p style="color: #e53e3e;"><em>Note: You will be required to change this password upon your first login.</em></p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${loginLink}" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #718096; text-align: center;">
                    If you did not expect this email, please contact the administrator.
                </p>
            </div>
        `;

        let info = await transporter.sendMail({
            from: '"Hospital Admin" <admin@hospital.com>',
            to: email,
            subject: "Your Doctor Account Details - Action Required",
            html: htmlTemplate,
        });

        console.log("Message sent: %s", info.messageId);
        if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendInviteEmail };
