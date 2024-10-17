#!/usr/bin/env node


// step 1: for initial setup: setup login type, passwords, your email, recipient's email and name
// select login method: regular login, google, github, facebook, linkedin

// step 2: look for autocomplete credintials
// step 3: login with github (START HERE) (check for existing credentials)
// step 4: go to problems completed page
// step 5: count rows, save to file (if there was no existing file note that for next step)
// step 6: send email (first time gets a different message)
// step 7: 

require('dotenv').config();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

async function countRowsAndEmail() {
  const loginUrl = process.env.LOGIN_URL;
  const targetUrl = process.env.TARGET_URL;
  const emailRecipient = process.env.EMAIL_RECIPIENT;

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Optional: Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    // Optional: Set User-Agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
    );

    // Step 1: Navigate to the login page
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    // Step 2: Click the login button (adjust the selector as needed)
    await page.click('form button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('going to login page.');

    await page.type('#login_field', process.env.USERNAME);  // Adjust the selector
    await page.type('#password', process.env.PASSWORD);  // Adjust the selector

    console.log('Credentials entered.');

    // Step 2: Click the login button (adjust the selector as needed)
    await page.click('input[type="submit"]');
    
    // Step 3: Wait for navigation after submitting the form
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('Login successful.');

    // Step 3: Navigate to the target page
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Step 4: Count the number of rows in the table
    const numberOfRows = await page.evaluate(() => {
      return document.querySelectorAll('div[role="row"]').length - 1;
    });

    console.log(`The number of rows is: ${numberOfRows}`);

    // Step 5: Send an email with the number of rows
    // Configure the transporter
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail', // Replace with your email service
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // Email options
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: emailRecipient,
    //   subject: 'Daily Row Count',
    //   text: `The number of rows is: ${numberOfRows}`,
    // };

    // // Send the email
    // await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully.');

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

countRowsAndEmail();













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
