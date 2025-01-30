const express = require('express');
const WebSocket = require('ws');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 8443;

// Crée un serveur WebSocket
const wss = new WebSocket.Server({ noServer: true });

// Gère les connexions WebSocket
wss.on('connection', (ws) => {
    console.log('Client connecté');

    // Fonction pour traiter chaque paquet capturé
    function handlePacket(packet) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(packet));
        }
    }

    // Démarre la capture avec tshark
    function startCapture() {
        const tsharkCommand = `tshark -i 5 -T json -l -f "udp"`;
        const tsharkProcess = exec(tsharkCommand);

        let buffer = '';  // Un buffer pour accumuler les données

        tsharkProcess.stdout.on('data', (data) => {
            buffer += data.toString();  // Ajoute les données au buffer

            // Recherche une délimitation entre les objets JSON
            let boundary = buffer.lastIndexOf('}\n{');  // Détecte la fin d'un objet JSON

            if (boundary !== -1) {
                const chunk = buffer.slice(0, boundary + 1);  // La partie complète de JSON
                buffer = buffer.slice(boundary + 1);  // Reste du buffer

                try {
                    const jsonData = JSON.parse(chunk);  // Parse la donnée complète
                    handlePacket(jsonData);
                } catch (err) {
                    console.error('Erreur de parsing JSON:', err);
                    console.error('Données brutes:', chunk);  // Affiche les données brutes qui posent problème
                }
            }
        });

        tsharkProcess.stderr.on('data', (stderr) => {
            console.error(`Erreur Tshark : ${stderr}`);
        });

        tsharkProcess.on('close', (code) => {
            console.log(`Capture terminée avec le code : ${code}`);
        });
    }

    startCapture();
});

// Serveur HTTP pour servir l'interface Web
app.use(express.static(path.join(__dirname, '../public')));

// Gère le WebSocket pour la communication avec les clients
app.server = app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

/*

const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 8443;

// Crée un serveur WebSocket
const wss = new WebSocket.Server({ noServer: true });

// Gère les connexions WebSocket
wss.on('connection', (ws) => {
    console.log('Client connecté');

    // Fonction pour traiter chaque paquet capturé
    function handlePacket(packet) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(packet));
        }
    }

    // Démarre la capture avec tshark
    function startCapture() {
        // Utilisation de spawn pour capturer les paquets sur l'interface Wi-Fi
        const tsharkProcess = spawn('tshark', ['-i', 'wlan0', '-T', 'json', '-l', '-f', 'udp']);

        tsharkProcess.stdout.on('data', (data) => {
            try {
                const jsonData = JSON.parse(data.toString());  // Assure-toi que les données sont converties en chaîne avant le parsing
                handlePacket(jsonData);
            } catch (err) {
                console.error('Erreur de parsing JSON:', err);
            }
        });

        tsharkProcess.stderr.on('data', (stderr) => {
            console.error(`Erreur Tshark : ${stderr.toString()}`);
        });

        tsharkProcess.on('close', (code) => {
            console.log(`Capture terminée avec le code : ${code}`);
        });
    }

    startCapture();
});

// Serveur HTTP pour servir l'interface Web
app.use(express.static(path.join(__dirname, '../public')));

// Gère le WebSocket pour la communication avec les clients
app.server = app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});


*/