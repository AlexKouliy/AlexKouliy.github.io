class ParticleSystem {
  constructor(canvasId = 'particleCanvas', options = {}) {
    this.canvas = document.getElementById(canvasId); if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.options = {
      particleCount: window.innerWidth < 768 ? 50 : 100,
      baseSize: window.innerWidth < 768 ? 1.5 : 2,
      baseSpeed: window.innerWidth < 768 ? 1 : 1.5,
      baseOpacity: window.innerWidth < 768 ? 0.5 : 0.7,
      color: getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#3CDB57',
      enableLinks: true,
      linkDistance: window.innerWidth < 768 ? 150 : 200,
      linkOpacity: window.innerWidth < 768 ? 0.2 : 0.25,
      mouseForce: 1.5,
      mouseRadius: window.innerWidth < 768 ? 200 : 300,
      ...options
    };
    this.particles = [];
    this.mouse = { x: null, y: null, radius: this.options.mouseRadius, force: this.options.mouseForce };
    this.setupEventListeners();
    this.resize();
    this.init();
    this.animate();
  }
  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    document.addEventListener('mouseleave', () => { this.mouse.x = this.mouse.y = null; });
    document.addEventListener('touchstart', e => { e.preventDefault(); this.mouse.x = e.touches[0].clientX; this.mouse.y = e.touches[0].clientY; }, { passive: false });
    document.addEventListener('touchmove', e => { e.preventDefault(); this.mouse.x = e.touches[0].clientX; this.mouse.y = e.touches[0].clientY; }, { passive: false });
    document.addEventListener('touchend', () => { this.mouse.x = this.mouse.y = null; });
  }
  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.particles = []; this.init();
  }
  init() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * this.options.baseSize + 1,
        speedX: Math.random() * this.options.baseSpeed - this.options.baseSpeed / 2,
        speedY: Math.random() * this.options.baseSpeed - this.options.baseSpeed / 2,
        baseSpeedX: Math.random() * this.options.baseSpeed - this.options.baseSpeed / 2,
        baseSpeedY: Math.random() * this.options.baseSpeed - this.options.baseSpeed / 2,
        opacity: Math.random() * this.options.baseOpacity + 0.2,
        fadeSpeed: 0.005 + Math.random() * 0.01
      });
    }
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.options.enableLinks) this.drawLinks();
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.options.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  drawLinks() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x,
              dy = this.particles[i].y - this.particles[j].y,
              distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.options.linkDistance) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.options.color;
          this.ctx.globalAlpha = this.options.linkOpacity * (1 - distance / this.options.linkDistance);
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
  update() {
    this.particles.forEach(p => {
      p.speedX = p.baseSpeedX; p.speedY = p.baseSpeedY;
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y,
              distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.mouse.radius) {
          const angle = Math.atan2(dy, dx),
                force = (this.mouse.radius - distance) / this.mouse.radius;
          p.speedX -= Math.cos(angle) * force * this.mouse.force * 3;
          p.speedY -= Math.sin(angle) * force * this.mouse.force * 3;
          p.speedX += (Math.random() - 0.5) * force * 2;
          p.speedY += (Math.random() - 0.5) * force * 2;
          const swirl = 1.0;
          p.speedX += -dy / distance * force * swirl;
          p.speedY += dx / distance * force * swirl;
        }
      }
      p.x += p.speedX; p.y += p.speedY;
      p.speedX *= 0.98; p.speedY *= 0.98;
      p.opacity += p.fadeSpeed;
      if (p.opacity >= 1 || p.opacity <= 0.2) p.fadeSpeed = -p.fadeSpeed;
      if (p.x > this.canvas.width) p.x = 0; if (p.x < 0) p.x = this.canvas.width;
      if (p.y > this.canvas.height) p.y = 0; if (p.y < 0) p.y = this.canvas.height;
    });
  }
  animate() { this.update(); this.draw(); requestAnimationFrame(() => this.animate()); }
}

// Page-specific particle configurations
const pageConfigs = {
  'index.html': {
    particleCount: window.innerWidth < 768 ? 50 : 100,
    baseSize: window.innerWidth < 768 ? 1.5 : 2,
    baseSpeed: window.innerWidth < 768 ? 1 : 1.5,
    baseOpacity: window.innerWidth < 768 ? 0.5 : 0.7,
    enableLinks: true,
    linkDistance: window.innerWidth < 768 ? 150 : 200,
    linkOpacity: window.innerWidth < 768 ? 0.2 : 0.25,
    mouseForce: 0, // No mouse interaction on index
    mouseRadius: 0
  },
  'about.html': {
    particleCount: window.innerWidth < 768 ? 40 : 80,
    baseSize: window.innerWidth < 768 ? 2 : 2.5,
    baseSpeed: window.innerWidth < 768 ? 0.8 : 1.2,
    baseOpacity: window.innerWidth < 768 ? 0.4 : 0.6,
    enableLinks: true,
    linkDistance: window.innerWidth < 768 ? 120 : 180,
    linkOpacity: window.innerWidth < 768 ? 0.15 : 0.2,
    mouseForce: 0.5,
    mouseRadius: 150
  },
  'contact.html': {
    particleCount: window.innerWidth < 768 ? 60 : 120,
    baseSize: window.innerWidth < 768 ? 1.8 : 2.2,
    baseSpeed: window.innerWidth < 768 ? 1.2 : 1.8,
    baseOpacity: window.innerWidth < 768 ? 0.6 : 0.8,
    enableLinks: true,
    linkDistance: window.innerWidth < 768 ? 180 : 250,
    linkOpacity: window.innerWidth < 768 ? 0.25 : 0.35,
    mouseForce: 1.5,
    mouseRadius: 250
  },
  'projectlist.html': {
    particleCount: window.innerWidth < 768 ? 75 : 150,
    baseSize: window.innerWidth < 768 ? 2 : 2.5,
    baseSpeed: window.innerWidth < 768 ? 1.5 : 2,
    baseOpacity: window.innerWidth < 768 ? 0.7 : 0.9,
    enableLinks: true,
    linkDistance: window.innerWidth < 768 ? 200 : 300,
    linkOpacity: window.innerWidth < 768 ? 0.3 : 0.4,
    mouseForce: 2,
    mouseRadius: 300
  },
  'secret.html': {
    particleCount: window.innerWidth < 768 ? 150 : 300, // More particles for denser network
    baseSize: window.innerWidth < 768 ? 1.5 : 2,
    baseSpeed: window.innerWidth < 768 ? 2 : 2.5,
    baseOpacity: window.innerWidth < 768 ? 0.6 : 0.8,
    enableLinks: true,
    linkDistance: window.innerWidth < 768 ? 80 : 120, // Reduced link distance for denser connections
    linkOpacity: window.innerWidth < 768 ? 0.4 : 0.5, // Increased link opacity for better visibility
    mouseForce: 2.5,
    mouseRadius: 350
  }
};

// Update particle color when theme changes
window.updateParticleColor = (color) => {
  const canvas = document.getElementById('particleCanvas');
  if (canvas && canvas.particleSystem) {
    canvas.particleSystem.options.color = color;
  }
};

// Initialize particles with page-specific configurations
const initParticles = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const baseOptions = {
    color: getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#3CDB57',
    ...(pageConfigs[currentPage] || pageConfigs['index.html'])
  };

  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    canvas.particleSystem = new ParticleSystem('particleCanvas', baseOptions);
  }
};

// Initialize particles on page load
document.addEventListener('DOMContentLoaded', initParticles);

const particleSettings = {
  particles: {
    number: { value: window.innerWidth < 768 ? 30 : 50, density: { enable: true, value_area: window.innerWidth < 768 ? 800 : 1000 } },
    color: { value: "#8df33f" },
    shape: { type: "circle" },
    opacity: { value: window.innerWidth < 768 ? 0.3 : 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
    size: { value: window.innerWidth < 768 ? 2 : 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
    line_linked: { enable: true, distance: window.innerWidth < 768 ? 100 : 150, color: "#8df33f", opacity: window.innerWidth < 768 ? 0.2 : 0.3, width: 1 },
    move: { enable: true, speed: window.innerWidth < 768 ? 1 : 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false, attract: { enable: true, rotateX: 600, rotateY: 1200 } }
  },
  interactivity: {
    detect_on: "canvas",
    events: { onhover: { enable: true, mode: window.innerWidth < 768 ? "grab" : "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
    modes: { grab: { distance: window.innerWidth < 768 ? 100 : 150, line_linked: { opacity: 0.5 } }, repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
};
