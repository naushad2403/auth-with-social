function EmailVerifyHTML(verificationLink) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #333333; font-size: 24px; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">Thank you for signing up! Please verify your email address to complete your registration.</p>
          <a href="${verificationLink}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007bff; border-radius: 4px; text-decoration: none;">Verify Email</a>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
          <p><a href="${verificationLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">${verificationLink}</a></p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 14px; color: #888888;">
          <p>If you did not request this email, you can safely ignore it.</p>
        </div>
      </div>
    </div>
  `;
}

const VerificationHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f7fa;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      background-color: #fff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      color: #4CAF50;
      font-size: 2em;
    }
    p {
      color: #555;
      font-size: 1.1em;
      margin-top: 20px;
    }
    .message {
      margin-top: 20px;
      font-size: 1.2em;
      color: #4CAF50;
    }
    .button {
      margin-top: 30px;
      padding: 12px 20px;
      font-size: 1.1em;
      color: white;
      background-color: #4CAF50;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
    }
    .button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>Email Verified</h1>
    <p>Thank you for verifying your email address.</p>
    <p class="message">Your email has been successfully verified!</p>
  </div>

</body>
</html>
`;

function AccountCreationHTML(resetUrl, role) {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p style="font-size: 16px;">Your account has been created for the role of <strong style="color: #007bff;">${role}</strong>.</p>
  <p style="font-size: 16px;">Click on the following link to reset your password:</p>
  <p>
  <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007bff; border-radius: 4px; text-decoration: none;">Reset Password</a>
    <p style="color: #555555; font-size: 16px; line-height: 1.6;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
  <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none; font-weight: bold;">${resetUrl}</a></p>
  </p
  <p style="font-size: 14px; color: #555;">If you did not request a password reset, please ignore this email.</p>
</div>`;
}

module.exports = { EmailVerifyHTML, VerificationHTML, AccountCreationHTML };
