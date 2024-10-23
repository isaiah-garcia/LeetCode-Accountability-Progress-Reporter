#!/usr/bin/env node

require('dotenv').config({ path: '/Users/isaiah/LeetCode-Accountability-Partner/.env' });
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

        // Get the HTML of the page
        const html = await page.content(); // This captures the HTML content of the page
        
        // Save the HTML to a file
        await fs.writeFile('botDetection.html', html);

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
          return Array.from(document.querySelectorAll('div[role="row"] > div[role="cell"]:nth-child(2) > div > div > a.hover\\:text-blue-s')).map(element => element.textContent.trim());
        });
                
        const filePath = path.join(__dirname, 'dailyReport.txt');
        
        let dailyCount = 0;
        let oldCount = 0;
        let lastProblem = '';
        let newestProblem = elements.length > 1 ? elements[1] : '';
        

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const lines = fileContent.split(/\r?\n/);
            oldCount = parseInt(lines[0], 10);
            console.log(oldCount)
            lastProblem = lines[1];

        } catch (error) {
          if (elements.length > 1) {
            const data = `0\n${newestProblem}`;
            await fs.writeFile(filePath, data, 'utf-8');
          }
        }

        for (let element of elements) {
            dailyCount++;
            if (element.includes(lastProblem)) {
                console.log(`Found "${lastProblem}" after checking ${dailyCount} rows.`);
                break;
            }
        }

        dailyCount = dailyCount - 1;
        console.log(dailyCount)

        let totalCompleted = oldCount + dailyCount;
        console.log(totalCompleted)
        const data = `${totalCompleted}\n${newestProblem}`;
        await fs.writeFile(filePath, data, 'utf-8');

        // Determine the email subject based on daily count
        let subject;
        if (dailyCount >= 20) {
          subject = "DUDE: LeetCode Accountability";
        } else if (dailyCount >= 15) {
          subject = "AMAZING: LeetCode Accountability";
        } else if (dailyCount >= 10) {
          subject = "WOW: LeetCode Accountability";
        } else if (dailyCount >= 5) {
          subject = "SUCCESS: LeetCode Accountability";
        } else {
          subject = "HELP: LeetCode Accountability";
        }

        const message = [
          `Daily count: ${dailyCount}`,
          `Total problems completed: ${totalCompleted}`
        ].join('\n'); 

        console.log(message)
        // Send email to accountability partner
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Email options
        // const mailOptions = {
        //   from: process.env.EMAIL_USER,
        //   to: process.env.EMAIL_RECIPIENT,
        //   subject: subject,  
        //   text: message,  
        // };

        // // Send email
        // await transporter.sendMail(mailOptions);

    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

countRowsAndEmail();

console.log(`${new Date().toISOString()} - Process completed successfully.`);




// const today = new Date();
// const formattedDate = dateFns.format(today, 'MMM d, yyyy');

// 17
// 283. Move Zeroes