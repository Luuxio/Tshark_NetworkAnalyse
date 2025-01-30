const ws = new WebSocket('ws://localhost:8443');

// Requête d'affichage des paquets à la réception via WebSocket
ws.onmessage = (event) => {
    try {
        const packet = JSON.parse(event.data);
        const ipSource = packet._source.layers.ip['ip.src'];
        const ipDest = packet._source.layers.ip['ip.dst'];
        const udpSourcePort = packet._source.layers.udp['udp.srcport'];
        const udpDestPort = packet._source.layers.udp['udp.dstport'];

        // Crée une ligne du tableau pour chaque paquet reçu
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ipSource}</td>
            <td>${ipDest}</td>
            <td>${udpSourcePort}</td>
            <td>${udpDestPort}</td>
        `;
        document.querySelector('#packets-table-body').appendChild(row);
    } catch (err) {
        console.error('Erreur lors de la réception du paquet:', err);
    }
};

// Gère la connexion et l'état WebSocket
ws.onopen = () => {
    document.getElementById('loading').textContent = "Capture en cours...";
};

ws.onerror = (err) => {
    console.error('WebSocket error:', err);
};

ws.onclose = () => {
    document.getElementById('loading').textContent = "Capture terminée.";
};
