import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Gift, X, Copy, Check, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

const PRIZES = [
  { text: "15% Off", code: "SPIN15", color: "#EC4899" }, // pink
  { text: "Try Again", code: null, color: "#9CA3AF" },   // gray
  { text: "10% Off", code: "SPIN10", color: "#10B981" }, // emerald
  { text: "Flat $5 Off", code: "SPIN5", color: "#F59E0B" }, // amber
  { text: "Free Delivery", code: "FREESHIP", color: "#3B82F6" }, // blue
  { text: "Try Again", code: null, color: "#9CA3AF" }    // gray
];

const SpinWheel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [wonPrize, setWonPrize] = useState(null);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Audio system for ticking and victory chords
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioContextRef.current;
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      // Play major arpeggio
      playTone(261.63, 0.0, 0.3); // C4
      playTone(329.63, 0.1, 0.3); // E4
      playTone(392.00, 0.2, 0.3); // G4
      playTone(523.25, 0.3, 0.6); // C5
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  const playLossSound = () => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  // Check spin status from localStorage
  const checkCooldown = () => {
    const lastSpin = localStorage.getItem("srisCart_lastSpin");
    if (lastSpin) {
      const diff = Date.now() - parseInt(lastSpin, 10);
      const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours
      if (diff < cooldownTime) {
        setHasSpunToday(true);
        return true;
      }
    }
    setHasSpunToday(false);
    return false;
  };

  // Live countdown timer effect
  useEffect(() => {
    if (!hasSpunToday) return;

    const updateTime = () => {
      const lastSpin = localStorage.getItem("srisCart_lastSpin");
      if (!lastSpin) {
        setHasSpunToday(false);
        setTimeRemaining("");
        return;
      }

      const diff = Date.now() - parseInt(lastSpin, 10);
      const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours
      const remaining = cooldownTime - diff;

      if (remaining <= 0) {
        setHasSpunToday(false);
        setTimeRemaining("");
      } else {
        const hours = Math.floor(remaining / (3600 * 1000));
        const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
        const secs = Math.floor((remaining % (60 * 1000)) / 1000);
        setTimeRemaining(`${hours}h ${mins}m ${secs}s`);
      }
    };

    updateTime(); // update immediately
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [hasSpunToday]);

  useEffect(() => {
    checkCooldown();
  }, [isOpen]);

  // Draw the spin wheel canvas
  const drawWheel = (angle = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 15;

    ctx.clearRect(0, 0, width, height);

    // Draw outer glow / border ring
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#1F2937"; // dark gray outer container
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw colorful segments
    const numSlices = PRIZES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    PRIZES.forEach((prize, i) => {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Add a subtle border line between slices
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff40";
      ctx.stroke();

      // Add text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 14px Outfit, sans-serif";

      // Shadow for text readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(prize.text, radius - 25, 0);
      ctx.restore();
    });

    // Draw center pin button
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Small inner gold circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, 2 * Math.PI);
    ctx.fillStyle = "#F59E0B";
    ctx.fill();

    // Small arrow head center details
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#1F2937";
    ctx.fill();
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow canvas element to render in DOM
      setTimeout(() => {
        drawWheel(0);
      }, 50);
    }
  }, [isOpen]);

  // Spin execution physics logic
  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    initAudio();
    setIsSpinning(true);
    setWonPrize(null);

    const spinDuration = 4500; // milliseconds
    const startTime = Date.now();
    const targetRevolutions = 8 + Math.random() * 5; // spins
    const totalRotation = targetRevolutions * 2 * Math.PI;

    let currentAngle = 0;
    let lastTickAngle = 0;
    const numSlices = PRIZES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing out easeOutCubic logic
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      currentAngle = easeOutProgress * totalRotation;

      // Calculate sector boundary ticking sounds
      const sliceSize = 2 * Math.PI / numSlices;
      const normalizedAngle = (currentAngle % (2 * Math.PI));
      const tickCheckpoint = Math.floor(normalizedAngle / sliceSize);
      const lastTickCheckpoint = Math.floor(lastTickAngle / sliceSize);

      if (tickCheckpoint !== lastTickCheckpoint) {
        playTickSound();
      }
      lastTickAngle = normalizedAngle;

      drawWheel(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        localStorage.setItem("srisCart_lastSpin", Date.now().toString());

        // Calculate winning wedge
        // Top of wheel is at 1.5 * Math.PI radians (270 degrees)
        const finalAngle = currentAngle % (2 * Math.PI);
        const topIndicatorOffset = 1.5 * Math.PI;
        const relativeAngle = (topIndicatorOffset - finalAngle + 4 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(relativeAngle / sliceAngle);

        const result = PRIZES[winningIndex];
        setWonPrize(result);

        if (result.code) {
          playVictorySound();
          toast.success(`Congratulations! You won ${result.text}!`);
          localStorage.setItem("srisCart_savedCoupon", result.code);
          triggerConfettiParticles();
        } else {
          playLossSound();
          toast(`Better luck next time!`, { icon: "😥" });
        }
        checkCooldown();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const copyToClipboard = () => {
    if (!wonPrize || !wonPrize.code) return;
    navigator.clipboard.writeText(wonPrize.code);
    setCopied(true);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const applyCouponToCart = () => {
    if (!wonPrize || !wonPrize.code) return;
    // Store in session storage so Cart page can retrieve it instantly
    sessionStorage.setItem("srisCart_pendingCoupon", wonPrize.code);
    toast.success(`Coupon ${wonPrize.code} ready! Go to Cart to checkout.`);
    setIsOpen(false);
  };

  // Simple pure JS confetti system rendered directly over screen
  const triggerConfettiParticles = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 110 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let animationFrame;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const colors = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        radius: randomInRange(3, 8),
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: randomInRange(-15, 15),
        vy: randomInRange(-15, 10),
        rotation: randomInRange(0, 360),
        rotationSpeed: randomInRange(-5, 5),
        opacity: 1
      });
    }

    const run = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.01;

        if (p.opacity <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        ctx.restore();
      });

      if (Date.now() < animationEnd && particles.length > 0) {
        animationFrame = requestAnimationFrame(run);
      } else {
        window.removeEventListener("resize", resizeCanvas);
        canvas.remove();
      }
    };

    run();
  };

  return (
    <>
      {/* Floating Trigger Action Button Container */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/20 hover:scale-105 transition-all duration-300 border-2 border-white relative group cursor-pointer"
        >
          <div className="relative">
            <Gift className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          </div>
          {/* Tooltip */}
          <span className="absolute -top-12 left-0 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none">
            Spin & Save!
          </span>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 flex flex-col items-center">
            
            {/* Header controls */}
            <div className="w-full flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                <h3 className="text-xl font-extrabold text-gray-800">Mystery Spin Wheel</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title={soundEnabled ? "Mute sound" : "Unmute sound"}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    if (!isSpinning) setIsOpen(false);
                  }}
                  disabled={isSpinning}
                  className={`p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition cursor-pointer ${
                    isSpinning ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Spin Wheel Area */}
            <div className="relative flex justify-center items-center my-6">
              {/* Top arrow pointer */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-red-600 drop-shadow-md" />
              
              {/* Wheel Canvas */}
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-[280px] h-[280px] md:w-[300px] md:h-[300px] rounded-full border-4 border-gray-800 shadow-xl bg-gray-50"
              />

              {/* Center Trigger Button overlay */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || hasSpunToday}
                className={`absolute w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-sm shadow-xl select-none transition-all cursor-pointer ${
                  isSpinning
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed scale-95"
                    : hasSpunToday
                    ? "bg-amber-100 text-amber-500 cursor-not-allowed scale-95 border border-amber-300"
                    : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:scale-105 active:scale-95 border-2 border-white"
                }`}
              >
                {isSpinning ? "SPINNING" : hasSpunToday ? "LOCKED" : "SPIN!"}
              </button>
            </div>

            {/* Status Panel */}
            <div className="w-full text-center mt-2 px-2">
              {hasSpunToday ? (
                <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-100">
                  <p className="text-sm text-amber-800 font-semibold mb-1">
                    You've spun today! Next spin in:
                  </p>
                  <p className="text-lg font-mono font-bold text-amber-600 tracking-wider">
                    {timeRemaining || "Calculating..."}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-500 tracking-wide">
                  Try your luck to win awesome promo discount codes for your cart!
                </p>
              )}

              {/* Prize Claim Window */}
              {wonPrize && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 animate-scale-up">
                  {wonPrize.code ? (
                    <>
                      <p className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-ping" /> Win Unlocked! <Sparkles className="w-4 h-4" />
                      </p>
                      <h4 className="text-lg font-extrabold text-gray-800 mb-2">
                        You won: <span className="text-amber-500">{wonPrize.text}</span>
                      </h4>
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl p-2.5 shadow-sm justify-between mt-3">
                        <code className="text-md font-mono font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                          {wonPrize.code}
                        </code>
                        <div className="flex gap-1.5">
                          <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition rounded-lg border border-gray-200 cursor-pointer"
                            title="Copy code"
                          >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={applyCouponToCart}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                          >
                            Apply to Cart
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="text-md font-bold text-gray-700">Better Luck Tomorrow!</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        No coupon was unlocked this time. Check back in 24 hours to spin again!
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpinWheel;
