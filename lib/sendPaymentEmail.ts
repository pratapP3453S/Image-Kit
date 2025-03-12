import { render } from '@react-email/render';
import PaymentSuccessfulEmail from '@/emails/PaymentSuccessfulEmail';
import PaymentUnuccessfulEmail from '@/emails/PaymentUnsuccessfulEmail';
import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';

// Set the SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPaymentSuccessEmail(
  to: string,
  email: string,
  amount: string,
  razorpayOrderId: string,
): Promise<any> {
  // Render the React component to an HTML string
  const html = render(
    PaymentSuccessfulEmail({ email, amount, razorpayOrderId }),
  );

  // Define the email message
  const msg: MailDataRequired = {
    from: process.env.SENDER_EMAIL!, // Sender email address (must be verified in SendGrid)
    to: to, // Recipient email address
    subject: 'Payment Successful for Your Image | Image E-Comm', // Email subject
    html: `${html}`, // Rendered HTML content
  };

  // Debugging: Log the message
  console.log('Sending email with message:', msg);

  try {
    // Send the email
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    throw new Error('Failed to send email'); // Re-throw the error for handling in the calling function
  }
}

export async function sendPaymentUnsuccessEmail(
  to: string,
  email: string,
  amount: string,
  razorpayOrderId: string,
): Promise<any> {
  // Render the React component to an HTML string
  const html = render(
    PaymentUnuccessfulEmail({ email, amount, razorpayOrderId }),
  );

  // Define the email message
  const msg: MailDataRequired = {
    from: process.env.SENDER_EMAIL!, // Sender email address (must be verified in SendGrid)
    to: to, // Recipient email address
    subject: 'Payment Unsuccessful for Your Image | Image E-Comm', // Email subject
    html: `${html}`, // Rendered HTML content
  };

  // Debugging: Log the message
  console.log('Sending email with message:', msg);

  try {
    // Send the email
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    throw new Error('Failed to send email'); // Re-throw the error for handling in the calling function
  }
}