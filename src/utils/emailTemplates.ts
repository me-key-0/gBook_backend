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

export const generateOtpEmailTemplate = (data: OtpEmailData): string => {
  const { firstName, lastName, otp, expiresInMinutes = 10 } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - YearBook</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          color: #374151;
          margin-bottom: 30px;
        }
        .otp-container {
          background-color: #f3f4f6;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
        }
        .otp-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #3B82F6;
          letter-spacing: 8px;
          margin: 0;
          font-family: 'Courier New', monospace;
        }
        .expiry-info {
          font-size: 14px;
          color: #ef4444;
          margin-top: 15px;
          font-weight: 500;
        }
        .instructions {
          background-color: #eff6ff;
          border-left: 4px solid #3B82F6;
          padding: 20px;
          margin: 30px 0;
          text-align: left;
          border-radius: 0 8px 8px 0;
        }
        .instructions h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 16px;
        }
        .instructions p {
          margin: 5px 0;
          color: #374151;
          font-size: 14px;
        }
        .security-notice {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 30px 0;
          text-align: left;
        }
        .security-notice h4 {
          margin: 0 0 8px 0;
          color: #92400e;
          font-size: 14px;
          font-weight: 600;
        }
        .security-notice p {
          margin: 0;
          color: #92400e;
          font-size: 13px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .footer .brand {
          color: #3B82F6;
          font-weight: 600;
          font-size: 16px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 30px 20px;
          }
          .otp-code {
            font-size: 28px;
            letter-spacing: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 YearBook</h1>
          <p>Verify Your Email Address</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello <strong>${firstName} ${lastName}</strong>,
          </div>
          
          <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
            Welcome to YearBook! To complete your registration and secure your account, 
            please verify your email address using the verification code below.
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-info">⏰ Expires in ${expiresInMinutes} minutes</div>
          </div>
          
          <div class="instructions">
            <h3>📋 How to verify:</h3>
            <p>1. Copy the 6-digit code above</p>
            <p>2. Return to the YearBook registration page</p>
            <p>3. Enter the code in the verification field</p>
            <p>4. Click "Verify Email" to complete your registration</p>
          </div>
          
          <div class="security-notice">
            <h4>🔒 Security Notice</h4>
            <p>If you didn't create a YearBook account, please ignore this email. This verification code will expire automatically.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="brand">YearBook</p>
          <p>Connecting graduates, preserving memories</p>
          <p style="margin-top: 20px; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateWelcomeEmailTemplate = (
  data: WelcomeEmailData
): string => {
  const { firstName, lastName, username, loginUrl } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Year-Book!</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 18px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-message {
          text-align: center;
          margin-bottom: 40px;
        }
        .welcome-message h2 {
          color: #374151;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .username-display {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .username-display .label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .username-display .username {
          font-size: 20px;
          font-weight: 700;
          color: #3B82F6;
          font-family: 'Courier New', monospace;
        }
        .features {
          margin: 40px 0;
        }
        .feature {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 8px;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
          margin-top: 2px;
        }
        .feature-content h4 {
          margin: 0 0 5px 0;
          color: #374151;
          font-size: 16px;
        }
        .feature-content p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 30px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 30px 20px;
          }
          .feature {
            flex-direction: column;
            text-align: center;
          }
          .feature-icon {
            margin-right: 0;
            margin-bottom: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome!</h1>
          <p>You're now part of the Year-Book community</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <h2>Hello ${firstName} ${lastName}!</h2>
            <p style="color: #6b7280; font-size: 16px;">
              Your Year-Book account has been successfully created. We're excited to have you join our community of graduates!
            </p>
          </div>
          
          <div class="username-display">
            <div class="label">Your Username</div>
            <div class="username">@${username}</div>
          </div>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">👥</div>
              <div class="feature-content">
                <h4>Connect with Graduates</h4>
                <p>Find and connect with fellow graduates from your university, college, and department.</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">📝</div>
              <div class="feature-content">
                <h4>Share Your Story</h4>
                <p>Answer questions, share memories, and leave your mark in the digital yearbook.</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🔍</div>
              <div class="feature-content">
                <h4>Discover Content</h4>
                <p>Explore posts, last words, and memories shared by your academic community.</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">💬</div>
              <div class="feature-content">
                <h4>Engage & Interact</h4>
                <p>Like, comment, and interact with profiles and posts from your network.</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center;">
            ${
              loginUrl
                ? `<a href="${loginUrl}" class="cta-button">Start Exploring Year-Book</a>`
                : ""
            }
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Ready to complete your profile and start connecting? Log in to get started!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="font-weight: 600; color: #3B82F6; font-size: 16px;">🎓 yearBook</p>
          <p>Connecting graduates, preserving memories</p>
          <p style="margin-top: 20px; font-size: 12px;">
            Need help? Contact our support team or visit our help center.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generatePasswordResetTemplate = (
  data: PasswordResetEmailData
): string => {
  const { firstName, lastName, otp, expiresInMinutes = 10 } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Year-Book</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          color: #374151;
          margin-bottom: 30px;
        }
        .otp-container {
          background-color: #fef2f2;
          border: 2px dashed #fca5a5;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
        }
        .otp-label {
          font-size: 14px;
          color: #991b1b;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #ef4444;
          letter-spacing: 8px;
          margin: 0;
          font-family: 'Courier New', monospace;
        }
        .expiry-info {
          font-size: 14px;
          color: #dc2626;
          margin-top: 15px;
          font-weight: 500;
        }
        .instructions {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 30px 0;
          text-align: left;
          border-radius: 0 8px 8px 0;
        }
        .instructions h3 {
          margin: 0 0 10px 0;
          color: #92400e;
          font-size: 16px;
        }
        .instructions p {
          margin: 5px 0;
          color: #374151;
          font-size: 14px;
        }
        .security-notice {
          background-color: #fef2f2;
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 15px;
          margin: 30px 0;
          text-align: left;
        }
        .security-notice h4 {
          margin: 0 0 8px 0;
          color: #991b1b;
          font-size: 14px;
          font-weight: 600;
        }
        .security-notice p {
          margin: 0;
          color: #991b1b;
          font-size: 13px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .footer .brand {
          color: #3B82F6;
          font-weight: 600;
          font-size: 16px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 30px 20px;
          }
          .otp-code {
            font-size: 28px;
            letter-spacing: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset</h1>
          <p>Secure your YearBook account</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello <strong>${firstName} ${lastName}</strong>,
          </div>
          
          <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
            We received a request to reset your YearBook password. Use the verification code below to proceed with resetting your password.
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Password Reset Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-info">⏰ Expires in ${expiresInMinutes} minutes</div>
          </div>
          
          <div class="instructions">
            <h3>🔄 How to reset your password:</h3>
            <p>1. Copy the 6-digit code above</p>
            <p>2. Return to the password reset page</p>
            <p>3. Enter the code and your new password</p>
            <p>4. Click "Reset Password" to complete the process</p>
          </div>
          
          <div class="security-notice">
            <h4>🚨 Security Alert</h4>
            <p>If you didn't request a password reset, please ignore this email and consider changing your password immediately. Someone may be trying to access your account.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="brand">YearBook</p>
          <p>Connecting graduates, preserving memories</p>
          <p style="margin-top: 20px; font-size: 12px;">
            This is an automated security message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
