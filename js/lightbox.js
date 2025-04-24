// Lightbox Class
class Lightbox {
  constructor() {
    this.lightbox = document.querySelector('.lightbox');
    this.content = document.querySelector('.lightbox-content');
    this.closeBtn = document.querySelector('.close-lightbox');
    this.prevBtn = document.querySelector('.prev-project');
    this.nextBtn = document.querySelector('.next-project');
    this.carousel = document.querySelector('.lightbox-carousel');
    this.carouselPrev = document.querySelector('.carousel-prev');
    this.carouselNext = document.querySelector('.carousel-next');
    this.indicators = document.querySelector('.carousel-indicators');
    this.isOpen = false;
    this.currentProject = null;
    this.currentMediaIndex = 0;
    this.projects = [...document.querySelectorAll('.project-item')];
    this.projectData = {
      "access-ability": {
        title: "Access Ability",
        description: "Neurodiversity resources and tools for accessibility",
        media: [
          { type: "image", src: "img/aa_ad.webp", alt: "Access Ability Advertisement" },
          { type: "image", src: "img/aa_icon.svg", alt: "Access Ability Logo" },
          { type: "image", src: "img/aa_site.webp", alt: "Access Ability Website" },
          { type: "image", src: "img/aa_style.webp", alt: "Access Ability Style Guide" },
          { type: "youtube", src: "https://www.youtube.com/embed/BGgB-V616p0", alt: "Access Ability Demo" }
        ],
        overview: "A comprehensive platform providing resources and tools for neurodiverse individuals, focusing on accessibility and inclusion.",
        description: "A platform that combines innovative design with accessibility features to create an inclusive digital environment for neurodiverse users.",
        rationale: "Bridging the gap between technology and accessibility.",
        features: "Customizable interface, assistive tools, educational resources, community support, progress tracking.",
        link: "access-ability.html"
      },
      "path-ancients": {
        title: "Path of the Ancients",
        description: "Lore-rich card game with ancient themes",
        media: [
          { type: "image", src: "img/pota_posters.webp", alt: "Game Posters" },
          { type: "image", src: "img/pota_cards.webp", alt: "Path of the Ancients Cards" },
          { type: "image", src: "img/pota_aotf_logo.webp", alt: "Age of the Fallen Logo" },
          { type: "image", src: "img/pota_arena.webp", alt: "Arena Battle Scene" },
          { type: "image", src: "img/pota_lorecard.webp", alt: "Lore Card Design" },
          { type: "image", src: "img/path_icon.svg", alt: "Path of the Ancients Logo" },
          { type: "youtube", src: "https://www.youtube.com/embed/Bj0HBJoYjEw", alt: "Gameplay Demo" }
        ],
        overview: "An immersive PvPvE card game that combines ancient mythology with strategic gameplay.",
        description: "A strategic card game weaving ancient mythologies with modern mechanics.",
        rationale: "Engaging players with ancient cultures via strategic gameplay.",
        features: "Unique card mechanics, rich lore system, strategic gameplay, stunning visuals.",
        link: "path-ancients.html"
      },
      "unified-color": {
        title: "Unified Science of Color",
        description: "Interactive color theory exploration tool",
        media: [
          { type: "image", src: "img/usc1.webp", alt: "Color Theory Cover" },
          { type: "image", src: "img/usc2.webp", alt: "Color Theory Visualization" },
          { type: "image", src: "img/usc3.webp", alt: "Color Theory Application" },
          { type: "image", src: "img/usc_icon.svg", alt: "Unified Science of Color Logo" }
        ],
        overview: "An interactive platform and publication exploring the science and psychology of color.",
        description: "A comprehensive tool for understanding color theory and application in design.",
        rationale: "Bridging scientific color understanding with practical design.",
        features: "Interactive color wheel, perception tests, color harmony tools, educational resources.",
        link: "unified-color.html"
      },
      "tectonic": {
        title: "TecTonic",
        description: "Energy drink branding and marketing",
        media: [
          { type: "image", src: "img/tt_ad.webp", alt: "TecTonic Advertisement" },
          { type: "image", src: "img/tt_app.webp", alt: "TecTonic App Interface" },
          { type: "image", src: "img/tt_icon.svg", alt: "TecTonic Logo" },
          { type: "image", src: "img/tt5_8.webp", alt: "TecTonic Design 1" },
          { type: "image", src: "img/tt8_6.webp", alt: "TecTonic Design 2" },
          { type: "image", src: "img/tt9_5.webp", alt: "TecTonic Design 3" },
          { type: "youtube", src: "https://www.youtube.com/embed/cYDcuPco9hU", alt: "TecTonic Advertisement" }
        ],
        overview: "A bold energy drink brand that fuses cutting-edge design and marketing strategies.",
        description: "Modern energy drink brand emphasizing sustainability and design.",
        rationale: "To stand out in a crowded market while promoting sustainability.",
        features: "Unique branding, sustainable packaging, innovative marketing, community engagement.",
        link: "tectonic.html"
      },
      "nulltech-apparel": {
        title: "Nulltech Apparel",
        description: "Symbolic clothing line with tech-inspired designs",
        media: [
          { type: "image", src: "img/nt_hood.webp", alt: "Nulltech Hoodie" },
          { type: "image", src: "img/nt_board.webp", alt: "Nulltech Design Board" },
          { type: "image", src: "img/nt_ink.webp", alt: "Nulltech Ink Design" },
          { type: "image", src: "img/nt_usb.webp", alt: "Nulltech USB Drive" },
          { type: "image", src: "img/nt_cap.webp", alt: "Nulltech Cap" },
          { type: "image", src: "img/nt_case.webp", alt: "Nulltech Phone Case" },
          { type: "image", src: "img/nt_scarab_w.svg", alt: "Nulltech Logo" },
          { type: "youtube", src: "https://www.youtube.com/embed/rJelwOHz8MY", alt: "Nulltech Apparel Showcase" }
        ],
        overview: "A futuristic clothing line blending tech-inspired designs with symbolic elements.",
        description: "Merging technology, symbolism, and fashion into wearable art.",
        rationale: "Expressing the intersection of tech, art, and personal identity.",
        features: "Unique designs, high-quality materials, symbolic elements, tech-inspired aesthetics.",
        link: "nulltech-apparel.html"
      }
    };
    this.init();
  }

  init() {
    if (!this.lightbox) return;
    
    this.closeBtn.addEventListener('click', () => this.closeLightbox());
    this.lightbox.addEventListener('click', e => {
      if (e.target === this.lightbox) this.closeLightbox();
    });
    
    if (this.prevBtn && this.nextBtn) {
      this.prevBtn.addEventListener('click', () => this.navigateProjects('prev'));
      this.nextBtn.addEventListener('click', () => this.navigateProjects('next'));
    }
    
    if (this.carouselPrev && this.carouselNext) {
      this.carouselPrev.addEventListener('click', () => this.navigateMedia('prev'));
      this.carouselNext.addEventListener('click', () => this.navigateMedia('next'));
    }
    
    document.addEventListener('keydown', e => {
      if (!this.isOpen) return;
      switch(e.key) {
        case 'Escape': this.closeLightbox(); break;
        case 'ArrowLeft': this.navigateMedia('prev'); break;
        case 'ArrowRight': this.navigateMedia('next'); break;
      }
    });

    // Add accordion functionality
    this.initAccordion();
  }

  initAccordion() {
    document.querySelectorAll('.lightbox-accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const currentItem = header.parentElement;
        const allItems = document.querySelectorAll('.lightbox-accordion-item');
        
        // Close all other items
        allItems.forEach(item => {
          if (item !== currentItem && item.classList.contains('active')) {
            item.classList.remove('active');
          }
        });
        
        // Toggle current item
        currentItem.classList.toggle('active');
      });
    });
  }

  openLightbox(projectId) {
    if (!this.lightbox || !this.projectData[projectId]) return;
    
    this.currentProject = projectId;
    this.currentMediaIndex = 0;
    const project = this.projectData[projectId];
    
    // Update content
    document.querySelector('.lightbox-title').textContent = project.title;
    document.querySelector('.lightbox-description').textContent = project.description;
    
    // Create accordion items
    const accordion = document.querySelector('.lightbox-accordion');
    accordion.innerHTML = `
      <div class="lightbox-accordion-item">
        <button class="lightbox-accordion-header">Overview</button>
        <div class="lightbox-accordion-content">
          <div class="overview-content">${project.overview}</div>
        </div>
      </div>
      <div class="lightbox-accordion-item">
        <button class="lightbox-accordion-header">Description</button>
        <div class="lightbox-accordion-content">
          <div class="description-content">${project.description}</div>
        </div>
      </div>
      <div class="lightbox-accordion-item">
        <button class="lightbox-accordion-header">Rationale</button>
        <div class="lightbox-accordion-content">
          <div class="rationale-content">${project.rationale}</div>
        </div>
      </div>
      <div class="lightbox-accordion-item">
        <button class="lightbox-accordion-header">Key Features</button>
        <div class="lightbox-accordion-content">
          <div class="features-content">${project.features}</div>
        </div>
      </div>
    `;
    
    // Add project links
    const linksContainer = document.querySelector('.lightbox-links');
    linksContainer.innerHTML = `
      <a href="${project.link}" class="lightbox-link">See Full Project →</a>
    `;
    
    // Reinitialize accordion functionality
    this.initAccordion();
    
    // Clear and update carousel
    this.carousel.innerHTML = '';
    this.indicators.innerHTML = '';
    
    project.media.forEach((media, index) => {
      const item = document.createElement('div');
      item.className = `carousel-item${index === 0 ? ' active' : ''}`;
      
      if (media.type === 'youtube') {
        const iframe = document.createElement('iframe');
        iframe.src = media.src;
        iframe.title = media.alt;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        item.appendChild(iframe);
      } else {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.alt;
        img.loading = 'lazy';
        item.appendChild(img);
      }
      
      this.carousel.appendChild(item);
      
      const indicator = document.createElement('button');
      indicator.className = `carousel-indicator${index === 0 ? ' active' : ''}`;
      indicator.addEventListener('click', () => this.goToMedia(index));
      this.indicators.appendChild(indicator);
    });
    
    // Show lightbox
    this.lightbox.style.display = 'flex';
    setTimeout(() => {
      this.lightbox.classList.add('active');
      this.content.style.transform = 'scale(1)';
      this.content.style.opacity = '1';
    }, 10);
    
    this.isOpen = true;
  }

  closeLightbox() {
    if (!this.lightbox) return;
    
    this.content.style.transform = 'scale(0.9)';
    this.content.style.opacity = '0';
    this.lightbox.classList.remove('active');
    
    setTimeout(() => {
      this.lightbox.style.display = 'none';
      // Stop all videos
      this.carousel.querySelectorAll('iframe').forEach(iframe => {
        iframe.src = iframe.src;
      });
    }, 300);
    
    this.isOpen = false;
  }

  navigateMedia(direction) {
    if (!this.carousel || !this.projectData[this.currentProject]) return;
    
    const mediaCount = this.projectData[this.currentProject].media.length;
    const items = this.carousel.querySelectorAll('.carousel-item');
    const indicators = this.indicators.querySelectorAll('.carousel-indicator');
    
    items[this.currentMediaIndex].classList.remove('active');
    indicators[this.currentMediaIndex].classList.remove('active');
    
    if (direction === 'next') {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % mediaCount;
    } else {
      this.currentMediaIndex = (this.currentMediaIndex - 1 + mediaCount) % mediaCount;
    }
    
    items[this.currentMediaIndex].classList.add('active');
    indicators[this.currentMediaIndex].classList.add('active');
  }

  navigateProjects(direction) {
    if (!this.currentProject) return;
    
    const currentIndex = this.projects.findIndex(p => p.dataset.project === this.currentProject);
    let nextIndex;
    
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % this.projects.length;
    } else {
      nextIndex = (currentIndex - 1 + this.projects.length) % this.projects.length;
    }
    
    this.openLightbox(this.projects[nextIndex].dataset.project);
  }

  goToMedia(index) {
    if (!this.carousel || !this.projectData[this.currentProject]) return;
    
    const items = this.carousel.querySelectorAll('.carousel-item');
    const indicators = this.indicators.querySelectorAll('.carousel-indicator');
    
    items[this.currentMediaIndex].classList.remove('active');
    indicators[this.currentMediaIndex].classList.remove('active');
    
    this.currentMediaIndex = index;
    
    items[this.currentMediaIndex].classList.add('active');
    indicators[this.currentMediaIndex].classList.add('active');
  }
}

// Initialize Lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = new Lightbox();
  
  // Add click handlers to project cards
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('click', () => lightbox.openLightbox(card.dataset.project));
  });
}); 
