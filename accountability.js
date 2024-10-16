
// step 1: setup login type, 
// step 2: look for autocomplete credintials
// step 3: login
// step 4: go to problems completed page
// step 5: count rows, save to file (if there was no existing file note that for next step)
// step 6: send email (first time gets a different message)
// step 7: 















// #!/usr/bin/env node

// require('dotenv').config();
// const axios = require('axios');
// const jsdom = require('jsdom');
// // const nodemailer = require('nodemailer');
// const { JSDOM } = jsdom;

// const url = process.env.URL_TO_FETCH;

// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// async function countRowsAndEmail() {
//   try {
//     const response = await axios.get(url, {
//       headers: {
//         'User-Agent':
//           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
//         'Accept':
//           'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.5',
//       },
//     });
//     const htmlContent = response.data;

//     const dom = new JSDOM(htmlContent);
//     const document = dom.window.document;

//     const rows = document.querySelectorAll('[role="row"]');
//     const numberOfRows = rows.length;

//     console.log(`The number of rows is: ${numberOfRows}`);

//     // const mailOptions = {
//     //   from: process.env.EMAIL_USER,
//     //   to: process.env.EMAIL_RECIPIENT,
//     //   subject: 'Daily Row Count',
//     //   text: `The number of rows is: ${numberOfRows}`,
//     // };

//     // await transporter.sendMail(mailOptions);
//     // console.log('Email sent successfully.');
//   } catch (error) {
//     if (error.response && error.response.status === 403) {
//       console.error('Access forbidden: received a 403 error.');
//     } else {
//       console.error('An error occurred:', error.message);
//     }
//   }
// }

// countRowsAndEmail();






















// require('dotenv').config();

// const axios = require('axios');
// const jsdom = require('jsdom');
// const nodemailer = require('nodemailer');
// const { JSDOM } = jsdom;

// const url = 'https://leetcode.com/progress/';

// // Email configuration
// // const transporter = nodemailer.createTransport({
// //   service: 'gmail', // e.g., 'gmail'
// //   auth: {
// //     user: 'isaiahgarcia227@gmail.com', // Replace with your email
// //     pass: 'your_email_password',  // Replace with your email password or app password
// //   },
// // });

// // Function to fetch the page and count rows
// async function countRowsAndEmail() {
//   try {
//     // Fetch the HTML content
//     const response = await axios.get(url);
//     const htmlContent = response.data;

//     // Parse the HTML content
//     const dom = new JSDOM(htmlContent);
//     const document = dom.window.document;

//     // Find all elements with role="row"
//     const rows = document.querySelectorAll('[role="row"]');

//     // Count the number of rows
//     const numberOfRows = rows.length;

//     console.log(`The number of rows is: ${numberOfRows}`);

//     // Email the result
// //     const mailOptions = {
// //       from: 'your_email@gmail.com',        // Replace with your email
// //       to: 'recipient_email@example.com',   // Replace with your email
// //       subject: 'Daily Row Count',
// //       text: `The number of rows is: ${numberOfRows}`,
// //     };

// //     await transporter.sendMail(mailOptions);
// //     console.log('Email sent successfully.');
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// }

// // Run the function
// countRowsAndEmail();
