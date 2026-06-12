const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
  // Canvas'ı temizle
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  // Eğer el algılandıysa...
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      // İşaret parmağı ucu (Landmark 8) koordinatlarını al
      const indexFinger = landmarks[8];
      const x = indexFinger.x * canvasElement.width;
      const y = indexFinger.y * canvasElement.height;
      
      // Burada parmağın olduğu noktaya bir görsel çizebiliriz (debug için)
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 10, 0, 2 * Math.PI);
      canvasCtx.fillStyle = 'red';
      canvasCtx.fill();
    }
  }
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Kamera Başlatma
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480,
  facingMode: 'environment' // Arka kamerayı zorlar
});

camera.start();
