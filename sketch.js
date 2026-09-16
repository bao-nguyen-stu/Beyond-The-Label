const myMainCanvasSketch = (p) => {
  let aspectRatio; // Stores the shape proportion (width vs height)

  // ---------- FIXED-SIZE CANVAS BASE DATA ----------
  const DESIGN_W = 960, DESIGN_H = 640;

  // ---------- COLORS ----------
  let colBg, colInk, colInkFaint, colPanel, colPanelBorder;
  let colFitness, colMood, colMoney, colRelationship;
  let colAccept, colReject, colPurple, colPurpleDark, colGold;

  // ---------- STATS ----------
  const STAT_KEYS = ['Fitness', 'Mood', 'Money', 'Relationship'];
  const STAT_LABEL = { Fitness: 'Fitness', mood: 'mood', money: 'money', relationship: 'relationship' };
  let stats = { Fitness: 50, mood: 50, money: 50, relationship: 50 };
  let displayStats = { ...stats };
  let lastDelta = { Fitness: 0, mood: 0, money: 0, relationship: 0 };

  // ---------- TIME ----------
  let totalDays = 0;
  let age = 18;

  // ---------- CARD DATA ----------
  const cardsData = [
    { prompt: "Your friends invite you on a spontaneous road trip.",
      accept: { money: -8, relationship: 7, mood: 5 },
      reject: { money: 3, relationship: -4 } },

    { prompt: "It's your anniversary, but a big deadline is due tomorrow.",
      accept: { money: -3, relationship: 8, mood: 3 },
      reject: { money: 6, relationship: -10, mood: [-5, -1] } },

    { prompt: "Should you start jogging every morning?",
      accept: { Fitness: 8, mood: 4, money: -2 },
      reject: { Fitness: -3, mood: [-2, 0] } },

    { prompt: "A coworker asks you to cover their shift, unpaid.",
      accept: { money: -2, mood: -4, relationship: 5 },
      reject: { relationship: -3, mood: 2 } },

    { prompt: "You're offered a risky stock tip.",
      accept: { money: [-15, 25], mood: [-6, 4] },
      reject: {} },

    { prompt: "Your therapist has a session booked this week.",
      accept: { money: -6, mood: 9, Fitness: 2 },
      reject: { money: 2, mood: -6 } },

    { prompt: "An old friend calls -- you haven't talked in years.",
      accept: { relationship: 6, mood: 3 },
      reject: { relationship: -2 } },

    { prompt: "Your boss offers overtime for the whole month.",
      accept: { money: 12, relationship: -6, mood: -5, Fitness: -4 },
      reject: { money: -3, relationship: 2, mood: 2 } },

    { prompt: "A charity asks for a donation.",
      accept: { money: -6, mood: 6, relationship: 2 },
      reject: { money: 2, mood: -1 } },

    { prompt: "You catch a cold. The doctor suggests rest.",
      accept: { money: -4, Fitness: 7, mood: 2 },
      reject: { money: 3, Fitness: -8, mood: -3 } },

    { prompt: "Your gym membership renewal is due.",
      accept: { money: -5, Fitness: 6, mood: 2 },
      reject: { money: 4, Fitness: -6 } },

    { prompt: "Your partner wants a serious talk about the future.",
      accept: { relationship: 8, mood: [-3, 4] },
      reject: { relationship: -6, mood: -2 } },

    { prompt: "Three sleepless nights of overtime. A coworker offers you a pill to 'stay sharp'.",
      accept: { mood: [6, 10], Fitness: -8 }, addictRisk: true,
      reject: { Fitness: -4, mood: -4 } },

    { prompt: "After a rough breakup, a friend says trying something new will help you forget.",
      accept: { mood: [8, 12], relationship: -3 }, addictRisk: true,
      reject: { mood: -3 } },
  ];

  // ---------- ACHIEVEMENTS ----------
  const achievementDefs = [
    { id: 'money_high',   label: 'Earn $200',            check: s => s.money >= 70 },
    { id: 'money_low',    label: 'Broke Again',          check: s => s.money <= 20 },
    { id: 'rel_high',     label: 'Social Butterfly',     check: s => s.relationship >= 75 },
    { id: 'rel_low',      label: 'Heartbreak',           check: s => s.relationship <= 20 },
    { id: 'Fitness_high',  label: 'Peak Shape',           check: s => s.Fitness >= 75 },
    { id: 'Fitness_low',   label: 'Burnt Out',            check: s => s.Fitness <= 20 },
    { id: 'mood_high',    label: 'On Top Of The World',  check: s => s.mood >= 75 },
    { id: 'mood_low',     label: 'Rock Bottom',          check: s => s.mood <= 20 },
  ];
  const dayMilestones = [
    { id: 'day_100', label: '100 Days In', days: 100 },
    { id: 'day_180', label: 'Half A Year', days: 180 },
    { id: 'day_365', label: 'A Full Year', days: 365 },
  ];
  let achievementCounts = {};
  let achievementLog = [];
  let achievementPopupQueue = [];
  let achievementPopup = null;

  // ---------- WORD-CLOUD & SILHOUETTE ----------
  const traitPool = ['friendly', 'curious', 'hopeful', 'creative', 'clumsy', 'bookworm', 'gamer', 'foodie', 'dreamer', 'quiet'];
  let anchorPool = [];
  let labels = [];
  let anchorsReady = false;
  let silhouetteBounds = null;

  const SILO_X = 350, SILO_Y = 150, SILO_W = 260, SILO_H = 330;

  // ---------- WEBCAM & TRACKING ----------
  let video;
  let videoReady = false;
  let cameraError = false;
  let cameraStartFrame = 0;
  let prevFrameGfx = null;
  let trackingConfidence = 0;
  let bodySegmentation = null;
  let segmentation = null;
  let maskedWebcam = null;
  let maskThreshold = 128;
  let lastCaptureFrame = -9999;

  // ---------- COSMETICS ----------
  const nameList = ['FreshGrad99', 'JamieTries', 'QuinnOnTheGrind', 'xX_NewStart_Xx',
    'CaseyHustles', 'TaylorMade22', 'MorganLoading', 'RileyIRL', 'SamSaysHi', 'AlexOutHere'];
  let nickname = '';
  let vipNumber = 0;
  let topScoreDays = 0;
  let avatarHue = 0;

  // ---------- CARD & DRAG STATE ----------
  let drawPile = [], discardPile = [];
  let currentCard = null;
  let cardState = 'entering';
  let cardOffset = { x: 0, y: 0 };
  let resolveDir = 0;
  let resolveProgress = 0, resolveSpin = 1, enterProgress = 0;
  let entranceType = 'flip', slideFrom = 'left';
  let particles = [];
  let shakeAmount = 0;
  let gameOver = false, endReason = '';
  let lastDaysAdded = 0;

  const CARD_W = 170, CARD_H = 260;
  const CARD_X = 855, CARD_Y = 328;
  const DRAG_THRESHOLD = 90;

  p.setup = () => {
    // 1. Measure container width
    const container = document.querySelector('.mainCanvas');
    const currentWidth = container ? container.clientWidth : 960;

    // 2. Set dimensions
    const originalWidth = DESIGN_W;
    const originalHeight = DESIGN_H;

    // 3. Aspect ratio calculation
    aspectRatio = originalHeight / originalWidth;
    const currentHeight = currentWidth * aspectRatio;

    // 4. Create and attach canvas
    const canvas = p.createCanvas(currentWidth, currentHeight);
    if (container) canvas.parent(container);

    p.textAlign(p.CENTER, p.CENTER);

    colBg           = p.color(255, 255, 255);
    colInk          = p.color(30, 28, 35);
    colInkFaint     = p.color(30, 28, 35, 130);
    colPanel        = p.color(238, 235, 250);
    colPanelBorder  = p.color(120, 90, 220);
    colFitness       = p.color(160, 150, 235);
    colMood         = p.color(240, 165, 55);
    colMoney        = p.color(60, 175, 95);
    colRelationship = p.color(225, 75, 120);
    colAccept       = p.color(70, 190, 110);
    colReject       = p.color(230, 65, 120);
    colPurple       = p.color(110, 65, 220);
    colPurpleDark   = p.color(75, 40, 165);
    colGold         = p.color(240, 195, 60);

    randomizeCosmetics();
    startNewGame();
    startWebcam();
    startBodySegmentation();
  };

  p.draw = () => {
    // Automatically scale resolution coordinates based on current window/container size
    p.scale(p.width / DESIGN_W);

    let shakeX = 0, shakeY = 0;
    if (shakeAmount > 0.3) { 
      shakeX = p.random(-shakeAmount, shakeAmount); 
      shakeY = p.random(-shakeAmount, shakeAmount); 
      shakeAmount *= 0.88; 
    } else {
      shakeAmount = 0;
    }

    if (!videoReady && !cameraError && video) {
      if (video.width > 0) {
        videoReady = true;
        updateSilhouetteAnchors();
        if (!anchorsReady) buildFallbackAnchors();
        else assignInitialLabels();
        updateLabelPositions();
      } else if (p.frameCount - cameraStartFrame > 240) {
        cameraError = true;
        buildFallbackAnchors();
      }
    }

    if (videoReady && p.frameCount % 3 === 0) {
      updateSilhouetteAnchors();
    }

    p.push();
    p.translate(shakeX, shakeY);
    p.rectMode(p.CORNER);
    p.background(colBg);

    drawMeters();
    drawAvatarPanel();
    drawAchievementBoard();
    drawWebcamArea();
    drawEventPanel();
    drawEncouragementAndCard();
    drawDaysAgeBox();
    drawAchievementPopup();

    if (!gameOver) { updateCard(); drawCardOnTop(); }
    else drawGameOver();

    updateParticles();
    drawParticles();
    p.pop();
  };

  p.windowResized = () => {
    const container = document.querySelector('.mainCanvas');
    if (container) {
      const newWidth = container.clientWidth;
      p.resizeCanvas(newWidth, newWidth * aspectRatio);
    }
  };

  // ---------- WEBCAM & SEGMENTATION ----------
  function startWebcam() {
    video = p.createCapture(p.VIDEO, () => {});
    video.size(SILO_W, SILO_H);
    video.hide();
    cameraStartFrame = p.frameCount;
  }

  function personShapePoints() {
    return [
      [0.40, 0.03], [0.60, 0.03], [0.68, 0.10], [0.66, 0.17],
      [0.82, 0.22], [0.90, 0.38], [0.80, 0.50], [0.86, 0.62],
      [0.74, 0.72], [0.70, 1.00], [0.30, 1.00], [0.26, 0.72],
      [0.14, 0.62], [0.20, 0.50], [0.10, 0.38], [0.18, 0.22],
      [0.34, 0.17], [0.32, 0.10],
    ];
  }

  async function startBodySegmentation() {
    if (typeof ml5 === 'undefined') return;
    try {
      bodySegmentation = await ml5.bodySegmentation('SelfieSegmentation', { maskType: 'body' });
      if (video) bodySegmentation.detectStart(video, gotSegmentation);
    } catch (err) {
      console.warn('ML5 body segmentation unavailable; using camera fallback.', err);
    }
  }

  function gotSegmentation(result) {
    segmentation = result;
    if (videoReady) updateSilhouetteFromMask();
  }

  function updateLabelPositions() {
    if (!silhouetteBounds) return;
    for (const lab of labels) {
      lab.targetU = silhouetteBounds.x + lab.bodyU * silhouetteBounds.w;
      lab.targetV = silhouetteBounds.y + lab.bodyV * silhouetteBounds.h;
    }
  }

  function takeCameraSnapshot() {
    if (!video || !segmentation || !segmentation.maskImageData) return null;
    video.loadPixels();
    const vPix = video.pixels.slice();
    const mData = segmentation.maskImageData;
    return {
      vPix,
      mPix: mData.data.slice(),
      mW: mData.width,
      mH: mData.height,
      vW: video.width,
      vH: video.height
    };
  }

  function snapshotIsPerson(snap, x, y) {
    if (!snap || !snap.mPix) return false;
    const mx = p.floor(p.constrain(x, 0, snap.mW - 1));
    const my = p.floor(p.constrain(y, 0, snap.mH - 1));
    const i = (my * snap.mW + mx) * 4;
    return snap.mPix[i + 3] > maskThreshold;
  }

  function snapshotIsPersonVideoCoords(snap, x, y) {
    if (!snap) return false;
    const mx = x * snap.mW / snap.vW;
    const my = y * snap.mH / snap.vH;
    return snapshotIsPerson(snap, mx, my);
  }

  function updateSilhouetteFromMask() {
    if (!segmentation || !segmentation.maskImageData || !video) return;

    const m = segmentation.maskImageData;
    const mw = m.width;
    const mh = m.height;
    const data = m.data;

    let minU = 1, maxU = 0, minV = 1, maxV = 0;
    let count = 0;
    const step = 3;

    for (let y = 0; y < mh; y += step) {
      for (let x = 0; x < mw; x += step) {
        const i = (y * mw + x) * 4;
        if (data[i + 3] > maskThreshold) {
          const u = x / (mw - 1);
          const v = y / (mh - 1);
          minU = p.min(minU, u);
          maxU = p.max(maxU, u);
          minV = p.min(minV, v);
          maxV = p.max(maxV, v);
          count++;
        }
      }
    }

    if (count < 20) return;

    const newBounds = {
      x: p.constrain(minU - 0.015, 0, 1),
      y: p.constrain(minV - 0.015, 0, 1),
      w: p.max(0.08, p.constrain(maxU + 0.015, 0, 1) - p.constrain(minU - 0.015, 0, 1)),
      h: p.max(0.12, p.constrain(maxV + 0.015, 0, 1) - p.constrain(minV - 0.015, 0, 1))
    };

    trackingConfidence = p.min(1, count / 300);

    if (!silhouetteBounds) {
      silhouetteBounds = newBounds;
    } else {
      silhouetteBounds.x = p.lerp(silhouetteBounds.x, newBounds.x, 0.22);
      silhouetteBounds.y = p.lerp(silhouetteBounds.y, newBounds.y, 0.22);
      silhouetteBounds.w = p.lerp(silhouetteBounds.w, newBounds.w, 0.22);
      silhouetteBounds.h = p.lerp(silhouetteBounds.h, newBounds.h, 0.22);
    }

    updateLabelPositions();
  }

  function updateSilhouetteAnchors() {
    if (!videoReady || !video) return;

    if (segmentation && segmentation.maskImageData) {
      updateSilhouetteFromMask();
      return;
    }

    const currGfx = p.createGraphics(SILO_W, SILO_H);
    currGfx.image(video, 0, 0, SILO_W, SILO_H);
    currGfx.loadPixels();

    if (!prevFrameGfx) {
      prevFrameGfx = p.createGraphics(SILO_W, SILO_H);
      prevFrameGfx.image(video, 0, 0, SILO_W, SILO_H);
      prevFrameGfx.loadPixels();
    }

    const brightnessAt = (gfx, gx, gy) => {
      const idx = 4 * (gy * SILO_W + gx);
      return (gfx.pixels[idx] + gfx.pixels[idx + 1] + gfx.pixels[idx + 2]) / 3;
    };

    const corners = [[4, 4], [SILO_W - 4, 4], [4, SILO_H - 4], [SILO_W - 4, SILO_H - 4]];
    const bg = corners.reduce((sum, [cx, cy]) => sum + brightnessAt(currGfx, cx, cy), 0) / corners.length;

    const pts = [];
    const step = 8;

    for (let gy = 8; gy < SILO_H - 8; gy += step) {
      for (let gx = 8; gx < SILO_W - 8; gx += step) {
        const currB = brightnessAt(currGfx, gx, gy);
        const prevB = brightnessAt(prevFrameGfx, gx, gy);
        if (Math.abs(currB - bg) > 14 || Math.abs(currB - prevB) > 8) {
          pts.push({ u: gx / SILO_W, v: gy / SILO_H });
        }
      }
    }

    prevFrameGfx.image(currGfx, 0, 0);
    prevFrameGfx.loadPixels();
    currGfx.remove();

    if (pts.length > 5) {
      anchorPool = pts;
      anchorsReady = true;
      let minU = 1, maxU = 0, minV = 1, maxV = 0;
      for (const pt of pts) {
        minU = p.min(minU, pt.u);
        maxU = p.max(maxU, pt.u);
        minV = p.min(minV, pt.v);
        maxV = p.max(maxV, pt.v);
      }

      const newBounds = {
        x: p.constrain(minU - 0.025, 0, 1),
        y: p.constrain(minV - 0.025, 0, 1),
        w: p.max(0.08, maxU - minU + 0.05),
        h: p.max(0.12, maxV - minV + 0.05)
      };

      if (!silhouetteBounds) silhouetteBounds = newBounds;
      else {
        silhouetteBounds.x = p.lerp(silhouetteBounds.x, newBounds.x, 0.18);
        silhouetteBounds.y = p.lerp(silhouetteBounds.y, newBounds.y, 0.18);
        silhouetteBounds.w = p.lerp(silhouetteBounds.w, newBounds.w, 0.18);
        silhouetteBounds.h = p.lerp(silhouetteBounds.h, newBounds.h, 0.18);
      }
      updateLabelPositions();
    }
  }

  function buildMaskedWebcamFrame() {
    if (!video || !videoReady) return;

    if (!maskedWebcam) {
      maskedWebcam = p.createImage(SILO_W, SILO_H);
    }

    video.loadPixels();
    maskedWebcam.loadPixels();

    const mask = segmentation && segmentation.maskImageData;
    const mp = mask ? mask.data : null;
    const mw = mask ? mask.width : 0;
    const mh = mask ? mask.height : 0;
    const bwThreshold = 128; 

    for (let y = 0; y < SILO_H; y++) {
      const my = mask ? p.floor(y * mh / SILO_H) : 0;

      for (let x = 0; x < SILO_W; x++) {
        const vi = (y * SILO_W + x) * 4;
        let alpha = 255;

        if (mp) {
          const mx = p.floor(x * mw / SILO_W);
          const mi = (my * mw + mx) * 4;
          alpha = mp[mi + 3] > maskThreshold ? 255 : 0;
        }

        const r = video.pixels[vi];
        const g = video.pixels[vi + 1];
        const b = video.pixels[vi + 2];
        const avg = (r + g + b) / 3;
        const val = avg >= bwThreshold ? 255 : 0;

        maskedWebcam.pixels[vi]     = val;
        maskedWebcam.pixels[vi + 1] = val;
        maskedWebcam.pixels[vi + 2] = val;
        maskedWebcam.pixels[vi + 3] = alpha;
      }
    }

    maskedWebcam.updatePixels();
  }

  function findCaptureAnchors(count = 5) {
    const anchors = [];
    const snap = takeCameraSnapshot();

    if (!snap || !snap.mPix) return anchors;

    const rows = [];
    const rowStep = p.max(12, p.floor(video.height / 15));

    for (let y = rowStep; y < video.height - rowStep; y += rowStep) {
      let inRun = false;
      let startX = 0;

      for (let x = 0; x < video.width; x += 4) {
        const self = snapshotIsPersonVideoCoords(snap, x, y);
        if (self && !inRun) {
          inRun = true;
          startX = x;
        }
        if ((!self || x >= video.width - 4) && inRun) {
          const endX = self ? x : x - 4;
          if (endX - startX >= 24) {
            rows.push({
              u: ((startX + endX) * 0.5) / video.width,
              v: y / video.height,
              width: (endX - startX) / video.width
            });
          }
          inRun = false;
        }
      }
    }

    p.shuffle(rows, true);

    for (const r of rows) {
      if (anchors.length >= count) break;
      if (!silhouetteBounds) continue;

      const bodyU = p.constrain((r.u - silhouetteBounds.x) / silhouetteBounds.w, 0.08, 0.92);
      const bodyV = p.constrain((r.v - silhouetteBounds.y) / silhouetteBounds.h, 0.06, 0.94);

      let okay = true;
      for (const lab of labels) {
        if (p.dist(bodyU, bodyV, lab.bodyU, lab.bodyV) < 0.12) {
          okay = false;
          break;
        }
      }
      if (okay) anchors.push({ u: bodyU, v: bodyV });
    }

    while (anchors.length < count) {
      const a = assignAnchor();
      anchors.push(a);
    }

    return anchors;
  }

  function captureLabelMoment() {
    if (!videoReady || !segmentation || !segmentation.maskImageData) return;

    if (p.frameCount - lastCaptureFrame < 10) return;
    lastCaptureFrame = p.frameCount;

    const amount = p.floor(p.random(3, 6));
    const anchors = findCaptureAnchors(amount);
    const pool = p.shuffle([...traitPool]);

    for (let i = 0; i < anchors.length; i++) {
      const text = pool[i % pool.length];
      const existing = labels.find(l => l.text === text);

      if (existing) {
        existing.targetSize = p.min(56, existing.targetSize + 5);
        existing.pulse = 1;
      } else {
        createLabelAtBodyPosition(text, 'trait', anchors[i].u, anchors[i].v, 17, 56);
      }
    }
  }

  function createLabelAtBodyPosition(text, category, bodyU, bodyV, initialSize, maxSize) {
    const targetU = silhouetteBounds
      ? silhouetteBounds.x + bodyU * silhouetteBounds.w
      : bodyU;
    const targetV = silhouetteBounds
      ? silhouetteBounds.y + bodyV * silhouetteBounds.h
      : bodyV;

    labels.push({
      text,
      category,
      size: 0,
      targetSize: initialSize,
      maxSize,
      bodyU,
      bodyV,
      u: targetU,
      v: targetV,
      targetU,
      targetV,
      rot: p.random(-5, 5),
      pulse: 0
    });
  }

  function buildFallbackAnchors() {
    const shape = personShapePoints().map(([u, v]) => ({ u, v }));
    anchorPool = shape;
    anchorsReady = true;
    silhouetteBounds = { x: 0.10, y: 0.03, w: 0.80, h: 0.94 };
    trackingConfidence = 0;
    assignInitialLabels();
    updateLabelPositions();
  }

  function assignAnchor() {
    const slots = [
      { u: 0.50, v: 0.14 }, { u: 0.36, v: 0.25 }, { u: 0.64, v: 0.25 },
      { u: 0.50, v: 0.38 }, { u: 0.30, v: 0.45 }, { u: 0.70, v: 0.45 },
      { u: 0.42, v: 0.58 }, { u: 0.60, v: 0.62 }, { u: 0.34, v: 0.76 },
      { u: 0.66, v: 0.76 }
    ];

    let best = null;
    let bestScore = -Infinity;
    for (const a of slots) {
      let minDist = 1;
      for (const lab of labels) {
        minDist = p.min(minDist, p.dist(a.u, a.v, lab.bodyU, lab.bodyV));
      }
      if (minDist > bestScore) {
        bestScore = minDist;
        best = a;
      }
    }

    return {
      u: p.constrain(best.u + p.random(-0.04, 0.04), 0.08, 0.92),
      v: p.constrain(best.v + p.random(-0.03, 0.03), 0.08, 0.92)
    };
  }

  function addOrGrowLabel(text, category, growAmt, initialSize, maxSize) {
    let lab = labels.find(l => l.text === text);

    if (lab) {
      lab.targetSize = p.min(maxSize, lab.targetSize + growAmt);
      lab.maxSize = maxSize;
      lab.pulse = 1;
    } else {
      const a = assignAnchor();
      createLabelAtBodyPosition(text, category, a.u, a.v, initialSize, maxSize);
    }
  }

  function checkLabelTriggers(effects, card, accepted) {
    if (effects.money !== undefined) {
      if (stats.money >= 60 && effects.money > 0) addOrGrowLabel('hustler', 'consequence', 8, 20, 56);
      if (stats.money <= 30) addOrGrowLabel('broke', 'consequence', 8, 20, 56);
      if (stats.money <= 12) addOrGrowLabel('beggar', 'consequence', 12, 28, 60);
    }
    if (effects.relationship !== undefined) {
      if (stats.relationship >= 70) addOrGrowLabel('beloved', 'consequence', 8, 20, 56);
      if (stats.relationship <= 25) addOrGrowLabel('lonely', 'consequence', 8, 20, 56);
    }
    if (effects.Fitness !== undefined) {
      if (stats.Fitness <= 25) addOrGrowLabel('burnt-out', 'consequence', 8, 20, 56);
      if (stats.Fitness >= 75) addOrGrowLabel('fit', 'consequence', 8, 20, 56);
    }
    if (effects.mood !== undefined) {
      if (stats.mood <= 25) addOrGrowLabel('unstable', 'consequence', 8, 20, 56);
      if (stats.mood >= 75) addOrGrowLabel('resilient', 'consequence', 8, 20, 56);
    }
    if (card.addictRisk && accepted) {
      addOrGrowLabel('addict', 'addict', 16, 30, 64);
    }
  }

  function randomizeCosmetics() {
    nickname = p.random(nameList);
    vipNumber = Math.floor(p.random(1, 999));
    topScoreDays = Math.floor(p.random(40, 400));
    avatarHue = p.random(360);
    labels = [];
    anchorPool = [];
    anchorsReady = false;
    silhouetteBounds = null;
    trackingConfidence = 0;
    lastCaptureFrame = -9999;
    if (maskedWebcam) { maskedWebcam = null; }
    if (prevFrameGfx) { prevFrameGfx.remove(); prevFrameGfx = null; }
  }

  function assignInitialLabels() {
    const n = Math.floor(p.random(3, 9));
    const pool = p.shuffle([...traitPool]);
    for (let i = 0; i < n; i++) addOrGrowLabel(pool[i], 'trait', 0, 15, 20);
  }

  function startNewGame() {
    stats = {
      Fitness: Math.floor(p.random(35, 66)),
      mood: Math.floor(p.random(35, 66)),
      money: Math.floor(p.random(35, 66)),
      relationship: Math.floor(p.random(35, 66)),
    };
    displayStats = { ...stats };
    lastDelta = { Fitness: 0, mood: 0, money: 0, relationship: 0 };
    totalDays = 0;
    age = 18;
    drawPile = p.shuffle([...Array(cardsData.length).keys()]);
    discardPile = [];
    particles = [];
    achievementCounts = {};
    achievementLog = [];
    achievementPopupQueue = [];
    achievementPopup = null;
    gameOver = false;
    endReason = '';
    cardOffset = { x: 0, y: 0 };
    drawNextCard();
  }

  function drawNextCard() {
    if (drawPile.length === 0) {
      drawPile = p.shuffle(discardPile);
      discardPile = [];
    }
    const idx = drawPile.pop();
    currentCard = { ...cardsData[idx], idx };
    cardState = 'entering';
    enterProgress = 0;
    cardOffset = { x: 0, y: 0 };
    entranceType = p.random(['flip', 'bounce', 'spin', 'slide']);
    slideFrom = p.random(['left', 'right', 'top']);
  }

  // ---------- GAME LOGIC & RESOLUTIONS ----------
  function rollDelta(v) {
    if (v === undefined) return 0;
    if (Array.isArray(v)) return Math.round(p.random(v[0], v[1]));
    return v;
  }

  function applyEffects(effects) {
    for (const key of STAT_KEYS) {
      const delta = rollDelta(effects[key]);
      lastDelta[key] = delta !== 0 ? delta : lastDelta[key];
      if (delta !== 0) {
        stats[key] = p.constrain(stats[key] + delta, 0, 100);
        if (Math.abs(delta) >= 8) shakeAmount = p.max(shakeAmount, 6);
      }
    }
  }

  function checkGameOver() {
    for (const key of STAT_KEYS) {
      if (stats[key] <= 0) { gameOver = true; endReason = `Your ${STAT_LABEL[key]} hit rock bottom.`; return; }
      if (stats[key] >= 100) { gameOver = true; endReason = `Your ${STAT_LABEL[key]} maxed out -- and it consumed you.`; return; }
    }
  }

  function checkAchievements(prevStats) {
    for (const def of achievementDefs) {
      if (def.check(stats) && !def.check(prevStats)) queueAchievement(def.id, def.label);
    }
    for (const m of dayMilestones) {
      const prevDays = totalDays - lastDaysAdded;
      if (totalDays >= m.days && prevDays < m.days) queueAchievement(m.id, m.label);
    }
  }

  function queueAchievement(id, label) {
    achievementCounts[id] = (achievementCounts[id] || 0) + 1;
    const entry = { label, day: totalDays, count: achievementCounts[id] };
    achievementLog.unshift(entry);
    achievementPopupQueue.push(entry);
  }

  function resolveCard(direction) {
    if (cardState !== 'idle' && cardState !== 'dragging') return;
    resolveDir = direction;
    resolveProgress = 0;
    resolveSpin = p.random(0.7, 1.4);
    cardState = 'resolving';

    const prevStats = { ...stats };
    const accepted = direction < 0;
    const effects = accepted ? currentCard.accept : currentCard.reject;
    applyEffects(effects);
    checkLabelTriggers(effects, currentCard, accepted);

    captureLabelMoment();

    lastDaysAdded = Math.floor(p.random(17, 30));
    totalDays += lastDaysAdded;
    age = 18 + Math.floor(totalDays / 365);

    checkAchievements(prevStats);

    const burstCol = accepted ? colAccept : colReject;
    spawnParticles(CARD_X + cardOffset.x, CARD_Y + cardOffset.y, burstCol);
  }

  // ---------- PARTICLES ----------
  function spawnParticles(x, y, col) {
    for (let i = 0; i < 18; i++) {
      const ang = p.random(p.TWO_PI), spd = p.random(2, 6);
      particles.push({ x, y, vx: p.cos(ang) * spd, vy: p.sin(ang) * spd - 2, rot: p.random(p.TWO_PI), vrot: p.random(-0.3, 0.3), size: p.random(4, 8), life: 40, col });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.25; pt.rot += pt.vrot; pt.life--;
      if (pt.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    p.rectMode(p.CENTER);
    for (const pt of particles) {
      const a = p.constrain(pt.life / 40, 0, 1) * 255;
      p.push(); p.translate(pt.x, pt.y); p.rotate(pt.rot); p.noStroke();
      p.fill(p.red(pt.col), p.green(pt.col), p.blue(pt.col), a);
      p.rect(0, 0, pt.size, pt.size * 0.6, 1);
      p.pop();
    }
  }

  // ---------- RENDERING COMPONENTS ----------
  function drawMeters() {
    p.rectMode(p.CORNER);
    const defs = [
      ['Fitness', colFitness], ['mood', colMood], ['money', colMoney], ['relationship', colRelationship]
    ];
    const boxW = 110, gap = 12, top = 14, barH = 14;
    defs.forEach(([key, col], i) => {
      displayStats[key] = p.lerp(displayStats[key], stats[key], 0.12);
      const x = 20 + i * (boxW + gap);

      p.noStroke();
      p.fill(colInk);
      p.textFont('Arial'); p.textStyle(p.NORMAL); p.textSize(12);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(key, x, top + 12);

      p.fill(230);
      p.rect(x, top + 16, boxW, barH, 7);
      p.fill(col);
      p.rect(x, top + 16, boxW * p.constrain(displayStats[key] / 100, 0, 1), barH, 7);

      if (lastDelta[key] !== 0) {
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(11);
        p.fill(lastDelta[key] > 0 ? colAccept : colReject);
        p.text((lastDelta[key] > 0 ? '+' : '') + lastDelta[key], x, top + 34);
      }
    });
    p.textAlign(p.CENTER, p.CENTER);
  }

  function avatarPanelBounds() { return { x: 15, y: 68, w: 215, h: 78 }; }

  function drawAvatarPanel() {
    const b = avatarPanelBounds();
    p.rectMode(p.CORNER);
    p.noStroke(); p.fill(245);
    p.rect(b.x, b.y, 46, 46, 6);
    p.push();
    p.colorMode(p.HSB, 360, 100, 100);
    p.fill(avatarHue, 55, 90);
    p.colorMode(p.RGB, 255);
    p.noStroke();
    p.circle(b.x + 23, b.y + 23, 34);
    p.pop();
    p.fill(colInkFaint); p.textSize(8); p.textAlign(p.CENTER, p.CENTER);
    p.text('image\nplaceholder', b.x + 23, b.y + 23);

    p.textAlign(p.LEFT, p.TOP);
    p.fill(colInk); p.textSize(12); p.textStyle(p.BOLD);
    p.text(nickname, b.x + 56, b.y);
    p.textStyle(p.NORMAL); p.textSize(10); p.fill(colInkFaint);
    p.text('(click avatar to reroll)', b.x + 56, b.y + 16);
    p.fill(colPurpleDark); p.textSize(11);
    p.text('VIP ' + vipNumber, b.x + 56, b.y + 34);
    p.fill(colInkFaint); p.textSize(10);
    p.text('Top score: ' + topScoreDays + ' days', b.x + 56, b.y + 50);
    p.textAlign(p.CENTER, p.CENTER);
  }

  function drawAchievementPopup() {
    if (!achievementPopup && achievementPopupQueue.length > 0) {
      achievementPopup = { ...achievementPopupQueue.shift(), timer: 0, total: 170 };
    }
    if (!achievementPopup) return;

    achievementPopup.timer++;
    const t = achievementPopup.timer / achievementPopup.total;
    const slide = t < 0.15 ? easeOutBack(t / 0.15) : (t > 0.85 ? 1 - easeInQuad((t - 0.85) / 0.15) : 1);

    const boxW = 380, boxH = 62, x = DESIGN_W - 20 - boxW * slide, y = 16;
    p.rectMode(p.CORNER);
    p.noStroke();
    p.fill(240); p.circle(x - 12, y + boxH / 2, 56);
    p.fill(colInkFaint); p.textSize(8); p.text('image\nplaceholder', x - 12, y + boxH / 2);

    p.fill(p.red(colPurple), p.green(colPurple), p.blue(colPurple), 255 * slide);
    p.rect(x + 20, y, boxW - 20, boxH, 14);
    p.fill(255, 255, 255, 255 * slide);
    p.textAlign(p.LEFT, p.CENTER); p.textSize(13); p.textStyle(p.BOLD);
    p.text('Achievement unlocked: ' + achievementPopup.label, x + 40, y + 24);
    p.textStyle(p.NORMAL); p.textSize(10);
    p.text('Day ' + achievementPopup.day + '  --  earned ' + achievementPopup.count + ' time' + (achievementPopup.count > 1 ? 's' : ''), x + 40, y + 44);
    p.textAlign(p.CENTER, p.CENTER);

    if (achievementPopup.timer >= achievementPopup.total) achievementPopup = null;
  }

  function drawAchievementBoard() {
    const x = 0, y = 160, w = 215;
    p.rectMode(p.CORNER);
    p.noStroke();
    p.fill(colPurple);
    p.rect(x, y, w, 34);
    p.fill(255); p.textSize(13); p.textStyle(p.BOLD); p.textAlign(p.CENTER, p.CENTER);
    p.text('your achievements!', x + w / 2, y + 17);
    p.textStyle(p.NORMAL);

    p.fill(250); p.rect(x, y + 34, w, 446);

    const visible = achievementLog.slice(0, 5);
    visible.forEach((a, i) => {
      const iy = y + 34 + i * 76 + 6;
      p.noStroke(); p.fill(240);
      p.circle(x + 30, iy + 32, 40);
      p.fill(colInkFaint); p.textSize(7);
      p.text('image\nplaceholder', x + 30, iy + 32);

      p.stroke(220); p.strokeWeight(1); p.noFill();
      p.rect(x + 6, iy, w - 12, 68, 6);
      p.noStroke();
      p.textAlign(p.LEFT, p.TOP);
      p.fill(colInk); p.textSize(12); p.textStyle(p.BOLD);
      p.text(a.label, x + 58, iy + 8, w - 70);
      p.textStyle(p.NORMAL); p.fill(colInkFaint); p.textSize(10);
      p.text('Day ' + a.day, x + 58, iy + 30);
      p.fill(colPurpleDark); p.textSize(10); p.textStyle(p.BOLD);
      p.text(a.count + (a.count === 1 ? ' time!' : ' times!'), x + 58, iy + 46);
      p.textStyle(p.NORMAL);
    });
    p.textAlign(p.CENTER, p.CENTER);
  }

  function drawWebcamArea() {
    p.rectMode(p.CORNER);
    p.noStroke(); p.fill(colInk); p.textSize(26); p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('', SILO_X + SILO_W / 2, 128);
    p.textStyle(p.NORMAL);

    p.push();
    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(SILO_X, SILO_Y, SILO_W, SILO_H);
    p.drawingContext.clip();

    if (videoReady) {
      buildMaskedWebcamFrame();
      if (maskedWebcam) {
        p.image(maskedWebcam, SILO_X, SILO_Y, SILO_W, SILO_H);
      }
    } else {
      p.noStroke(); p.fill(30);
      p.rect(SILO_X, SILO_Y, SILO_W, SILO_H);
      p.fill(220); p.textSize(13);
      p.text(cameraError ? 'camera unavailable' : 'connecting to camera...', SILO_X + SILO_W / 2, SILO_Y + SILO_H / 2);
    }

    for (const lab of labels) {
      lab.size = p.lerp(lab.size, lab.targetSize, 0.14);
      if (lab.size < 1) continue;

      if (lab.targetU !== undefined) lab.u = p.lerp(lab.u, lab.targetU, 0.15);
      if (lab.targetV !== undefined) lab.v = p.lerp(lab.v, lab.targetV, 0.15);
      if (lab.pulse > 0) lab.pulse = p.max(0, lab.pulse - 0.06);

      const px = SILO_X + lab.u * SILO_W;
      const py = SILO_Y + lab.v * SILO_H;
      p.push();
      p.translate(px, py);
      p.rotate(p.radians(lab.rot));
      p.textFont('Arial');
      p.textSize(lab.size);
      p.textAlign(p.CENTER, p.CENTER);

      p.stroke(255, 255, 255, 230);
      p.strokeWeight(p.max(2, lab.size * 0.12));
      if (lab.category === 'trait') { p.fill(90, 90, 105); p.textStyle(p.NORMAL); }
      else if (lab.category === 'addict') { p.fill(170, 25, 60); p.textStyle(p.BOLD); }
      else { p.fill(colPurpleDark); p.textStyle(p.BOLD); }
      p.text(lab.text, 0, 0);
      p.noStroke();
      p.pop();
    }
    p.drawingContext.restore();
    p.pop();
    p.textStyle(p.NORMAL);
  }

  const EVENT_PANEL = { x: 235, y: 545, w: 470, h: 85 };

  function drawEventPanel() {
    const { x, y, w, h } = EVENT_PANEL;
    p.rectMode(p.CORNER);
    p.noStroke(); p.fill(colPanel);
    p.stroke(colPanelBorder); p.strokeWeight(1.5);
    p.rect(x, y, w, h, 10);

    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(x, y, w, h);
    p.drawingContext.clip();

    p.noStroke(); p.fill(colInk); p.textStyle(p.BOLD);
    p.textSize(13);
    p.textLeading(17);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(currentCard ? currentCard.prompt : '', x + 16, y + 8, w - 32, h - 16);
    p.textStyle(p.NORMAL);

    p.drawingContext.restore();
  }

  function drawEncouragementAndCard() {
    p.rectMode(p.CORNER);
    p.noStroke();
    p.fill(colPurple); p.textSize(22); p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Fantastic!', CARD_X, 128);
    p.textStyle(p.NORMAL); p.fill(colInkFaint); p.textSize(11);
    p.text('(this will be animated later)', CARD_X, 150);

    let leftGlow = 0, rightGlow = 0;
    if (cardState === 'dragging' || cardState === 'resolving') {
      leftGlow = p.constrain(-cardOffset.x / DRAG_THRESHOLD, 0, 1);
      rightGlow = p.constrain(cardOffset.x / DRAG_THRESHOLD, 0, 1);
    }
    p.fill(p.red(colAccept), p.green(colAccept), p.blue(colAccept), 140 + leftGlow * 115);
    p.textAlign(p.LEFT, p.CENTER); p.textSize(13);
    p.text('< swipe left, yes!', 765, 180);
    p.fill(p.red(colReject), p.green(colReject), p.blue(colReject), 140 + rightGlow * 115);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('swipe right, no thanks >', 945, 478);
    p.textAlign(p.CENTER, p.CENTER);
  }

  function drawDaysAgeBox() {
    p.rectMode(p.CORNER);
    p.noStroke();
    p.fill(colPurple);
    p.rect(715, 545, 100, 75, 8);
    p.fill(255); p.textSize(11); p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('DAYS', 765, 565);
    p.textSize(22); p.text(totalDays, 765, 592);

    p.fill(colGold);
    p.rect(825, 545, 100, 75, 8);
    p.fill(60); p.textSize(11); p.textStyle(p.BOLD);
    p.text('AGE', 875, 565);
    p.textSize(22); p.text(age, 875, 592);
    p.textStyle(p.NORMAL);
  }

  // ---------- ANIMATIONS & EASINGS ----------
  function easeInQuad(t) { return t * t; }
  function easeOutBack(t) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function easeOutBounce(t) {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
    if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
    t -= 2.625 / d1; return n1 * t * t + 0.984375;
  }

  function updateCard() {
    if (cardState === 'entering') {
      enterProgress += 0.08;
      if (enterProgress >= 1) { enterProgress = 1; cardState = 'idle'; }
    } else if (cardState === 'idle') {
      cardOffset.x = p.lerp(cardOffset.x, 0, 0.25);
      cardOffset.y = p.lerp(cardOffset.y, 0, 0.25);
    } else if (cardState === 'resolving') {
      resolveProgress += 0.06;
      if (resolveProgress >= 1) {
        resolveProgress = 1;
        discardPile.push(currentCard.idx);
        checkGameOver();
        if (!gameOver) drawNextCard();
      }
    }
  }

  function drawCardOnTop() {
    if (!currentCard) return;
    p.push();
    let x = CARD_X, y = CARD_Y, rot = 0, scaleAmt = 1, flipSquish = 1, showBack = false;

    if (cardState === 'entering') {
      const prg = enterProgress;
      if (entranceType === 'flip') {
        const angle = p.PI * (1 - prg);
        flipSquish = Math.abs(Math.cos(angle));
        showBack = angle > p.HALF_PI;
      } else if (entranceType === 'bounce') {
        y = p.lerp(CARD_Y - 220, CARD_Y, easeOutBounce(prg));
      } else if (entranceType === 'spin') {
        rot = p.radians(p.lerp(720, 0, prg));
        scaleAmt = 0.25 + 0.75 * easeOutBack(prg);
      } else if (entranceType === 'slide') {
        const e = easeOutBack(prg);
        if (slideFrom === 'left') x = p.lerp(CARD_X - 400, CARD_X, e);
        else if (slideFrom === 'right') x = p.lerp(CARD_X + 400, CARD_X, e);
        else y = p.lerp(CARD_Y - 300, CARD_Y, e);
      }
    } else if (cardState === 'dragging' || cardState === 'idle') {
      x += cardOffset.x; y += cardOffset.y;
      rot = p.radians(cardOffset.x * 0.06);
    } else if (cardState === 'resolving') {
      const e = easeInQuad(resolveProgress);
      x += resolveDir * e * 480;
      y += e * -30;
      rot = p.radians(resolveDir * e * 40 * resolveSpin);
    }

    p.translate(x, y); p.rotate(rot); p.scale(scaleAmt * flipSquish, scaleAmt);

    if (showBack) { drawCardBack(); p.pop(); return; }

    let dragAmt = 0, dir = 0;
    if (cardState === 'dragging' || cardState === 'idle') { dragAmt = p.constrain(Math.abs(cardOffset.x) / DRAG_THRESHOLD, 0, 1); dir = cardOffset.x > 0 ? 1 : -1; }
    else if (cardState === 'resolving') { dragAmt = 1; dir = resolveDir; }

    p.rectMode(p.CENTER);
    p.noStroke(); p.fill(0, 0, 0, 50);
    p.rect(5, 8, CARD_W, CARD_H, 10);
    
    for (let i = 0; i < CARD_H; i += 2) {
      const t = i / CARD_H;
      p.fill(p.lerpColor(p.color(255, 221, 85), p.color(255, 122, 24), t));
      p.rect(0, -CARD_H / 2 + i, CARD_W, 2);
    }
    p.stroke(180, 100, 20); p.strokeWeight(2); p.noFill();
    p.rect(0, 0, CARD_W, CARD_H, 10);

    if (dragAmt > 0) {
      p.noStroke();
      const tintCol = dir < 0 ? colAccept : colReject;
      p.fill(p.red(tintCol), p.green(tintCol), p.blue(tintCol), dragAmt * 90);
      p.rect(0, 0, CARD_W, CARD_H, 10);
    }

    p.noStroke(); p.fill(40, 25, 10); p.textSize(13); p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('SWIPE', 0, -20);
    p.textStyle(p.NORMAL); p.textSize(10);
    p.text('left to accept\nright to decline', 0, 12);

    if (cardState === 'resolving') {
      p.push();
      const a = p.constrain(resolveProgress * 2, 0, 1) * 255;
      p.rotate(p.radians(-16));
      const stampCol = resolveDir < 0 ? colAccept : colReject;
      p.noFill(); p.stroke(p.red(stampCol), p.green(stampCol), p.blue(stampCol), a); p.strokeWeight(3);
      p.rect(0, 60, 130, 38, 4);
      p.noStroke(); p.fill(p.red(stampCol), p.green(stampCol), p.blue(stampCol), a);
      p.textSize(16); p.textStyle(p.BOLD);
      p.text(resolveDir < 0 ? 'ACCEPTED' : 'DECLINED', 0, 62);
      p.textStyle(p.NORMAL);
      p.pop();
    }
    p.pop();
  }

  function drawCardBack() {
    p.rectMode(p.CENTER);
    p.noStroke(); p.fill(0, 0, 0, 50);
    p.rect(5, 8, CARD_W, CARD_H, 10);
    p.fill(60, 45, 30);
    p.rect(0, 0, CARD_W, CARD_H, 10);
    p.stroke(240); p.strokeWeight(1.5); p.noFill();
    p.rect(0, 0, CARD_W, CARD_H, 10);
    p.rect(-CARD_W / 2 + 12, -CARD_H / 2 + 12, CARD_W - 24, CARD_H - 24, 4);
    p.noStroke(); p.fill(240);
    p.push(); p.rotate(p.radians(45)); p.rect(0, 0, 36, 36, 4); p.pop();
  }

  function pointInCard(mx, my) {
    const x = CARD_X + cardOffset.x, y = CARD_Y + cardOffset.y;
    return mx > x - CARD_W / 2 && mx < x + CARD_W / 2 && my > y - CARD_H / 2 && my < y + CARD_H / 2;
  }

  function drawGameOver() {
    p.rectMode(p.CENTER);
    p.noStroke(); p.fill(0, 0, 0, 170);
    p.rectMode(p.CORNER); p.rect(0, 0, DESIGN_W, DESIGN_H);

    p.rectMode(p.CENTER);
    p.fill(colPanel); p.stroke(colPanelBorder); p.strokeWeight(1.5);
    p.rect(DESIGN_W / 2, DESIGN_H / 2, 420, 240, 10);

    p.noStroke(); p.fill(colInk); p.textSize(24); p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Game over', DESIGN_W / 2, DESIGN_H / 2 - 80);
    p.textStyle(p.NORMAL); p.textSize(13);
    p.text(endReason, DESIGN_W / 2, DESIGN_H / 2 - 45, 320, 40);

    p.textSize(12);
    let y = DESIGN_H / 2 + 5;
    for (const key of STAT_KEYS) { p.text(key + ': ' + Math.round(stats[key]), DESIGN_W / 2, y); y += 16; }

    const btnY = DESIGN_H / 2 + 95;
    p.fill(colPurple); p.noStroke();
    p.rect(DESIGN_W / 2, btnY, 150, 36, 6);
    p.fill(255); p.textSize(13); p.textStyle(p.BOLD);
    p.text('PLAY AGAIN', DESIGN_W / 2, btnY);
    p.textStyle(p.NORMAL);
  }

  function isOverRestartButton(mx, my) {
    const btnY = DESIGN_H / 2 + 95;
    return mx > DESIGN_W / 2 - 75 && mx < DESIGN_W / 2 + 75 && my > btnY - 18 && my < btnY + 18;
  }

  // ---------- MOUSE INPUT & SCALING ----------
  p.mousePressed = () => {
    // Map actual screen clicks to coordinate space inside scaled canvas
    const mx = p.mouseX * (DESIGN_W / p.width);
    const my = p.mouseY * (DESIGN_H / p.height);

    if (gameOver) {
      if (isOverRestartButton(mx, my)) {
        randomizeCosmetics();
        startNewGame();
        if (videoReady) {
          updateSilhouetteAnchors();
          if (!anchorsReady) buildFallbackAnchors();
          updateLabelPositions();
        } else {
          buildFallbackAnchors();
        }
      }
      return;
    }
    const av = avatarPanelBounds();
    if (mx > av.x && mx < av.x + 46 && my > av.y && my < av.y + 46) {
      nickname = p.random(nameList.filter(n => n !== nickname));
      return;
    }
    if (cardState !== 'idle') return;
    if (pointInCard(mx, my)) cardState = 'dragging';
  };

  p.mouseDragged = () => {
    if (cardState !== 'dragging') return;
    const scaleFactor = DESIGN_W / p.width;
    cardOffset.x += p.movedX * scaleFactor;
    cardOffset.y += p.movedY * 0.3 * scaleFactor;
    cardOffset.y = p.constrain(cardOffset.y, -40, 40);
  };

  p.mouseReleased = () => {
    if (cardState !== 'dragging') return;
    if (Math.abs(cardOffset.x) > DRAG_THRESHOLD) resolveCard(cardOffset.x > 0 ? 1 : -1);
    else cardState = 'idle';
  };
};

// Start the sketch
new p5(myMainCanvasSketch);