import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let handLandmarker;
let balloons = [];
let score = 0;

// 1. MediaPipe Modelini Hazırla
async function setupHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
    });

    startCamera();
}

// 2. Kamerayı Başlat
async function startCamera() {
    const constraints = { video: { facingMode: "environment" } };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
}

// 3. Tahmin ve Oyun Döngüsü
let lastVideoTime = -1;
function predictWebcam() {
    // Canvas'ı videoya göre boyutlandır
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const startTimeMs = performance.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = handLandmarker.detectForVideo(video, startTimeMs);

        // El bulunduysa parmak ucunu al
        let fingerX = -100, fingerY = -100;
        if (results.landmarks.length > 0) {
            const indexFinger = results.landmarks[0][8];
            fingerX = (1 - indexFinger.x) * canvas.width; // Ayna modu için
            fingerY = indexFinger.y * canvas.height;
        }

        updateGame(fingerX, fingerY);
    }
    window.requestAnimationFrame(predictWebcam);
}

// 4. Balon Mantığı
function updateGame(fingerX, fingerY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Yeni balon ekleme
    if (Math.random() < 0.03) {
        balloons.push({ x: Math.random() * canvas.width, y: canvas.height + 50, speed: Math.random() * 3 + 2 });
    }

    balloons = balloons.filter(b => {
        b.y -= b.speed;
        const dist = Math.hypot(b.x - fingerX, b.y - fingerY);
        if (dist < 50) { score++; return false; } // Patlatma

        // Çizim
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 30, 0, Math.PI * 2);
        ctx.fill();
        return b.y > -50;
    });

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(`Skor: ${score}`, 20, 50);
}

setupHandLandmarker();
