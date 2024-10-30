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

    await sleep(5000);

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
        await page.goto(loginUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 60000 // Increase timeout to 60 seconds (60000 ms)
      });

        // Get the HTML of the page
        const html = await page.content(); // This captures the HTML content of the page

        // Save the HTML to a file
        await fs.writeFile('botDetection.html', html);

        // check for bot detection
        await checkForChallengePage(page)

        await page.click('form button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        await sleep(2000);

        await page.type('#login_field', process.env.USERNAME);  
        await page.type('#password', process.env.PASSWORD);  
        await page.click('input[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        await sleep(20000);

        // Go to target page
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        let dailyCount = 0;
        let problems = [];
        let lastProblem = '';
        const filePath = path.join(__dirname, 'dailyReport.txt');

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const lines = fileContent.split(/\r?\n/);
            oldCount = parseInt(lines[0], 10);
            console.log(oldCount);
            lastProblem = lines[1];

        } catch (error) {
          console.error('New file', error);
        }

        let foundLastProblem = false;

        while (!foundLastProblem) {
          const elements = await page.evaluate(() => {
            return elements = Array.from(document.querySelectorAll('div[role="row"] > div[role="cell"]:nth-child(2) > div > div > a.hover\\:text-blue-s'))
            .map(element => element.textContent.trim());
          });

          for (let element of elements) {
            dailyCount++;
            console.log('added count');
            problems.push(element);

            if (element.includes(lastProblem)) {
              console.log(`Found '${lastProblem}' after checking ${dailyCount} rows.`);
              foundLastProblem = true;
              dailyCount--;
              break;
            }
          
            if (dailyCount === 10 || dailyCount === 20 || dailyCount === 30) {
              console.log(`Reached ${dailyCount} rows, moving to the next page.`);
              await page.click('button[aria-label="next"]');
              await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000))); // Pause for 2 seconds
              break;
            }
          }

          if (!elements.length) {
            console.log('No more elements found on the current page.');
            break;
          }
        }

        console.log(`Total checked: ${dailyCount}`);
        console.log('Problems:', problems);

        let newestProblem = problems.length > 0 ? problems[0] : '';
        let problemsStr = problems.join('<br>');

        let totalCompleted = 0;

        if (problems.length > 1) {
          totalCompleted = oldCount + dailyCount;
          console.log(totalCompleted);
          const data = `${totalCompleted}\n${newestProblem}`;
          await fs.writeFile(filePath, data, 'utf-8');
        } else {
          dailyCount = 0;
          totalCompleted = oldCount;
          problemsStr = '';
        }

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
          `<a href="https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter" target="_blank">Get Accountable</a>`,
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

