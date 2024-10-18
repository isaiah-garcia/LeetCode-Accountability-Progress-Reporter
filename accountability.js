#!/usr/bin/env node

require('dotenv').config();
const dateFns = require('date-fns');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

async function countRowsAndEmail() {
    const loginUrl = process.env.LOGIN_URL;
    const targetUrl = process.env.TARGET_URL;
    let browser;

    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)');

        // Login
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        await page.click('form button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        await page.type('#login_field', process.env.USERNAME);  
        await page.type('#password', process.env.PASSWORD);  
        await page.click('input[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Go to target page
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });

        // Extract text from each element with the class .text-label-2 under div[role="row"]
        const elements = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="row"] .text-label-2'));
            return items.map(element => element.textContent);
        });

        const filePath = path.join(__dirname, 'dailyReport.txt');
        const today = new Date();
        const formattedDate = dateFns.format(today, 'MMM d, yyyy');

        let dailyCount = -1;
        let oldCount = 0;
        let totalCompleted
        let date
        

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const lines = fileContent.split(/\r?\n/);
            oldCount = parseInt(lines[0], 10);
            date = lines[1];

        } catch (error) {
            const data = `${0}\n${formattedDate}`;
            await fs.writeFile(filePath, data, 'utf-8');
        }

        for (let element of elements) {
            dailyCount++;
            if (element.includes(date)) {
                console.log(`Found "${date}" after checking ${dailyCount} rows.`);
                break;
            }
        }

        totalCompleted = oldCount + dailyCount;
        const data = `${totalCompleted}\n${formattedDate}`;
        await fs.writeFile(filePath, data, 'utf-8');

        // Determine the email subject based on daily count
        let subject;
        if (dailyCount >= 5) {
          subject = "SUCCESS: LeetCode Accountability";
        } else {
          subject = "HELP: LeetCode Accountability";
        }

        const message = [
          `Daily count: ${dailyCount}`,
          `Total problems completed: ${totalCompleted}`
        ].join('\n'); 

        // Send email to accountability partner
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

        // Send email
        await transporter.sendMail(mailOptions);

    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

countRowsAndEmail();












// #!/usr/bin/env node

// require('dotenv').config();
// const puppeteer = require('puppeteer');
// const nodemailer = require('nodemailer');
// const fs = require('fs').promises;
// const path = require('path');

// async function countRowsAndEmail() {
//   const loginUrl = process.env.LOGIN_URL;
//   const targetUrl = process.env.TARGET_URL;

//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     await page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
//     );

//     // Login
//     await page.goto(loginUrl, { waitUntil: 'networkidle2' });
//     await page.click('form button[type="submit"]');
//     await page.waitForNavigation({ waitUntil: 'networkidle2' });

//     await page.type('#login_field', process.env.USERNAME);  
//     await page.type('#password', process.env.PASSWORD);  

//     await page.click('input[type="submit"]');
//     await page.waitForNavigation({ waitUntil: 'networkidle2' });

//     // Go to progress page
//     await page.goto(targetUrl, { waitUntil: 'networkidle2' });

//     // Count finished problems
//     const numberOfRows = await page.evaluate(() => {
//       return document.querySelectorAll('div[role="row"]').length;
//     });

//     const totalCompleted = numberOfRows - 1;

//     // Update daily progress in dailyReport.txt
//     const filePath = path.join(__dirname, 'dailyReport.txt');
//     let dailyCount = 0;

    
//     try {
//       // Check if the file exists
//       await fs.access(filePath);  

//       // Record previous count (oldCount) and subtract today's count from oldCount
//       const fileContent = await fs.readFile(filePath, 'utf-8');
//       const oldCount = parseInt(fileContent, 10);
//       dailyCount = totalCompleted - oldCount;
//       await fs.writeFile(filePath, totalCompleted.toString(), 'utf-8');
      
//     } catch (error) {
//       dailyCount = totalCompleted;  // If no file exists, use totalCompleted
//       await fs.writeFile(filePath, totalCompleted.toString(), 'utf-8');
//     }

//     // Determine the email subject based on daily count
//     let subject;
//     if (dailyCount >= 5) {
//       subject = "SUCCESS: LeetCode Accountability";
//     } else {
//       subject = "HELP: LeetCode Accountability";
//     }

//     const message = [
//       `Daily count: ${dailyCount}`,
//       `Total problems completed: ${totalCompleted}`
//     ].join('\n'); 

//     // Send email to accountability partner
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Email options
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: process.env.EMAIL_RECIPIENT,
//       subject: subject,  
//       text: message,  
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);

//     await browser.close();
//   } catch (error) {
//     console.error('An error occurred:', error.message);
//   }
// }

// countRowsAndEmail();
