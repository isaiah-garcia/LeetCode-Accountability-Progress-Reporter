#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

async function main() {
  const loginUrl = process.env.LOGIN_URL;
  const targetUrl = process.env.TARGET_URL;
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');

    await login(page, loginUrl);
    await sleep(3000);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const totalCompleted = await getTotalProblems(page);
    const { dailyCount, problems } = await getDailyProblems(page);

    const subject = determineSubject(dailyCount);
    const message = constructMessage(dailyCount, totalCompleted, problems);

    await sendEmail(subject, message);
  } catch (error) {
    console.error("error:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// FUNCTIONS

function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

async function checkForChallengePage(page) {
  const title = await page.title();
  if (title === "Just a moment...") {
    await checkChallengeBox(page);
  }
}

async function checkChallengeBox(page) {
  await sleep(2000);
  const element = await page.$('#fbMan1');
  const boundingBox = await element.boundingBox();
  const x = boundingBox.x + 30;
  const y = boundingBox.y + boundingBox.height / 2;
  await sleep(2000);
  await page.mouse.click(x, y);
  await sleep(2000);
}

async function login(page, loginUrl) {
  await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await checkForChallengePage(page);
  await page.click('form button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.type('#login_field', process.env.USERNAME);
  await page.type('#password', process.env.PASSWORD);
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

async function getTotalProblems(page) {
  const totalCompleted = await page.evaluate(() => {
    const element = document.querySelector('div.text-sd-blue-500 .text-2xl.font-semibold');
    return element ? element.textContent.trim() : null;
  });
  return totalCompleted;
}

async function getDailyProblems(page) {
  let dailyCount = 0;
  const problems = [];
  let foundAllDailyProblems = false;

  while (!foundAllDailyProblems) {
    const dates = await page.evaluate(() => {
      const rows = document.querySelectorAll('div[role="row"]');
      return Array.from(rows).map(row => {
        const dateCell = row.querySelector('div[role="cell"]:first-child .text-sd-muted-foreground');
        return dateCell ? dateCell.textContent.trim() : null;
      }).filter(date => date !== null);
    });

    const elements = await page.evaluate(() => {
      const rows = document.querySelectorAll('div[role="row"]');
      return Array.from(rows).map(row => {
        const nameElement = row.querySelector('div[role="cell"]:nth-child(2) a.font-semibold');
        const text = nameElement ? nameElement.textContent.trim() : null;
        const href = nameElement ? nameElement.getAttribute('href') : null;
        return text && href ? { text, href } : null;
      }).filter(item => item !== null);
    });

    const firstDate = dates[0];

    for (let i = 0; i < elements.length && i < dates.length; i++) {
      const date = dates[i];
      const element = elements[i];
      if (date !== firstDate) {
        foundAllDailyProblems = true;
        break;
      }
      dailyCount++;
      problems.push(`<a href="https://leetcode.com${element.href}" target="_blank">${element.text}</a><br>`);
    }

    if (!elements.length) {
      break;
    }
  }

  return { dailyCount, problems };
}

function determineSubject(dailyCount) {
  if (dailyCount >= 20) {
    return "DUDE: LeetCode Accountability";
  } else if (dailyCount >= 15) {
    return "AMAZING: LeetCode Accountability";
  } else if (dailyCount >= 10) {
    return "WOW: LeetCode Accountability";
  } else if (dailyCount >= 5) {
    return "SUCCESS: LeetCode Accountability";
  } else {
    return "HELP: LeetCode Accountability";
  }
}

function constructMessage(dailyCount, totalCompleted, problems) {
  const problemsHTML = problems.join('');
  return [
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
}

async function sendEmail(subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECIPIENT,
    subject: subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);

  console.log(`${new Date().toISOString()} - Process completed successfully.`);
}

main();