# Accountable
![Accountable Logo](https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/blob/master/Accountable_logo.png)

# demo
Accountable logs in to LeetCode, retrieves your progress and sends an update to your accountability partner's email.
![Accountable Demo]()

# Simple Email reports 
SUCCESS if you completed more than 5 problems!

![Accountable success email example](https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/blob/master/success_email.png)

HELP if you have not completed at least 5 problems.

![Accountable help email example](https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/blob/master/help_email.png)


## Installation
Step 1: Go to your email account and create a new app password for nodemailer to send emails through your account (assuming you have 2FA). Here is the link for gmail: 
https://myaccount.google.com/apppasswords 

After you create your nodemailer password, add it to your .env file (see next step).

Step 2: Add .env to gitignore, then fill out your .env file like this:

```bash
# URLs                                    
LOGIN_URL=https://leetcode.com/accounts/login/?next=%2Fprogress%2F
TARGET_URL=https://leetcode.com/progress/

# Login Credentials
USERNAME=YourUsername
PASSWORD=YourPassword

# Email Credentials
EMAIL_USER=YourEmail
EMAIL_PASS=YourNodeMailerPassword


# Recipient Email Address
EMAIL_RECIPIENT=AccountabilityPartnerEmail
```

OTHER LOGIN URLs YOU CAN USE: \
Google: https://leetcode.com/accounts/google/login/?next=%2F \
GitHub: https://leetcode.com/accounts/github/login/?next=%2F \
Facebook: https://leetcode.com/accounts/facebook/login/?next=%2F \
LinkedIn: https://leetcode.com/accounts/linkedin_oauth2/login/?next=%2Fprogress%2F 

Step 3: Setup CronJob in terminal

```bash
crontab -e
```
Mine is setup like this: execution time, file path, node path, file name >> log file

Followed by a command to wake up my machine 1 minute before.

```bash
0 18 * * * cd path/to/file && path/to/node/version accountable.js >> /tmp/accountable.log 2>&1

59 17 * * * sudo rtcwake -m no -t $(date +\%s -d 'today 17:59')
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
