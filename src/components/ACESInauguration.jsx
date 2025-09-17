import React, { useState, useEffect, useRef } from 'react';

const ACESInauguration = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showRedirectNotice, setShowRedirectNotice] = useState(false);
  const [countdown, setCountdown] = useState(7);
  
  const terminalRef = useRef(null);
  const terminalContentRef = useRef(null);
  const matrixCanvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const fireworksCanvasRef = useRef(null);
  const popCanvasRef = useRef(null);
  
  const soundSystemRef = useRef(null);
  const matrixRainRef = useRef(null);
  const popEffectsRef = useRef(null);

  const celebrationColors = ["#FFFFFF", "#E9D5FF", "#C084FC", "#9333EA", "#4C1D95"];

  // Sound System Class
  class SoundSystem {
    constructor() {
      this.audioContext = null;
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return;
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
      } catch (e) {
        console.log('Audio not supported');
      }
    }

    playKeyboardSound() {
      if (!this.initialized) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    playSuccessSound() {
      if (!this.initialized) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2);
      
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playCelebrationSound() {
      if (!this.initialized) return;
      const frequencies = [523.25, 659.25, 783.99];
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime + index * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
        
        oscillator.start(this.audioContext.currentTime + index * 0.05);
        oscillator.stop(this.audioContext.currentTime + 1.5);
      });
    }

    playConfettiSound() {
      if (!this.initialized) return;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(1500 + Math.random() * 500, this.audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.15);
        }, i * 120);
      }
    }
  }

  // Base Particle System Class
  class ParticleSystem {
    constructor(canvas, colors) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = [];
      this.colors = colors;
      this.animationFrame = null;
      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());
    }

    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles = this.particles.filter(p => this.updateParticle(p));
      this.particles.forEach(p => this.drawParticle(p));
      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(() => this.animate());
      }
    }

    stop() {
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      this.particles = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Confetti System
  class ConfettiSystem extends ParticleSystem {
    createParticle(x, y, vx, vy) {
      return {
        x, y, vx, vy,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        size: Math.random() * 8 + 3,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        alpha: 1,
        gravity: 0.2 + Math.random() * 0.2,
        friction: 0.98,
        life: 1,
        decay: 0.008 + Math.random() * 0.004,
        shape: Math.random() > 0.5 ? "rect" : "circle",
        glowIntensity: Math.random() * 0.5 + 0.5,
      };
    }

    explode() {
      const particleCount = 300;
      const corners = [
        { x: 0, y: 0 }, { x: this.canvas.width, y: 0 },
        { x: 0, y: this.canvas.height }, { x: this.canvas.width, y: this.canvas.height }
      ];
      
      corners.forEach(corner => {
        for (let i = 0; i < particleCount / 4; i++) {
          const angle = Math.atan2(this.canvas.height / 2 - corner.y, this.canvas.width / 2 - corner.x) + (Math.random() - 0.5) * (Math.PI / 2.5);
          const speed = Math.random() * 15 + 8;
          this.particles.push(this.createParticle(corner.x, corner.y, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
      });
      
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 5;
        this.particles.push(this.createParticle(
          this.canvas.width / 2, 
          this.canvas.height / 2, 
          Math.cos(angle) * speed, 
          Math.sin(angle) * speed
        ));
      }
      
      this.animate();
    }

    drawParticle(p) {
      this.ctx.save();
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = p.size * p.glowIntensity * p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      
      if (p.shape === "rect") {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);
      p.rotationSpeed *= 0.99;
      return p.life > 0;
    }
  }

  // Marriage Pop Effects System
  class MarriagePopEffects extends ParticleSystem {
    constructor(canvas, colors) {
      super(canvas, colors);
      this.particleTypes = {
        CONFETTI_RECT: 'confetti_rect',
        CONFETTI_CIRCLE: 'confetti_circle', 
        SPARKLE: 'sparkle'
      };
      
      this.marriageColors = [
        '#FFD700', '#FFC0CB', '#FFFFFF', 
        '#F0E68C', '#DDA0DD', '#FFB6C1'
      ];
      
      this.lastFrameTime = 0;
      this.frameInterval = 1000 / 30;
    }

    celebrationBurst() {
      const burstLocations = [
        { x: this.canvas.width * 0.3, y: this.canvas.height * 0.3 },
        { x: this.canvas.width * 0.7, y: this.canvas.height * 0.3 },
        { x: this.canvas.width * 0.3, y: this.canvas.height * 0.7 },
        { x: this.canvas.width * 0.7, y: this.canvas.height * 0.7 }
      ];

      burstLocations.forEach((location, index) => {
        setTimeout(() => {
          this.createBurstAt(location.x, location.y, 50);
        }, index * 200);
      });

      this.animate();
    }

    createBurstAt(x, y, particleCount) {
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 4;
        const spread = Math.random() * 1.0 + 0.8;
        
        const vx = Math.cos(angle) * speed * spread;
        const vy = Math.sin(angle) * speed * spread - (Math.random() * 4);
        
        this.particles.push(this.createParticle(x, y, vx, vy));
      }
    }

    createParticle(x, y, vx, vy, type = null) {
      const particleType = type || this.getRandomParticleType();
      
      return {
        x, y, vx, vy,
        type: particleType,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        size: this.getParticleSize(particleType),
        color: this.marriageColors[Math.floor(Math.random() * this.marriageColors.length)],
        alpha: 1,
        gravity: this.getParticleGravity(particleType),
        friction: 0.97 + Math.random() * 0.02,
        life: 1,
        decay: 0.006 + Math.random() * 0.006,
        glowIntensity: Math.random() * 0.5 + 0.3,
      };
    }

    getRandomParticleType() {
      const rand = Math.random();
      if (rand < 0.6) return this.particleTypes.CONFETTI_RECT;
      if (rand < 0.9) return this.particleTypes.CONFETTI_CIRCLE;
      return this.particleTypes.SPARKLE;
    }

    getParticleSize(type) {
      const sizeMap = {
        [this.particleTypes.CONFETTI_RECT]: Math.random() * 6 + 3,
        [this.particleTypes.CONFETTI_CIRCLE]: Math.random() * 5 + 2,
        [this.particleTypes.SPARKLE]: Math.random() * 3 + 1
      };
      return sizeMap[type] || 4;
    }

    getParticleGravity(type) {
      const gravityMap = {
        [this.particleTypes.CONFETTI_RECT]: 0.15 + Math.random() * 0.1,
        [this.particleTypes.CONFETTI_CIRCLE]: 0.18 + Math.random() * 0.12,
        [this.particleTypes.SPARKLE]: 0.02 + Math.random() * 0.03
      };
      return gravityMap[type] || 0.15;
    }

    drawParticle(p) {
      this.ctx.save();
      
      if (Math.random() > 0.7) {
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.size * p.glowIntensity * p.alpha;
      }
      
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      
      this.drawParticleShape(p);
      
      this.ctx.restore();
    }

    drawParticleShape(p) {
      const size = p.size;
      
      switch(p.type) {
        case this.particleTypes.CONFETTI_RECT:
          this.ctx.fillRect(-size/2, -size/4, size, size/2);
          break;
          
        case this.particleTypes.CONFETTI_CIRCLE:
          this.ctx.beginPath();
          this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
          this.ctx.fill();
          break;
          
        case this.particleTypes.SPARKLE:
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size/2);
          this.ctx.lineTo(0, size/2);
          this.ctx.moveTo(-size/2, 0);
          this.ctx.lineTo(size/2, 0);
          this.ctx.stroke();
          break;
      }
    }

    updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.rotationSpeed;
      p.rotationSpeed *= 0.99;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);
      
      return p.life > 0 && p.x > -50 && p.x < this.canvas.width + 50 && p.y < this.canvas.height + 50;
    }

    continuousCelebration(duration = 5000) {
      const interval = setInterval(() => {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        
        switch(side) {
          case 0:
            x = Math.random() * this.canvas.width;
            y = -10;
            vx = (Math.random() - 0.5) * 6;
            vy = Math.random() * 5 + 2;
            break;
          case 1:
            x = this.canvas.width + 10;
            y = Math.random() * this.canvas.height;
            vx = -Math.random() * 5 - 2;
            vy = (Math.random() - 0.5) * 6;
            break;
          case 2:
            x = Math.random() * this.canvas.width;
            y = this.canvas.height + 10;
            vx = (Math.random() - 0.5) * 6;
            vy = -Math.random() * 5 - 2;
            break;
          case 3:
            x = -10;
            y = Math.random() * this.canvas.height;
            vx = Math.random() * 5 + 2;
            vy = (Math.random() - 0.5) * 6;
            break;
        }
        
        for (let i = 0; i < 8; i++) {
          this.particles.push(this.createParticle(x, y, vx, vy));
        }
        
      }, 400);

      setTimeout(() => clearInterval(interval), duration);
    }
  }

  // Matrix Rain
  class MatrixRain {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.resizeCanvas();
      this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
      this.fontSize = 14;
      this.columns = Math.floor(this.canvas.width / this.fontSize);
      this.drops = Array(this.columns).fill(0);
      window.addEventListener("resize", () => this.resizeCanvas());
    }

    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    draw() {
      this.ctx.fillStyle = "rgba(0,0,0,0.05)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#00ff00";
      this.ctx.font = `${this.fontSize}px JetBrains Mono, monospace`;
      
      for (let i = 0; i < this.drops.length; i++) {
        const char = this.characters[Math.floor(Math.random() * this.characters.length)];
        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;
        this.ctx.fillText(char, x, y);
        
        if (y > this.canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }
        this.drops[i]++;
      }
    }

    start() {
      const animate = () => {
        this.draw();
        this.animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }

    stop() {
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    }
  }

  // Animation text function
  const animateText = (element) => {
    if (!element) return;
    const text = element.textContent.trim();
    element.innerHTML = '';
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${index * 0.05}s`;
      span.className = 'inline-block opacity-0 animate-[revealChar_1s_forwards]';
      element.appendChild(span);
    });
  };

  // Add terminal line with typing effect
  const addTerminalLine = (lineData, callback) => {
    const line = document.createElement("div");
    line.className = "leading-relaxed my-1";
    
    if (lineData.type === "progress") {
      line.innerHTML = `
        <div class="w-full h-1 bg-gray-700 my-2 rounded-sm overflow-hidden">
          <div class="h-full bg-gradient-to-r from-green-400 to-green-600 w-0 transition-all duration-500 shadow-[0_0_10px_#00ff00]" id="progressFill"></div>
        </div>
      `;
      terminalContentRef.current?.appendChild(line);
      setTimeout(() => {
        const fill = document.getElementById("progressFill");
        if (fill) fill.style.width = "100%";
      }, 100);
      if (callback) setTimeout(callback, 1600);
      return;
    }

    const textToType = lineData.text;
    let currentIndex = 0;
    
    if (lineData.type === "command") {
      line.innerHTML = '<span class="text-green-400">user@aces-dev:~$</span> ';
    } else if (lineData.type === "output") {
      line.innerHTML = '<span class="text-gray-400 ml-5"></span>';
    } else if (lineData.type === "success") {
      line.innerHTML = '<span class="text-green-400 font-bold"></span>';
    }
    
    terminalContentRef.current?.appendChild(line);
    
    const typeInterval = setInterval(() => {
      if (currentIndex < textToType.length) {
        soundSystemRef.current?.playKeyboardSound();
        
        const span = line.querySelector('span');
        if (lineData.type === "command") {
          line.innerHTML = `<span class="text-green-400">user@aces-dev:~$</span> <span class="text-white">${textToType.substring(0, currentIndex + 1)}</span>`;
        } else if (lineData.type === "output") {
          span.textContent = textToType.substring(0, currentIndex + 1);
        } else if (lineData.type === "success") {
          span.textContent = textToType.substring(0, currentIndex + 1);
        }
        
        currentIndex++;
        if (terminalContentRef.current) {
          terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
        }
      } else {
        clearInterval(typeInterval);
        if (lineData.type === "success") {
          setTimeout(() => soundSystemRef.current?.playSuccessSound(), 100);
        }
        if (callback) setTimeout(callback, 800);
      }
    }, 50);
  };

  const startCompilation = async () => {
    if (isLaunched) return;
    setIsLaunched(true);

    // Initialize sound system
    soundSystemRef.current = new SoundSystem();
    await soundSystemRef.current.init();

    const compilationLines = [
      { type: "command", text: "gcc -o ACES main.c -std=c25 -Wall -O2" },
      { type: "output", text: "Compiling main.c..." },
      { type: "progress" },
      { type: "output", text: "Linking libraries..." },
      { type: "output", text: "Optimizing code..." },
      { type: "success", text: "Build successful." },
      { type: "command", text: "./launch_aces" },
      { type: "output", text: "Initializing ACES system..." },
      { type: "output", text: "Loading modules..." },
      { type: "success", text: "ACES system online." },
    ];

    let currentLine = 0;
    const processNextLine = () => {
      if (currentLine < compilationLines.length) {
        addTerminalLine(compilationLines[currentLine], processNextLine);
        currentLine++;
      } else {
        setTimeout(startMatrixEffect, 1000);
      }
    };

    setTimeout(processNextLine, 500);
  };

  const startMatrixEffect = () => {
    // Start matrix effect
    if (matrixCanvasRef.current) {
      matrixCanvasRef.current.style.opacity = "1";
      matrixRainRef.current = new MatrixRain(matrixCanvasRef.current);
      matrixRainRef.current.start();
    }

    // Fade terminal
    if (terminalRef.current) {
      terminalRef.current.style.opacity = "0.1";
      terminalRef.current.style.transform = "scale(0.9)";
    }

    setTimeout(() => {
      // Stop matrix and show logo
      matrixRainRef.current?.stop();
      if (matrixCanvasRef.current) {
        matrixCanvasRef.current.style.opacity = "0";
      }
      if (terminalRef.current) {
        terminalRef.current.style.display = "none";
      }
      
      setShowLogo(true);
      soundSystemRef.current?.playCelebrationSound();

      // Initialize pop effects
      if (popCanvasRef.current) {
        popEffectsRef.current = new MarriagePopEffects(popCanvasRef.current, celebrationColors);
      }

      // Start celebration
      setTimeout(startCelebration, 500);
      setTimeout(() => {
        setShowRedirectNotice(true);
        startCountdown();
      }, 3000);
    }, 3500);
  };

  const startCelebration = () => {
    if (confettiCanvasRef.current && popEffectsRef.current) {
      const confetti = new ConfettiSystem(confettiCanvasRef.current, celebrationColors);
      
      soundSystemRef.current?.playConfettiSound();
      popEffectsRef.current.celebrationBurst();
      popEffectsRef.current.continuousCelebration(7000);
      confetti.explode();

      // Additional bursts
      setTimeout(() => {
        soundSystemRef.current?.playConfettiSound();
        popEffectsRef.current?.celebrationBurst();
        confetti.explode();
      }, 1500);

      setTimeout(() => {
        soundSystemRef.current?.playConfettiSound();
        popEffectsRef.current?.celebrationBurst();
        confetti.explode();
      }, 3000);
    }
  };

  const startCountdown = () => {
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          window.location.href = "https://pvgcoet.ac.in/computer-engineering/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Animated text component
  const AnimatedText = ({ children, className, id }) => {
    const textRef = useRef(null);
    
    useEffect(() => {
      if (showLogo && textRef.current) {
        setTimeout(() => animateText(textRef.current), 100);
      }
    }, [showLogo]);

    return (
      <div ref={textRef} className={className} id={id}>
        {children}
      </div>
    );
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.code === "Space" || e.code === "Enter") && !isLaunched) {
        e.preventDefault();
        startCompilation();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isLaunched]);

  return (
    <div className={`font-mono bg-black text-green-400 overflow-hidden h-screen flex justify-center items-center relative transition-colors duration-1000 ${showLogo ? 'animate-pulse' : ''}`}>
      {/* Terminal */}
      <div
        ref={terminalRef}
        className="w-[90%] max-w-4xl h-[70vh] bg-gray-900 border-2 border-gray-700 rounded-lg p-5 shadow-[0_0_20px_rgba(0,255,0,0.3)] relative z-10 transition-all duration-500"
      >
        <div className="flex items-center mb-5 pb-2 border-b border-gray-700">
          <div className="flex gap-2 mr-4">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="text-sm text-gray-500">Terminal - ACES Development Environment</div>
        </div>
        <div
          ref={terminalContentRef}
          className="h-[calc(100%-50px)] overflow-y-auto relative"
        >
          <div className="leading-relaxed my-1">
            <span className="text-green-400">user@aces-dev:~$</span>
            {!isLaunched && <span className="inline-block bg-green-400 w-2 h-4 animate-pulse ml-1"></span>}
          </div>
          {!isLaunched && (
            <div className="text-center mt-12">
              <button
                onClick={startCompilation}
                className="bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-green-400 text-green-400 py-4 px-8 font-mono text-lg cursor-pointer rounded transition-all duration-300 uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,0,0.3)] hover:bg-green-400/10 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] hover:-translate-y-px"
              >
                Initialize Compilation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="absolute top-0 left-0 w-full h-full z-[5] pointer-events-none">
        <canvas
          ref={matrixCanvasRef}
          className="opacity-0 transition-opacity duration-1000"
        />
        <canvas
          ref={fireworksCanvasRef}
          className="z-20"
        />
        <canvas
          ref={confettiCanvasRef}
          className="z-20"
        />
        <canvas
          ref={popCanvasRef}
          className="z-[22]"
        />
      </div>

      {/* Logo Container */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-15 transition-all duration-1000 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${
          showLogo 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-75'
        }`}
      >
        {/* Logo placeholder - you can replace with actual image */}
        <div className="w-56 h-32 mb-5 mx-auto bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl animate-pulse shadow-[0_0_25px_#c084fc,0_0_50px_#a855f7,0_0_80px_#818cf8]">
          <img src="/images/ACES_Logo_White.png" alt="ACES_logo" />
        </div>
        
        <AnimatedText className="text-2xl mb-6 tracking-wide">
          Welcome to the Inauguration of ACES 2025-26
        </AnimatedText>
        
        <AnimatedText className="text-2xl text-green-400 shadow-[0_0_20px_#00ff00]">
          LAUNCH SUCCESSFUL
        </AnimatedText>
      </div>

      {/* Redirect Notice */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 z-25 transition-opacity duration-500 ${
          showRedirectNotice ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Redirecting to main system in <span className="font-bold">{countdown}</span> seconds...
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        
        @keyframes revealChar {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.5) rotate(15deg); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotate(0deg); 
          }
        }
        
        @keyframes backgroundPulse {
          0%, 100% { background-color: #000; }
          50% { background-color: #11081f; }
        }
        
        .animate-backgroundPulse {
          animation: backgroundPulse 3s ease-in-out infinite;
        }
        
        /* Custom scrollbar for terminal */
        .terminal-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .terminal-content::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        .terminal-content::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        
        .terminal-content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Ensure proper font loading */
        * {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
};

export default ACESInauguration;