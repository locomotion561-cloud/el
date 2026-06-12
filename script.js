import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker;
let runningMode = "VIDEO";

// 1. En performanslı model yükleme
async function setupHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU" // Donanım ivmelendirmeyi zorla
    },
    runningMode: runningMode,
    numHands: 1
  });
}

// 2. Performanslı tahmin döngüsü
async function predictWebcam() {
  let startTimeMs = performance.now();
  
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    // Her kareyi değil, uygun olduğunda işle
    const results = handLandmarker.detectForVideo(video, startTimeMs);
    
    // Çizim ve oyun mantığı buraya...
  }
  window.requestAnimationFrame(predictWebcam);
}
