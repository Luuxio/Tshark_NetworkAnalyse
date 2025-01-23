const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const port = 8443;

const jsonDir = path.join(__dirname, 'json');
const captureFilePath = path.join(jsonDir, 'capture.json');

// Middleware pour les fichiers statiques
app.use(express.static('frontend'));

function startCapture() {
    const tsharkCommand = `tshark -i 1 -T json -l > ${captureFilePath}`;
    exec(tsharkCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`Erreur lors du démarage de Tshark ; ${err}`);
            return;
        }
        if (stderr) {
            console.error(`Erreur Tshark : ${stderr}`);
        }
        console.log(`${tsharkCommand} -> à bien été executé ! Capture Tshak en cours.....`);
    })
}

// startCapture();

// Endpoint pour les captures : 
app.get('/capture', (req, res) => {
    const filePath = path.join(__dirname, 'capture.json');
    fs.readFileSync(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send(`Erreur lors de la lecture du fichier localisé: ${filePath}`);
        }

        res.json(JSON.parse(data));
    })
})

app.listen(port, () => {
    console.log(`Serveur lance sur http://localhost:${port}`);
})