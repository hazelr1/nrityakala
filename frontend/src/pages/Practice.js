import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMudras, savePracticeLog } from '../utils/api';
import { classifyMudra, getAccuracyScore } from '../utils/mudraDetector';

const Practice = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  // Stores aggregated results per mudra for the current run
  // {
  //   [mudraId]: {
  //     mudraId, mudraName,
  //     results: [{score, correct, detected}],
  //     startTimeMs,
  //     lastSwitchTimeMs,
  //     durationSec
  //   }
  // }
  const sessionByMudraRef = useRef({});
  const currentMudraIdRef = useRef(null);

  // Keep latest selected mudra + isActive without causing onResults to change
  const selectedMudraRef = useRef(null);
  const isActiveRef = useRef(false);

  const [mudras, setMudras] = useState([]);
  const [selectedMudra, setSelectedMudra] = useState(null);
  const [detectedMudra, setDetectedMudra] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mpLoading, setMpLoading] = useState(false);
  const [feedback, setFeedback] = useState('neutral');
  const [accuracy, setAccuracy] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();

  // Keep refs updated
  useEffect(() => {
    selectedMudraRef.current = selectedMudra;
  }, [selectedMudra]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Load mudras
  useEffect(() => {
    getMudras()
      .then((res) => {
        setMudras(res.data);
        const mudraId = searchParams.get('mudra');
        if (mudraId) {
          const found = res.data.find((m) => m._id === mudraId);
          if (found) setSelectedMudra(found);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Mirror landmarks to match mirrored video
  const drawLandmarks = useCallback((ctx, landmarks, width, height) => {
    const mx = (x) => (1 - x) * width;
    const my = (y) => y * height;

    const connections = [
      [0, 1],[1, 2],[2, 3],[3, 4],
      [0, 5],[5, 6],[6, 7],[7, 8],
      [5, 9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17]
    ];

    ctx.strokeStyle = 'rgba(200,151,42,0.7)';
    ctx.lineWidth = 2;

    connections.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(mx(landmarks[a].x), my(landmarks[a].y));
      ctx.lineTo(mx(landmarks[b].x), my(landmarks[b].y));
      ctx.stroke();
    });

    landmarks.forEach((lm, i) => {
      ctx.beginPath();
      ctx.arc(mx(lm.x), my(lm.y), i === 0 ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = i === 0 ? 'var(--saffron)' : 'var(--gold-light)';
      ctx.fill();
    });
  }, []);

  // Ensure the per-mudra bucket exists; also handles duration tracking when switching
  const ensureMudraBucket = useCallback((mudra) => {
    if (!mudra?._id) return null;

    const map = sessionByMudraRef.current;
    if (!map[mudra._id]) {
      map[mudra._id] = {
        mudraId: mudra._id,
        mudraName: mudra.name,
        results: [],
        startTimeMs: Date.now(),
        lastSwitchTimeMs: Date.now(),
        durationSec: 0
      };
    }
    return map[mudra._id];
  }, []);

  // When selectedMudra changes during an active session, update duration buckets
  useEffect(() => {
    if (!isActive) {
      // If not active, just set current
      currentMudraIdRef.current = selectedMudra?._id || null;
      return;
    }

    const now = Date.now();
    const prevId = currentMudraIdRef.current;
    const nextId = selectedMudra?._id || null;

    // Close out duration on previous mudra
    if (prevId && sessionByMudraRef.current[prevId]) {
      const prev = sessionByMudraRef.current[prevId];
      const deltaSec = Math.max(0, Math.round((now - (prev.lastSwitchTimeMs || now)) / 1000));
      prev.durationSec += deltaSec;
    }

    // Start duration tracking for new mudra
    if (selectedMudra) {
      const next = ensureMudraBucket(selectedMudra);
      if (next) next.lastSwitchTimeMs = now;
    }

    currentMudraIdRef.current = nextId;
    // Reset per-frame stats when switching (optional but feels better UX)
    setSessionStats({ correct: 0, total: 0 });
    setSaved(false);
  }, [selectedMudra, isActive, ensureMudraBucket]);

  // IMPORTANT: stable onResults (does NOT depend on selectedMudra/isActive)
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw the frame mirrored
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      drawLandmarks(ctx, landmarks, canvas.width, canvas.height);

      const detected = classifyMudra(landmarks);
      setDetectedMudra(detected);

      const currentSelected = selectedMudraRef.current;
      const active = isActiveRef.current;

      if (currentSelected && active) {
        // Make sure bucket exists (especially if user starts then selects quickly)
        ensureMudraBucket(currentSelected);

        const score = getAccuracyScore(detected.name, currentSelected.name, detected.confidence);
        const correct = detected.name === currentSelected.name;

        setAccuracy(score);
        setFeedback(correct ? 'correct' : 'incorrect');

        setSessionStats((prev) => ({
          correct: prev.correct + (correct ? 1 : 0),
          total: prev.total + 1
        }));

        // Store per-mudra
        const bucket = sessionByMudraRef.current[currentSelected._id];
        if (bucket) bucket.results.push({ score, correct, detected: detected.name });
      }
    } else {
      setDetectedMudra(null);
      setFeedback('neutral');
      setAccuracy(0);
    }
  }, [drawLandmarks, ensureMudraBucket]);

  const startCamera = useCallback(async () => {
    setMpLoading(true);
    setError('');
    setSaved(false);

    try {
      const { Hands } = window;
      const { Camera } = window;

      if (!Hands || !Camera) {
        setError('MediaPipe not loaded. Please check your internet connection and refresh.');
        setMpLoading(false);
        return;
      }

      // Reset session
      sessionByMudraRef.current = {};
      currentMudraIdRef.current = selectedMudraRef.current?._id || null;
      setSessionStats({ correct: 0, total: 0 });

      // Initialize bucket for starting mudra
      if (selectedMudraRef.current) {
        ensureMudraBucket(selectedMudraRef.current);
      }

      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      await camera.start();
      cameraRef.current = camera;

      setIsActive(true);
      setFeedback('neutral');
      setAccuracy(0);
    } catch (err) {
      setError('Could not access webcam. Please grant camera permission.');
      console.error(err);
    } finally {
      setMpLoading(false);
    }
  }, [onResults, ensureMudraBucket]);

  const stopCamera = useCallback(async () => {
    // Stop streams first to prevent send() while closing
    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch {}
      cameraRef.current = null;
    }
    if (handsRef.current) {
      try { await handsRef.current.close(); } catch {}
      handsRef.current = null;
    }

    // finalize duration for currently selected mudra
    const now = Date.now();
    const currentId = currentMudraIdRef.current;
    if (currentId && sessionByMudraRef.current[currentId]) {
      const current = sessionByMudraRef.current[currentId];
      const deltaSec = Math.max(0, Math.round((now - (current.lastSwitchTimeMs || now)) / 1000));
      current.durationSec += deltaSec;
    }

    setIsActive(false);
    setFeedback('neutral');

    const sessions = Object.values(sessionByMudraRef.current);

    // Save one log per mudra that actually has results
    const toSave = sessions.filter((s) => s.results && s.results.length > 0);

    if (toSave.length === 0) {
      setSaved(false);
      return;
    }

    try {
      // Save sequentially (simple + reliable)
      for (const s of toSave) {
        const avgScore = Math.round(s.results.reduce((sum, r) => sum + r.score, 0) / s.results.length);
        const correctCount = s.results.filter((r) => r.correct).length;
        const lastDetected = s.results[s.results.length - 1]?.detected || 'Unknown';

        await savePracticeLog({
          mudraId: s.mudraId,
          mudraName: s.mudraName,
          detectedMudra: lastDetected,
          accuracyScore: avgScore,
          isCorrect: correctCount > s.results.length / 2,
          duration: s.durationSec || 0
        });
      }

      setSaved(true);
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // best-effort cleanup
      (async () => {
        if (cameraRef.current) {
          try { cameraRef.current.stop(); } catch {}
          cameraRef.current = null;
        }
        if (handsRef.current) {
          try { await handsRef.current.close(); } catch {}
          handsRef.current = null;
        }
      })();
    };
  }, []);

  const overallAccuracy = sessionStats.total > 0
    ? Math.round((sessionStats.correct / sessionStats.total) * 100)
    : 0;

  const feedbackBorderClass =
    feedback === 'correct'
      ? 'feedback-correct'
      : feedback === 'incorrect'
        ? 'feedback-incorrect'
        : 'feedback-neutral';

  return (
    <div className="page-container" style={{ background: 'linear-gradient(180deg, var(--brown-dark) 0%, var(--cream) 40%)' }}>
      <div className="container">
        <div className="page-header">
          <h1 style={{ color: 'var(--gold-light)' }}>Practice Studio</h1>
          <p style={{ color: 'rgba(253,246,236,0.7)' }}>Position your hand in frame and perform the mudra</p>
        </div>

        <div style={styles.layout}>
          {/* Left: mudra selector */}
          <div style={styles.sidebar}>
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Select Mudra</h3>
              {loading ? <div className="spinner" /> : (
                <div style={styles.mudraList}>
                  {mudras.map(m => (
                    <button
                      key={m._id}
                      disabled={mpLoading} // allow switching even while active
                      onClick={() => {
                        setSelectedMudra(m);
                        setSaved(false);
                      }}
                      style={{
                        ...styles.mudraOption,
                        background: selectedMudra?._id === m._id ? 'rgba(232,100,12,0.1)' : 'transparent',
                        borderColor: selectedMudra?._id === m._id ? 'var(--saffron)' : 'var(--border)',
                        color: selectedMudra?._id === m._id ? 'var(--saffron-dark)' : 'var(--text-dark)',
                        opacity: mpLoading ? 0.6 : 1
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{m.difficulty}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            {selectedMudra && (
              <div className="card" style={{ marginTop: '16px' }}>
                <div style={styles.instrLabel}>Selected</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: '4px' }}>
                  {selectedMudra.name}
                </h3>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)', fontStyle: 'italic', marginBottom: '12px' }}>
                  {selectedMudra.sanskritName}
                </div>
                <div style={{ ...styles.howToBox }}>
                  <div style={styles.instrLabel}>How to form</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
                    {selectedMudra.howToForm}
                  </p>
                </div>

                {isActive && (
                  <p style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    Tip: You can switch mudras anytime—results will be saved per mudra when you stop.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Center: webcam */}
          <div style={styles.webcamArea}>
            {error && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{error}</div>}

            <div style={styles.webcamWrapper} className={feedbackBorderClass}>
              <video ref={videoRef} style={styles.video} autoPlay muted playsInline />
              <canvas ref={canvasRef} style={styles.canvas} />

              {!isActive && (
                <div style={styles.webcamOverlay}>
                  <div style={{ fontSize: '1rem', marginBottom: '16px' }}>CAMERA</div>
                  <p style={{ color: 'var(--cream)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                    Camera inactive
                  </p>
                  <p style={{ color: 'rgba(253,246,236,0.6)', fontSize: '0.85rem', marginTop: '8px' }}>
                    Select a mudra and press Start
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={styles.controls}>
              {!isActive ? (
                <button
                  className="btn btn-primary"
                  onClick={startCamera}
                  disabled={!selectedMudra || mpLoading}
                  style={{ flex: 1 }}
                >
                  {mpLoading ? 'Starting...' : 'Start Practice'}
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={stopCamera}
                  style={{ flex: 1 }}
                >
                  Stop and Save
                </button>
              )}
            </div>

            {saved && (
              <div className="alert alert-success" style={{ marginTop: '12px', textAlign: 'center' }}>
                Session saved to your history!
              </div>
            )}
          </div>

          {/* Right: feedback panel */}
          <div style={styles.feedbackPanel}>
            {/* Live detection */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '16px' }}>
                Live Detection
              </h3>

              <div style={styles.feedbackRow}>
                <span style={styles.feedbackLabel}>Expected</span>
                <span style={styles.expectedMudra}>{selectedMudra?.name || 'N/A'}</span>
              </div>

              <div style={styles.feedbackRow}>
                <span style={styles.feedbackLabel}>Detected</span>
                <span style={{
                  ...styles.detectedMudra,
                  color: detectedMudra?.name === selectedMudra?.name ? 'var(--success)' : 'var(--crimson)'
                }}>
                  {detectedMudra?.name || 'N/A'}
                </span>
              </div>

              {isActive && detectedMudra && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <span
                    className={`badge ${feedback === 'correct' ? 'badge-correct' : 'badge-incorrect'}`}
                    style={{ fontSize: '0.85rem', padding: '6px 20px' }}
                  >
                    {feedback === 'correct' ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              )}
            </div>

            {/* Accuracy */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '16px' }}>
                Session Accuracy
              </h3>

              <div style={styles.accuracyCircle}>
                <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke={overallAccuracy >= 70 ? '#2E7D32' : overallAccuracy >= 40 ? 'var(--saffron)' : '#C62828'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallAccuracy / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <div style={styles.accuracyText}>{overallAccuracy}%</div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  {sessionStats.correct} / {sessionStats.total} frames correct
                </span>
              </div>
            </div>

            {/* Detection info */}
            {detectedMudra && detectedMudra.name !== 'Unknown' && (
              <div className="card">
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '12px' }}>
                  Detected Info
                </h3>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--brown-dark)', marginBottom: '4px' }}>
                  {detectedMudra.name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                  {detectedMudra.description}
                </p>
                <div style={styles.confidenceBar}>
                  <div style={{ ...styles.confidenceFill, width: `${detectedMudra.confidence}%` }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  Confidence: {detectedMudra.confidence}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 220px',
    gap: '20px',
    paddingBottom: '60px',
    alignItems: 'start'
  },
  sidebar: { display: 'flex', flexDirection: 'column' },
  mudraList: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' },
  mudraOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    border: '1.5px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  instrLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--saffron)',
    fontWeight: 600,
    marginBottom: '4px'
  },
  howToBox: {
    background: 'rgba(232,100,12,0.05)',
    borderRadius: '8px',
    padding: '10px'
  },
  webcamArea: { display: 'flex', flexDirection: 'column', gap: '12px' },
  webcamWrapper: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#0A0604',
    aspectRatio: '4/3',
    border: '3px solid var(--gold)'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
    display: 'block'
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  webcamOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10,6,4,0.85)'
  },
  controls: {
    display: 'flex',
    gap: '12px'
  },
  feedbackPanel: { display: 'flex', flexDirection: 'column' },
  feedbackRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)'
  },
  feedbackLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  expectedMudra: {
    fontFamily: 'Playfair Display, serif',
    color: 'var(--brown-dark)',
    fontSize: '1rem'
  },
  detectedMudra: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1rem',
    fontWeight: 600
  },
  accuracyCircle: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  accuracyText: {
    position: 'absolute',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    fontSize: '1.1rem',
    color: 'var(--brown-dark)'
  },
  confidenceBar: {
    width: '100%',
    height: '6px',
    background: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '4px'
  },
  confidenceFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--saffron), var(--gold))',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  }
};

export default Practice;