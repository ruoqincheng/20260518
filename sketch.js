let capture;
let qrResult = "等待辨識中...";
let handPose;
let hands = [];

function preload() {
  // 載入 handPose 模型
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  
  // 開始偵測手部
  handPose.detectStart(capture, gotHands);
  
  capture.hide(); // 隱藏預設產生的 DOM 攝影機元件
}

function draw() {
  background('#e7c6ff');

  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  // 繪製攝影機影像
  image(capture, x, y, imgW, imgH);

  // QR Code 辨識邏輯
  // 必須確保 HTML 中有引入 jsQR 函式庫
  if (capture.loadedmetadata && typeof jsQR !== 'undefined') {
    capture.loadPixels();
    if (capture.pixels.length > 0) {
      const code = jsQR(capture.pixels, capture.width, capture.height);
      if (code) {
        qrResult = "掃描結果: " + code.data;
        console.log("Found QR code", code.data);
      }
    }
  }

  // 在影像下方顯示辨識文字
  noStroke();
  fill(0);
  textAlign(CENTER);
  textSize(24);
  text(qrResult, width / 2, y + imgH + 40);

  // 繪製手部關鍵點連線
  drawHandLines(x, y, imgW, imgH);
}

function gotHands(results) {
  hands = results;
}

function drawHandLines(offX, offY, w, h) {
  stroke(0, 255, 0); // 設定線條顏色為綠色
  strokeWeight(3);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // 定義需要串接的組別
    let groups = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19, 20]
    ];

    for (let group of groups) {
      for (let j = 0; j < group.length - 1; j++) {
        let p1 = hand.keypoints[group[j]];
        let p2 = hand.keypoints[group[j + 1]];

        // 將攝影機座標轉換為畫布上的 50% 區塊座標
        let x1 = offX + (p1.x / capture.width) * w;
        let y1 = offY + (p1.y / capture.height) * h;
        let x2 = offX + (p2.x / capture.width) * w;
        let y2 = offY + (p2.y / capture.height) * h;

        line(x1, y1, x2, y2);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
