const goSecret = () => window.location.href = "secret.html";

const toggleNav = () => { 
  const nav = document.getElementById("cyberNav"),
        menu = document.querySelector(".menu-toggle");

  if (nav && menu) { 
    nav.classList.toggle("active"); 
    menu.classList.toggle("moved"); 
    menu.setAttribute("aria-expanded", nav.classList.contains("active"));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Theme Persistence & Reset
  const storedTheme = localStorage.getItem("themeColor");
  if (storedTheme) {
    document.documentElement.style.setProperty("--theme-color", storedTheme);
    const ci = document.getElementById("colorIndicator");
    if (ci) ci.style.border = "2px solid " + storedTheme;
    const tp = document.getElementById("themePicker");
    if (tp) tp.value = storedTheme;
  }

  // Toggle Tier Content
  document.querySelectorAll(".tier-title").forEach(title =>
    title.addEventListener("click", e => {
      e.stopPropagation();
      const tier = title.closest(".tier");
      if (tier) tier.classList.toggle("active");
    })
  );
  
  // Accordion Toggle
  document.querySelectorAll(".accordion-header").forEach(header =>
    header.addEventListener("click", e => {
      e.stopPropagation();
      const content = header.nextElementSibling,
            isActive = content.classList.contains("active"),
            accordion = header.closest(".accordion");
      accordion.querySelectorAll(".accordion-content").forEach(c => c.classList.remove("active"));
      if (!isActive) content.classList.add("active");
    })
  );

  // Toggle Settings Panel; exposed globally
  window.toggleSettings = () => {
    const panel = document.getElementById("settingsPanel");
    if (panel) panel.style.display = (!panel.style.display || panel.style.display === "none") ? "block" : "none";
  };

  // Lighten Hex Color Utility
  const lightenColor = (color, percent) => {
    let num = parseInt(color.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? Math.max(0, R) : 255) * 0x10000 + 
                  (G < 255 ? Math.max(0, G) : 255) * 0x100 + 
                  (B < 255 ? Math.max(0, B) : 255))
      .toString(16).slice(1);
  };

  // Update Theme Color & Persist
  const themePicker = document.getElementById("themePicker");
  if (themePicker) {
    themePicker.addEventListener("input", function() {
      const newColor = this.value;
      document.documentElement.style.setProperty("--theme-color", newColor);
      localStorage.setItem("themeColor", newColor);
      document.documentElement.style.setProperty("--nav-hover", lightenColor(newColor, 20));

      const ci = document.getElementById("colorIndicator");
      if (ci) {
        ci.style.border = "2px solid " + newColor;

        // Remove existing handler
        ci.removeEventListener("click", goSecret);

        if (newColor.toLowerCase() === "#ffffff") {
          document.body.setAttribute("data-theme", "white");
          ci.style.cursor = "pointer";
          ci.addEventListener("click", goSecret);
        } else {
          document.body.removeAttribute("data-theme");
          ci.style.cursor = "default";
        }
      }

      if (window.updateParticleColor) window.updateParticleColor(newColor);
    });

    // Theme presets
    document.querySelectorAll("#themePresets .preset").forEach(swatch => {
      swatch.addEventListener("click", function() {
        const newColor = this.dataset.color;
        document.documentElement.style.setProperty("--theme-color", newColor);
        localStorage.setItem("themeColor", newColor);
        document.documentElement.style.setProperty("--nav-hover", lightenColor(newColor, 20));

        const ci = document.getElementById("colorIndicator");
        if (ci) {
          ci.style.border = "2px solid " + newColor;

          ci.removeEventListener("click", goSecret);

          if (newColor.toLowerCase() === "#ffffff") {
            document.body.setAttribute("data-theme", "white");
            ci.style.cursor = "pointer";
            ci.addEventListener("click", goSecret);
          } else {
            document.body.removeAttribute("data-theme");
            ci.style.cursor = "default";
          }
        }

        if (themePicker) themePicker.value = newColor;
        if (window.updateParticleColor) window.updateParticleColor(newColor);
      });
    });
  }

  // Scroll Navigation
  const updateActiveNavLink = () => {
    const tiers = [...document.querySelectorAll(".tier[id]")],
          navLinks = document.querySelectorAll(".nav-bar a, .tier-nav a");
    let currentActive = null;

    tiers.forEach(t => {
      const rect = t.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight / 2) currentActive = t;
    });

    navLinks.forEach(link => link.classList.remove("active"));

    if (currentActive) {
      const aid = currentActive.getAttribute("id");
      navLinks.forEach(link => { 
        if (link.getAttribute("href") === "#" + aid) link.classList.add("active"); 
      });
    }
  };

  document.addEventListener("scroll", updateActiveNavLink);
  updateActiveNavLink();

  // Smooth scroll links
  document.querySelectorAll(".nav-bar a, .tier-nav a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      document.querySelectorAll(".nav-bar a, .tier-nav a").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Icon Tilt Effect
  document.querySelectorAll('.project-card, .project-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            centerX = rect.width / 2,
            centerY = rect.height / 2;

      card.style.setProperty('--mouse-x', `${(centerX - x) / 10}deg`);
      card.style.setProperty('--mouse-y', `${(y - centerY) / 10}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', '0deg');
      card.style.setProperty('--mouse-y', '0deg');
    });
  });
});

// Theme presets object
const themePresets = {
  'scarab': '#8df33f',
  'neon': '#00ffff',
  'purple': '#9d4edd',
  'orange': '#ff9e00',
  'pink': '#ff2d6d'
};
