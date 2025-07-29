const { exec } = require('child_process');
const ngrok = require('ngrok');
const open = require('open');
const net = require('net');

function waitForPort(port, host = '127.0.0.1', timeout = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      const socket = net.createConnection(port, host);
      socket.on('connect', () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout esperando a que el puerto esté disponible'));
        } else {
          setTimeout(check, 500);
        }
      });
    })();
  });
}

(async function() {
  // Inicia Next.js en modo dev
  exec('npm run dev');
  // Espera a que el puerto 3000 esté disponible
  await waitForPort(3000);
  // Inicia ngrok en el puerto 3000
  const url = await ngrok.connect(3000);
  console.log('URL pública:', url);
  await open(url);
})();
