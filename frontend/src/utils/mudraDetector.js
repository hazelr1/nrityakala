/**
 * Rule-based mudra detection using MediaPipe hand landmarks.
 * Landmark indices:
 *  0: wrist
 *  1-4: thumb (CMC, MCP, IP, TIP)
 *  5-8: index (MCP, PIP, DIP, TIP)
 *  9-12: middle (MCP, PIP, DIP, TIP)
 *  13-16: ring (MCP, PIP, DIP, TIP)
 *  17-20: pinky (MCP, PIP, DIP, TIP)
 */

/**
 * Determines if a finger is extended based on landmarks.
 * For fingers (not thumb): tip y < pip y means extended (tip is higher than pip)
 * We use y coordinates (lower y = higher on screen in image space)
 */
function isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];

  // Finger is extended if tip is higher than pip, and pip higher than mcp
  // In MediaPipe, y increases downward, so smaller y = higher
  const tipToPip = pip.y - tip.y;
  return tipToPip > 0.04; // threshold
}

function isThumbExtended(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexMcp = landmarks[5];

  // Thumb is extended if tip is far from index finger base
  const dx = thumbTip.x - indexMcp.x;
  const dy = thumbTip.y - indexMcp.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist > 0.1;
}

function isThumbBentAcrossPalm(landmarks) {
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  // Thumb is close to palm center between index and pinky MCP
  const palmCenterX = (indexMcp.x + pinkyMcp.x) / 2;
  const palmCenterY = (indexMcp.y + pinkyMcp.y) / 2;
  const dx = thumbTip.x - palmCenterX;
  const dy = thumbTip.y - palmCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < 0.12;
}

function areFingersSpread(landmarks) {
  // Check if index through pinky spread apart
  const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
  let totalSpread = 0;
  for (let i = 0; i < tips.length - 1; i++) {
    const dx = tips[i + 1].x - tips[i].x;
    const dy = tips[i + 1].y - tips[i].y;
    totalSpread += Math.sqrt(dx * dx + dy * dy);
  }
  return totalSpread > 0.25;
}

function getFingerStates(landmarks) {
  return {
    thumb: isThumbExtended(landmarks),
    thumbBent: isThumbBentAcrossPalm(landmarks),
    index: isFingerExtended(landmarks, 8, 6, 5),
    middle: isFingerExtended(landmarks, 12, 10, 9),
    ring: isFingerExtended(landmarks, 16, 14, 13),
    pinky: isFingerExtended(landmarks, 20, 18, 17),
    spread: areFingersSpread(landmarks)
  };
}

/**
 * Classify a mudra based on finger states.
 * Returns { name, confidence }
 */
export function classifyMudra(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { name: 'Unknown', confidence: 0, description: 'No hand detected' };
  }

  const f = getFingerStates(landmarks);

  // Mushti: all fingers curled into fist
  if (!f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) {
    return { name: 'Mushti', confidence: 90, description: 'Fist - all fingers curled' };
  }

  // Shikara: thumb up, all others bent
  if (f.thumb && !f.index && !f.middle && !f.ring && !f.pinky) {
    return { name: 'Shikara', confidence: 88, description: 'Thumb up, others bent' };
  }

  // Pataka: all 4 fingers straight, thumb bent across palm
  if (!f.thumb && f.thumbBent && f.index && f.middle && f.ring && f.pinky && !f.spread) {
    return { name: 'Pataka', confidence: 85, description: 'All fingers straight, thumb bent in' };
  }

  // Tripataka: index, middle, pinky straight; ring bent; thumb bent
  if (f.index && f.middle && !f.ring && f.pinky && !f.thumb) {
    return { name: 'Tripataka', confidence: 82, description: 'Ring finger bent, others straight' };
  }

  // Ardhachandra: thumb extended out, 4 fingers straight together
  if (f.thumb && f.index && f.middle && f.ring && f.pinky && !f.spread) {
    return { name: 'Ardhachandra', confidence: 80, description: 'Thumb extended, fingers straight' };
  }

  // Alapadma: all 5 fingers spread open
  if (f.index && f.middle && f.ring && f.pinky && f.spread) {
    return { name: 'Alapadma', confidence: 84, description: 'All fingers spread open like lotus' };
  }

  // Mayura: index curved toward thumb, others straight
  if (!f.index && f.middle && f.ring && f.pinky) {
    return { name: 'Mayura', confidence: 75, description: 'Index bent toward thumb, others raised' };
  }

  // Katakamukha: index, middle, ring curved; pinky straight
  if (!f.index && !f.middle && !f.ring && f.pinky) {
    return { name: 'Katakamukha', confidence: 72, description: 'Three fingers bent, pinky straight' };
  }

  return { name: 'Unknown', confidence: 0, description: 'Mudra not recognized' };
}

/**
 * Calculate accuracy between detected and expected mudra
 */
export function calculateAccuracy(detected, expected) {
  if (!detected || !expected) return 0;
  if (detected === expected) return 100;
  return 0;
}

/**
 * Returns a confidence-weighted accuracy score
 */
export function getAccuracyScore(detected, expected, confidence) {
  if (detected === expected) {
    return Math.round(confidence);
  }
  return 0;
}
