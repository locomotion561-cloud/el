const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

let balloons = []; // Balonlar dizisi
let score = 0;

// Canvas boyutlandırma
videoElement.onloadedmetadata = () => {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
};

// Balon oluşturma fonksiyonu
function createBalloon() {
    return {
        x: Math.random() * canvasElement.width,
        y: canvasElement.height + 50,
        radius: 30,
        speed: Math.random() * 2 + 1
    };
}

// Balonları güncelle ve çiz
function updateBalloons(fingerX, fingerY) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Yeni balon ekle (düşük ihtimalle)
    if (Math.random() < 0.02) balloons.push(createBalloon());

    balloons = balloons.filter(b => {
        b.y -= b.speed; // Balonu yukarı hareket ettir

        // Çarpışma kontrolü (Mesafe formülü)
        const dist = Math.hypot(b.x - fingerX, b.y - fingerY);
        if (dist < b.radius + 20) {
            score++;
            return false; // Balonu patlat (diziden çıkar)
        }

        // Balonları çiz
        canvasCtx.beginPath();
        canvasCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        canvasCtx.fillStyle = 'red';
        canvasCtx.fill();
        canvasCtx.closePath();

        return b.y > -50; // Ekrandan çıkanları temizle
    });

    // Skoru yaz
    canvasCtx.fillStyle = 'white';
    canvasCtx.font = '30px Arial';
    canvasCtx.fillText(`Skor: ${score}`, 20, 50);
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({ maxNumHands: 1, minDetectionConfidence: 0.5 });

hands.onResults((results) => {
    let fingerX = -100, fingerY = -100; // El yoksa ekran dışına al
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            fingerX = landmarks[8].x * canvasElement.width;
            fingerY = landmarks[8].y * canvasElement.height;
        }
    }
    updateBalloons(fingerX, fingerY);
});

const camera = new Camera(videoElement, {
    onFrame: async () => await hands.send({image: videoElement}),
    width: 640, height: 480, facingMode: 'environment'
});
camera.start();
