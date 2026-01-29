const https = require('https');

const token = "8503195199:AAFnjXFzYIMGxTA3TK6yu0erWZFwsIhOeZE";
const chatId = "-1003804421466";
const message = "Test message from OkeanWebapp Debugger";

const data = JSON.stringify({
    chat_id: chatId,
    text: message
});

const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending test message...");

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
