document.addEventListener("DOMContentLoaded", function() {
  // Theme Persistence & Reset
  const storedTheme = localStorage.getItem("themeColor");
  if(storedTheme) {
    document.documentElement.style.setProperty("--theme-color", storedTheme);
    const colorIndicator = document.getElementById("colorIndicator");
    if(colorIndicator) colorIndicator.style.border = "2px solid " + storedTheme;
    const themePicker = document.getElementById("themePicker");
    if(themePicker) themePicker.value = storedTheme;
  }
  window.addEventListener("beforeunload", () => localStorage.removeItem("themeColor"));

  // Sliding Doors Overlay
  const openButton = document.getElementById("openButton");
  if(openButton) {
    openButton.addEventListener("click", function() {
      const container = document.getElementById("container");
      if(container) {
        container.classList.add("open", "fade-out");
        setTimeout(() => { container.style.display = "none"; }, 1000);
      }
    });
  }

  // Navigate to Secret Page
  function goToSecretPage() { window.location.href = "secret.html"; }

  // Global Toggle Navigation
  function toggleNav() {
    const nav = document.getElementById("cyberNav"),
          menu = document.querySelector(".menu-toggle");
    if(nav && menu) {
      nav.classList.toggle("active");
      menu.classList.toggle("moved");
    }
  }
  window.toggleNav = toggleNav;

  // Toggle Tier Content
  document.querySelectorAll(".tier-title").forEach(title => {
    title.addEventListener("click", function(e) {
      e.stopPropagation();
      const tier = this.closest(".tier");
      if(tier) tier.classList.toggle("active");
    });
  });

  // Accordion Toggle
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", function(e) {
      e.stopPropagation();
      const content = this.nextElementSibling,
            isActive = content.classList.contains("active"),
            accordion = this.closest(".accordion");
      accordion.querySelectorAll(".accordion-content").forEach(c => c.classList.remove("active"));
      if(!isActive) content.classList.add("active");
    });
  });

  // Toggle Settings Panel
  function toggleSettings() {
    const panel = document.getElementById("settingsPanel");
    if(panel) panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
  }
  window.toggleSettings = toggleSettings;

  // Lighten Hex Color Utility
  function lightenColor(color, percent) {
    let num = parseInt(color.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
  }

  // Update Theme Color & Persist
  const themePicker = document.getElementById("themePicker");
  if(themePicker) {
    themePicker.addEventListener("input", function() {
      const newColor = this.value;
      document.documentElement.style.setProperty("--theme-color", newColor);
      localStorage.setItem("themeColor", newColor);
      document.documentElement.style.setProperty("--nav-hover", lightenColor(newColor, 20));
      const colorIndicator = document.getElementById("colorIndicator");
      if(colorIndicator) {
        colorIndicator.style.border = "2px solid " + newColor;
        if(newColor.toLowerCase() === "#ffffff") {
          colorIndicator.style.cursor = "pointer";
          colorIndicator.addEventListener("click", goToSecretPage);
        } else {
          colorIndicator.style.cursor = "default";
          colorIndicator.removeEventListener("click", goToSecretPage);
        }
      }
    });
    themePicker.addEventListener("change", function() {
      const settingsPanel = document.getElementById("settingsPanel");
      if(settingsPanel) settingsPanel.style.display = "none";
    });
    document.querySelectorAll("#themePresets .preset").forEach(swatch => {
      swatch.addEventListener("click", function() {
        const newColor = this.dataset.color;
        document.documentElement.style.setProperty("--theme-color", newColor);
        localStorage.setItem("themeColor", newColor);
        document.documentElement.style.setProperty("--nav-hover", lightenColor(newColor, 20));
        const colorIndicator = document.getElementById("colorIndicator");
        if(colorIndicator) {
          colorIndicator.style.border = "2px solid " + newColor;
          if(newColor.toLowerCase() === "#ffffff") {
            colorIndicator.style.cursor = "pointer";
            colorIndicator.addEventListener("click", goToSecretPage);
          } else {
            colorIndicator.style.cursor = "default";
            colorIndicator.removeEventListener("click", goToSecretPage);
          }
        }
        const themePicker = document.getElementById("themePicker");
        if(themePicker) themePicker.value = newColor;
      });
    });
  }

  // Scroll Navigation: Highlight Active Tier
  function updateActiveNavLink() {
    const tiers = Array.from(document.querySelectorAll(".tier[id]")),
          navLinks = document.querySelectorAll(".nav-bar a, .tier-nav a");
    let currentActive = null;
    tiers.forEach(t => {
      const rect = t.getBoundingClientRect();
      if(rect.top >= 0 && rect.top < window.innerHeight / 2) currentActive = t;
    });
    navLinks.forEach(link => link.classList.remove("active"));
    if(currentActive) {
      const activeId = currentActive.getAttribute("id");
      navLinks.forEach(link => { if(link.getAttribute("href") === "#" + activeId) link.classList.add("active"); });
    }
  }
  document.addEventListener("scroll", updateActiveNavLink);
  updateActiveNavLink();

  // Smooth Scroll for Nav Links
  document.querySelectorAll(".nav-bar a, .tier-nav a").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      document.querySelectorAll(".nav-bar a, .tier-nav a").forEach(l => l.classList.remove("active"));
      this.classList.add("active");
      const target = document.querySelector(this.getAttribute("href"));
      if(target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Particle System
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = [];
      this.particleCount = 50;
      this.init();
      this.animate();
    }
    init() {
      this.resize();
      window.addEventListener("resize", () => this.resize());
      for(let i = 0; i < this.particleCount; i++) {
        this.particles.push(this.createParticle());
      }
    }
    resize() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
    }
    createParticle() {
      return {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5,
        fadeSpeed: 0.005 + Math.random() * 0.01
      };
    }
    updateParticle(p) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.fadeSpeed;
      if(p.opacity >= 1 || p.opacity <= 0) p.fadeSpeed = -p.fadeSpeed;
      if(p.x < 0) p.x = this.canvas.width;
      if(p.x > this.canvas.width) p.x = 0;
      if(p.y < 0) p.y = this.canvas.height;
      if(p.y > this.canvas.height) p.y = 0;
    }
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(141,243,63,${p.opacity})`;
        this.ctx.fill();
        this.updateParticle(p);
      });
    }
    animate() { this.draw(); requestAnimationFrame(() => this.animate()); }
  }

  function initParticleBackgrounds() {
    document.querySelectorAll(".tier").forEach(tier => {
      let canvas = document.createElement("canvas");
      canvas.classList.add("particle-canvas");
      tier.insertBefore(canvas, tier.firstChild);
      new ParticleSystem(canvas);
    });
  }
  initParticleBackgrounds();
});
