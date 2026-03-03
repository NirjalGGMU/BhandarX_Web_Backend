const nodemailer = require('nodemailer');
const config = require('../../config');

/**
 * Email Service
 * Handles email sending functionality
 */
class EmailService {
  constructor() {
    // Create transporter (configure with actual SMTP settings)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-password',
      },
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(to, data) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'BhandarX IMS'}" <${process.env.SMTP_USER}>`,
      to,
      subject: data.title,
      html: this.getNotificationEmailTemplate(data),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  /**
   * Send low stock alert email
   */
  async sendLowStockAlertEmail(to, products) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'BhandarX IMS'}" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Low Stock Alert - Action Required',
      html: this.getLowStockEmailTemplate(products),
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Low stock alert email failed:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, name, tempPassword) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'BhandarX IMS'}" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome to BhandarX IMS',
      html: this.getWelcomeEmailTemplate(name, tempPassword),
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Welcome email failed:', error);
      throw error;
    }
  }

  /**
   * Get notification email template
   */
  getNotificationEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.APP_NAME || 'BhandarX IMS'}</h1>
          </div>
          <div class="content">
            <h2>${data.title}</h2>
            <p>Hi ${data.name},</p>
            <p>${data.message}</p>
            ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BhandarX IMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get low stock email template
   */
  getLowStockEmailTemplate(products) {
    const productList = products
      .map(
        (p) => `
        <tr>
          <td>${p.name}</td>
          <td>${p.sku}</td>
          <td>${p.quantity}</td>
          <td>${p.reorderPoint}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f44336; color: white; }
          .warning { color: #f44336; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="warning">⚠️ Low Stock Alert</h2>
          <p>The following products are running low on stock:</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
              </tr>
            </thead>
            <tbody>
              ${productList}
            </tbody>
          </table>
          <p style="margin-top: 20px;">Please take action to reorder these products.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get welcome email template
   */
  getWelcomeEmailTemplate(name, tempPassword) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to BhandarX IMS!</h2>
          <p>Hi ${name},</p>
          <p>Your account has been successfully created.</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>Please change your password after logging in.</p>
          <p>Best regards,<br>The BhandarX Team</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
