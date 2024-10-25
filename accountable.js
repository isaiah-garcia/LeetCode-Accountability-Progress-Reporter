#!/usr/bin/env node

require('dotenv').config({ path: '/Users/isaiah/LeetCode-Accountability-Partner/.env' });
const dateFns = require('date-fns');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

function sleep(duration) {
  return new Promise(resolve => {
      setTimeout(resolve, duration);
  });
}

async function checkForChallengePage(page) {
    const title = await page.title();
  
    // Check if the title is "Just a moment..." which is typical for Cloudflare challenge pages
    if (title === "Just a moment...") {
        console.log("Challenge page detected. Performing specific actions...");
  
        // Add your specific actions here
        await performChallengeResponseActions(page);
    } else {
        console.log("Normal page detected.");
    }
  }
  
  async function performChallengeResponseActions(page) {
    // Example action: Wait for a certain amount of time
    await sleep(5000);

    // Get the HTML of the page
    const html = await page.content(); // This captures the HTML content of the page

    // Save the HTML to a file
    await fs.writeFile('botDetection.html', html);

    const iframes = await page.frames();
    iframes.forEach(frame => {
        console.log(`Frame found with URL: ${frame.url()}`);
    });


    // Get the element
    const element = await page.$('#fbMan1');
    console.log('element found');
    // Get the bounding box of the element
    const boundingBox = await element.boundingBox();
    console.log('box found');

    // Calculate coordinates to click in the height center but 10 pixels from the left
    const x = boundingBox.x + 30;  // 10 pixels from the left edge of the element
    const y = boundingBox.y + boundingBox.height / 2;  // Centered vertically

    // Click at the calculated coordinate
    await page.mouse.click(x, y);
    console.log('click box');

    console.log('success')
    await sleep(5000);

  }


async function countRowsAndEmail() {
    const loginUrl = process.env.LOGIN_URL;
    const targetUrl = process.env.TARGET_URL;
    let browser;

    try {
          browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    
        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
      

        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
              get: () => false,
          });
          // Pass the Chrome Test
          window.navigator.chrome = {
              runtime: {},
              
          };
          // Pass the Permissions Test
          const originalQuery = window.navigator.permissions.query;
          window.navigator.permissions.query = (parameters) => (
              parameters.name === 'notifications' ?
                  Promise.resolve({ state: Notification.permission }) :
                  originalQuery(parameters)
            );
        });


        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');

        // Login
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });

        // check for bot detection
        await checkForChallengePage(page)

        await sleep(3000);

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

        // console.log(elements)
                
        const filePath = path.join(__dirname, 'dailyReport.txt');
        
        let dailyCount = 0;
        let oldCount = 0;
        let lastProblem = '';
        let newestProblem = elements.length > 1 ? elements[0] : '';

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const lines = fileContent.split(/\r?\n/);
            oldCount = parseInt(lines[0], 10);
            // console.log(oldCount)
            lastProblem = lines[1];

        } catch (error) {
          if (elements.length > 1) {
            const data = `0\n${newestProblem}`;
            await fs.writeFile(filePath, data, 'utf-8');
          }
        }

        let problems = [];

        for (let element of elements) {
            dailyCount++;
            problems.push(element)
            if (element.includes(lastProblem)) {
                console.log(`Found "${lastProblem}" after checking ${dailyCount} rows.`);
                break;
            }
        }

        problems.pop();

        let problemsStr = problems.join('\n');

        dailyCount = dailyCount - 1;
        // console.log(dailyCount)

        let totalCompleted = oldCount + dailyCount;
        // console.log(totalCompleted)
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

        console.log(subject)

        const message = [
          `<a href="https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter" target="_blank"><img src="https://raw.githubusercontent.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/master/accountable_email_logo.png" alt="Accountable logo" style="max-width: 100%; height: auto;"></a>`,
          `<br><br>`,
          `Daily count: ${dailyCount}`,
          `<br>`,
          `Total problems completed: ${totalCompleted}<br><br>`,
          problemsStr,
          `<br><br><br><br><br><br>`,
          `<a href="https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter" target="_blank">Get Accountable Today</a>`,
          `<br>`,
          `<br>`
        ].join(''); 

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
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_RECIPIENT,
          subject: subject,  
          html: message,  
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

console.log(`${new Date().toISOString()} - Process completed successfully.`);


// const today = new Date();
// const formattedDate = dateFns.format(today, 'MMM d, yyyy');

// 30
// 1037. Valid Boomerang