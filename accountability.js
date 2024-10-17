#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

async function countRowsAndEmail() {
  const loginUrl = process.env.LOGIN_URL;
  const targetUrl = process.env.TARGET_URL;
  const emailRecipient = process.env.EMAIL_RECIPIENT;

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
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

    // console.log('going to login page.');

    await page.type('#login_field', process.env.USERNAME);  // Adjust the selector
    await page.type('#password', process.env.PASSWORD);  // Adjust the selector

    // console.log('Credentials entered.');

    // Step 2: Click the login button (adjust the selector as needed)
    await page.click('input[type="submit"]');
    
    // Step 3: Wait for navigation after submitting the form
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // console.log('Login successful.');

    // Step 4: Navigate to the target page
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Step 5: Count finished problems
    const numberOfRows = await page.evaluate(() => {
      return document.querySelectorAll('div[role="row"]').length;
    });

    const totalCompleted = numberOfRows - 1;

    // Define filePath outside of IIFE so it's accessible
    const filePath = path.join(__dirname, 'dailyReport.txt');
    let dailyCount = 0;

    // Step 6: update daily progress
    try {
      // Check if the file exists
      await fs.access(filePath);  
      // console.log('Daily report file exists.');

      // Read previous count and subtract today's count from previous count
      const fileContent = await fs.readFile(filePath, 'utf-8');
      // console.log('File content:', fileContent);
      const oldCount = parseInt(fileContent, 10);
      dailyCount = totalCompleted - oldCount;
      await fs.writeFile(filePath, totalCompleted.toString(), 'utf-8');
      
    } catch (error) {
      // console.log('Creating daily report...');
      dailyCount = totalCompleted;  // If no file exists, use totalCompleted
      await fs.writeFile(filePath, totalCompleted.toString(), 'utf-8');
      // console.log('Created dailyReport.txt with default content.');
    }

    // Step 7: Determine the email subject based on daily count
    let subject;
    if (dailyCount > 5) {
      subject = "SUCCESS: LeetCode Accountability";
    } else {
      subject = "HELP: LeetCode Accountability";
    }

    const message = [
      `Daily count: ${dailyCount}`,
      `Total problems completed: ${totalCompleted}`
    ].join('\n');  // Joining the array into a string

    // Step 8: Send email to accountability partner
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT,
      subject: subject,  
      text: message,  
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully.');

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

countRowsAndEmail();
