import fs from 'fs';
import { Resend } from 'resend';

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let apiKey, emailFrom;
for (const line of lines) {
  const trimmedLine = line.trim();
  if (trimmedLine.startsWith('RESEND_API_KEY=')) apiKey = trimmedLine.split('=').slice(1).join('=').trim();
  if (trimmedLine.startsWith('EMAIL_FROM=')) emailFrom = trimmedLine.split('=').slice(1).join('=').trim();
}

console.log('Testing email with:');
console.log('  From:', emailFrom);
console.log('  API Key:', apiKey?.substring(0, 15) + '...');

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from: emailFrom,
  to: ['mike@sullysblog.com'],
  subject: 'Test Email from SullysBlog',
  html: `
    <h1>Test Email</h1>
    <p>This is a test email to verify that Resend is configured correctly with the domain <strong>contact.sullysblog.com</strong>.</p>
    <p>If you received this, your email setup is working!</p>
    <p>Sent at: ${new Date().toISOString()}</p>
  `,
});

if (error) {
  console.error('\nError sending email:', error);
} else {
  console.log('\nEmail sent successfully!');
  console.log('Email ID:', data.id);
  console.log('\nCheck mike@sullysblog.com for the test email.');
}
