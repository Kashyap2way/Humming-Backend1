const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse request body
app.use(express.json());

// Route to capture traffic using tshark
app.post('/capture', (req, res) => {
    const interface = req.body.interface || 'wlan0'; // Network interface to capture from
    const duration = req.body.duration || 60; // Capture duration in seconds
    const outputFile = 'capture.pcap'; // Output file name

    // Spawn tshark process
    const tshark = spawn('tshark', ['-i', interface, '-a', `duration:${duration}`, '-w', outputFile]);

    tshark.on('close', (code) => {
        if (code === 0) {
            res.send({ success: true, message: `Captured traffic saved to ${outputFile}` });
        } else {
            res.status(500).send({ success: false, message: `tshark exited with code ${code}` });
        }
    });
});

// Route to crack WPA/WPA2 using aircrack-ng
app.post('/crack', (req, res) => {
    const capFile = req.body.capFile || 'capture.pcap'; // Capture file with handshake
    const wordlist = req.body.wordlist || '/path/to/wordlist.txt'; // Path to wordlist

    // Run aircrack-ng to crack WPA/WPA2 password
    const aircrack = exec(`aircrack-ng ${capFile} -w ${wordlist}`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).send({ success: false, message: `Error running aircrack-ng: ${stderr}` });
        }

        // Parse aircrack-ng output to check if a key was found
        if (stdout.includes('KEY FOUND!')) {
            const key = stdout.match(/KEY FOUND!\s*\[\s*(.*)\s*\]/)[1];
            res.send({ success: true, key });
        } else {
            res.status(200).send({ success: false, message: 'No key found' });
        }
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Backend service running on http://localhost:${port}`);
});
