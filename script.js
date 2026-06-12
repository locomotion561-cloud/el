const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

let balloons = [];
let score = 0;
let fingerPos = { x: -100, y: -100 }; // Parmak konumu

// 1. Oyun Döngüsü (Kamera görüntüsünden bağımsız sürekli çalışır)
function gameLoop() {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Rastgele balon ekle
    if (Math.random() < 0.05) balloons.push(createBalloon());

    balloons = balloons.filter(b => {
        b.y -= b.speed;
        
        // Çarpışma kontrolü
        const dist = Math.hypot(b.x - fingerPos.x, b.y - fingerPos.y);
        if (dist < b.radius + 30) {
            score++;
            return false; // Balonu patlat
        }

        // Çizim
        canvasCtx.beginPath();
        canvasCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        canvasCtx.fillStyle = 'red';
        canvasCtx.fill();
        canvasCtx.closePath();

        return b.y > -50;
    });

    // Skoru yaz
    canvasCtx.fillStyle = 'black';
    canvasCtx.font = '30px Arial';
    canvasCtx.fillText(`Skor: ${score}`, 20, 50);

    requestAnimationFrame(gameLoop);
}

// 2. Sadece parmak konumunu güncelle
function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmark = results.multiHandLandmarks[0][8];
        fingerPos.x = landmark.x * canvasElement.width;
        fingerPos.y = landmark.y * canvasElement.height;
    }
}

// Başlatma
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => await hands.send({image: videoElement}),
    width: 640, height: 480, facingMode: 'environment'
});

camera.start();
gameLoop(); // Döngüyü başlat
