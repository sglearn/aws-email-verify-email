"use strict"

const aws = require('aws-sdk');

// Create a new SES object. 
const ses = new aws.SES({
  region: process.env.REGION
});

const sender = `${process.env.SENDER_NAME} <${process.env.SENDER_MAIL_ADDRESS}>`;

function sendEmail(recipient, token) {

  // The subject line for the email.
  const subject = `Verify your email registered at ${process.env.SERVICE}`;

  // The email body for recipients with non-HTML email clients.
  const body_text = "Dear Customer,\r\n"
                  + "Your email is registered to use services provided by "
                  + process.env.SERVICE + "\r\n"
                  + "To verify that your are the owner of this email, please go to the following URL\r\n"
                  + `${process.env.ENDPOINT}?t=${token}\r\n`
                  + "This link expires 24 hours after your original request\r\n"
                  + "Notes: If you did NOT register this email at our service, please do not click on the link."
                  + "We are sorry for the inconvenience.\r\n"
                  + "This email is auto-generated. Please do not reply this email.\r\n"
                  + "Sincerely, \r\n"
                  + process.env.SIGNATURE;

  // The HTML body of the email.
  const body_html = `<html>
  <head></head>
  <body>
    <p>Dear Customer,</p>
    <p>Your email is registered to use services provided by <b> ${process.env.SERVICE} </b> </p>
    <p>To verify that your are the owner of this email, please go to the following URL</p>
    <a href='${process.env.ENDPOINT}?t=${token}' > ${process.env.ENDPOINT}?t=${token} </a>
    <p> This link expires 24 hours after your original request </p>
    <p style="color: red"> Notes: If you did not register this email at our service, please DO NOT click on the link. We are sorry for the inconvenience </p>
    <p> This email is auto-generated. Please <b>do not reply</b> this email.</p>
    <p> Sincerely, </p>
    <p> ${process.env.SIGNATURE} </p>
  </body>
  </html>`;

  // The character encoding for the email.
  const charset = "UTF-8";

  // Specify the parameters to pass to the API.
  const params = { 
    Source: sender, 
    Destination: { 
      ToAddresses: [
        recipient 
      ],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Text: {
          Data: body_text,
          Charset: charset 
        },
        Html: {
          Data: body_html,
          Charset: charset
        }
      }
    },
    // ConfigurationSetName: configuration_set
  };

  //Try to send the email.
  console.log(`Sending email from ${sender} to ${recipient}`)
  return new Promise((resolve, reject) => {
    ses.sendEmail(params, function(err, data) {
      // If something goes wrong, print an error message.
      if(err) {
        console.log(err.message);
        reject(err);
      } else {
        console.log("Email sent! Message ID: ", data.MessageId);
        resolve(data);
      }
    });
  })

}

exports.handler = async (event) => {
  await sendEmail(event.recipient, event.token);
  return 'done'
};