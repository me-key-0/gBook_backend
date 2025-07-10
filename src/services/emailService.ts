import nodemailer from "nodemailer";
import { logger } from "@/utils/logger";
import {
  generateOtpEmailTemplate,
  generateWelcomeEmailTemplate,
  generatePasswordResetTemplate,
} from "@/utils/emailTemplates";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OtpEmailData {
  firstName: string;
  lastName: string;
  otp: string;
  expiresInMinutes?: number;
}

interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  username: string;
  loginUrl?: string;
}

interface PasswordResetEmailData {
  firstName: string;
  lastName: string;
  otp: string;
  expiresInMinutes?: number;
}

class EmailService {
  private transporter!: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      const emailConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === "production",
        },
      };

      // Validate required environment variables
      if (
        !emailConfig.host ||
        !emailConfig.auth.user ||
        !emailConfig.auth.pass
      ) {
        logger.warn(
          "Email service not configured - missing required environment variables"
        );
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;

      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          logger.error("Email service configuration error:", error);
          this.isConfigured = false;
        } else {
          logger.info("✅ Email service configured successfully");
        }
      });
    } catch (error) {
      logger.error("Failed to initialize email service:", error);
      this.isConfigured = false;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn("Email service not configured - skipping email send");
      return false;
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || "yearBook",
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!,
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully to ${options.to}:`, {
        messageId: result.messageId,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      logger.error("Failed to send email:", error);
      return false;
    }
  }

  public async sendOtpEmail(to: string, data: OtpEmailData): Promise<boolean> {
    const subject = "Verify Your Email - yearBook";
    const html = generateOtpEmailTemplate(data);
    const text = `
      Hi ${data.firstName} ${data.lastName},
      
      Your verification code is: ${data.otp}
      
      This code will expire in ${data.expiresInMinutes || 10} minutes.
      
      If you didn't request this verification, please ignore this email.
      
      Best regards,
      The yearBook Team
    `;

    return this.sendEmail({ to, subject, html, text });
  }

  public async sendWelcomeEmail(
    to: string,
    data: WelcomeEmailData
  ): Promise<boolean> {
    const subject = "Welcome to yearBook! 🎓";
    const html = generateWelcomeEmailTemplate(data);
    const text = `
      Welcome to yearBook, ${data.firstName}!
      
      Your account has been successfully created with username: ${data.username}
      
      You can now log in and start connecting with your fellow graduates.
      
      ${data.loginUrl ? `Login here: ${data.loginUrl}` : ""}
      
      Best regards,
      The yearBook Team
    `;

    return this.sendEmail({ to, subject, html, text });
  }

  public async sendPasswordResetEmail(
    to: string,
    data: PasswordResetEmailData
  ): Promise<boolean> {
    const subject = "Reset Your Password - yearBook";
    const html = generatePasswordResetTemplate(data);
    const text = `
      Hi ${data.firstName} ${data.lastName},
      
      Your password reset code is: ${data.otp}
      
      This code will expire in ${data.expiresInMinutes || 10} minutes.
      
      If you didn't request a password reset, please ignore this email.
      
      Best regards,
      The yearBook Team
    `;

    return this.sendEmail({ to, subject, html, text });
  }

  public async sendTestEmail(to: string): Promise<boolean> {
    const subject = "yearBook Email Service Test";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Email Service Test</h2>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    `;
    const text = `
      Email Service Test
      
      This is a test email to verify that the email service is working correctly.
      Timestamp: ${new Date().toISOString()}
    `;

    return this.sendEmail({ to, subject, html, text });
  }

  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  public async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error("Email service connection verification failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
