const fs = require('fs');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');

// SMTP server configuration
const SMTP_SERVER = "smtp.gmail.com";  // Gmail SMTP server
const SMTP_PORT = 587;  // Port for TLS
const SENDER_EMAIL = "fy.faiyew@gmail.com";  // Sender's email address
const SENDER_PASSWORD = "btiladgtfgdhbmnj";  // Sender's email password or app password

// Load email data from CSV
function loadEmailData(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

// Load email body template from a text file
function loadEmailBody(filePath) {
    return fs.promises.readFile(filePath, 'utf-8');
}

// Send email function
async function sendEmail(transporter, recipientEmail, name, department, emailSubject, emailBody) {
    try {
        const jobId = "1"; // tbc

        // Replace placeholders in email body
        const personalizedBody = emailBody
                                    .replace("#name#", name)
                                    .replace("#department#", department)
                                    .replace("#email#", recipientEmail)
                                    .replace("#jobId#", jobId);

        // Set up email options
        const mailOptions = {
            from: SENDER_EMAIL,
            to: recipientEmail,
            subject: emailSubject,
            html: personalizedBody
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Sent email to ${name} <${recipientEmail}>`);
    } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
    }
}

async function main() {
    // Get department code and email subject from user input
    const departmentCode = process.argv[2] || 'all';
    const emailSubject = process.argv[3] || 'Test Subject';

    // Load email data from CSV and email body from file
    const emailData = await loadEmailData('addresses.csv');
    const emailBody = await loadEmailBody('email_template.html');

    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
        host: SMTP_SERVER,
        port: SMTP_PORT,
        secure: false,  // True for port 465, false for other ports
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD
        }
    });

    // Group sent email count by department
    const sentCount = {};

    // Loop through each entry in the CSV and send emails
    for (const row of emailData) {
        const { name, email, department_code } = row;

        // Skip emails if department code doesn't match
        if (departmentCode !== 'all' && department_code !== departmentCode) {
            continue;
        }

        await sendEmail(transporter, email, name, department_code, emailSubject, emailBody);

        // Update count for department
        sentCount[department_code] = (sentCount[department_code] || 0) + 1;

        // Delay to avoid being flagged as spam
        await new Promise(resolve => setTimeout(resolve, 2000));  // 2 seconds delay
    }

    // Print report of sent emails grouped by department
    console.log("\nEmail sending report:");
    for (const department in sentCount) {
        console.log(`Department: ${department}, Emails sent: ${sentCount[department]}`);
    }
}

// Run the main function
main().catch(err => console.error("Error in email sending process:", err));


/*
address.csv
name,email,department_code
Fai Yew,e1122700@u.nus.edu,CS

┌──(faiyew㉿DESKTOP-FY)-[~/Documents/CS3103/Project]
└─$ node program.js CS "Welcome to CS Department"
Sent email to Fai Yew <e1122700@u.nus.edu>

Email sending report:
Department: CS, Emails sent: 1

*/
