# Accountable
<img src="https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/blob/master/images/accountable_logo.png" alt="accountable logo" width="700"/>


Accountable retrieves your LeetCode progress and sends an email update to your accountability partner.

# Simple Email Reports 
SUCCESS if you complete 5+ problems!

<img src="https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/blob/master/images/success_email.jpg" alt="success email" width="300"/>

HELP if you have not completed at least 5 problems.

<img src="https://github.com/isaiah-garcia/LeetCode-Accountability-Progress-Reporter/blob/master/images/help_email.png" alt="help email" width="300"/>

## Installation
STEP 1: Fork and clone repo
```
npm install
```
```
npm start
```

STEP 2: 
- Go to your email account and create a new app password (This is for nodemailer to send the email via your account). 
- Here is the link for gmail: https://myaccount.google.com/apppasswords 
- After creating your nodemailer password, add it to your .env file (see next step for more details).

STEP 3: Add .env to gitignore, then fill out your .env file like this:

```
# URLs                                    
LOGIN_URL=https://leetcode.com/accounts/login/?next=%2Fprogress%2F
TARGET_URL=https://leetcode.com/progress/

# LeetCode Login Credentials
USERNAME=YourUsername
PASSWORD=YourPassword

# Email Credentials
EMAIL_USER=YourEmail
EMAIL_PASS=YourNewlyCreatedAppPassword

# Recipient Email Address
EMAIL_RECIPIENT=AccountabilityPartnerEmail
```
If you login using a 3rd party, simply replace the LOGIN_URL= link: \
Google: https://leetcode.com/accounts/google/login/?next=%2F \
GitHub: https://leetcode.com/accounts/github/login/?next=%2F \
Facebook: https://leetcode.com/accounts/facebook/login/?next=%2F \
LinkedIn: https://leetcode.com/accounts/linkedin_oauth2/login/?next=%2Fprogress%2F 

NOTE: 
YOU MAY NEED TO ADJUST CODE BASED ON YOUR LOGIN METHOD. THE CODE IS CURRENTLY SETUP FOR A 3RD PARTY LOGIN.


STEP 4: Setup CronJob in terminal

```
crontab -e
```
Mine is setup like this: execution time, file path, node path, file name >> log file

Followed by a command to wake up my machine 1 minute before.

```
0 18 * * * cd path/to/file && path/to/node/version accountable.js >> /tmp/accountable.log 2>&1

59 17 * * * sudo rtcwake -m no -t $(date +\%s -d 'today 17:59')
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
