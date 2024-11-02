#!/usr/bin/env node

require('dotenv').config({ path: '/Users/isaiah/LeetCode-Accountability-Partner/.env' });
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

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
   
    await sleep(5000);

    const iframes = await page.frames();
    iframes.forEach(frame => {
        console.log(`Frame found with URL: ${frame.url()}`);
    });


    const element = await page.$('#fbMan1');
    console.log('element found');

    const boundingBox = await element.boundingBox();
    console.log('box found');

    const x = boundingBox.x + 30;  
    const y = boundingBox.y + boundingBox.height / 2; 

    await sleep(5000);

    await page.mouse.click(x, y);
    console.log('click box');

    console.log('success')
    await sleep(5000);

  }

async function scrapeRowsAndEmail() {
    const loginUrl = process.env.LOGIN_URL;
    const targetUrl = process.env.TARGET_URL;
    let browser;

    try {
          browser = await puppeteer.launch({
            headless: false,
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
        let totalCompleted = 0;
        const problems = [];
        
        // get total probs
        totalCompleted = await page.evaluate(() => {
          const element = document.querySelector('div.text-sd-blue-500 .text-2xl.font-semibold');
          return element ? element.textContent.trim() : null;
        });
        console.log(totalCompleted)

        let foundAllDailyProblems = false;

        while (!foundAllDailyProblems) {
          const dates = await page.evaluate(() => {
            const rows = document.querySelectorAll('div[role="row"]');
            
            return Array.from(rows).map(row => {
              const dateCell = row.querySelector('div[role="cell"]:first-child .text-sd-muted-foreground');
              return dateCell ? dateCell.textContent.trim() : null;
            }).filter(date => date !== null); // Filter out any null values
          });
          console.log(dates)

          const elements = await page.evaluate(() => {
            const rows = document.querySelectorAll('div[role="row"]');
            
            return Array.from(rows).map(row => {
              // Target the second cell and find the anchor within it
              const nameElement = row.querySelector('div[role="cell"]:nth-child(2) a.font-semibold');
              const text = nameElement ? nameElement.textContent.trim() : null;
              const href = nameElement ? nameElement.getAttribute('href') : null;
              
              // Return only the name and href, no anchor tag
              return text && href ? { text, href } : null;
            }).filter(item => item !== null); // Remove any null values
          });
          console.log(elements)

          const first = dates[0];

          for (let i = 0; i < elements.length && i < dates.length; i++) {
            const date = dates[i];
            const element = elements[i];
        
            // if (date !== first) {
            //   console.log(`Total of ${dailyCount} problems completed today.`);
            //   foundAllDailyProblems = true;
            //   break;
            // }
            if (date == 'Sun') {
              console.log(`Total of ${dailyCount} problems completed today.`);
              foundAllDailyProblems = true;
              break;
            }
        
            dailyCount++;
            console.log('added count');
            problems.push(`<a href="https://leetcode.com${element.href}" target="_blank">${element.text}</a><br>`);
          }

          if (!elements.length) {
            console.log('No more elements found on the current page.');
            break;
          }
        }

        console.log(`Total checked: ${dailyCount}`);
        console.log('Problems:', problems);

        const problemsHTML = problems.join('');

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
          problemsHTML,
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

scrapeRowsAndEmail();

console.log(`${new Date().toISOString()} - Process completed successfully.`);