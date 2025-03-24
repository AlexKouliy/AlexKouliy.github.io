// LoreSystem.js - Plug-and-play lore management system
export class LoreSystem {
  constructor(config = {}) {
    this.config = {
      ...config,  // Move this BEFORE the defaults so defaults don't override provided values
      dataPath: './data/',  // Default if not provided
      rootSelector: '.central-section',
      searchSelector: '#search-input',
      sidebarSelector: '.sidebar',
      navSelector: '#category-nav',
      searchDebounce: 300,
      minSearchLength: 2,
      debug: true
    };

    this.cache = new Map();
    this.domElements = {};
    this.currentCategory = null;
    this.templates = {
      error: (msg) => `<div class="error-message"><h3>Error</h3><p>${msg}</p></div>`,
      noResults: () => `<div class="no-results"><h3>No Results Found</h3><p>Try adjusting your search terms or exploring the categories.</p></div>`,
      entry: (entry) => {
        try {
          if (!entry || typeof entry !== 'object') {
            this.log('Invalid entry data:', entry);
            return '<div class="error-entry">Invalid entry data</div>';
          }

          const createField = (key, label) => {
            const val = entry[key];
            if (!val) return '';
            const content = Array.isArray(val) ? val.join(', ') : val;
            return `
              <div class="${key}">
                <h5>${label}</h5>
                <p>${content}</p>
              </div>
            `;
          };

          // Generate safe ID from title or use fallback
          let id;
          if (entry.id) {
            id = entry.id;
          } else if (entry.title && typeof entry.title === 'string') {
            id = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          } else {
            id = 'untitled-entry-' + Math.random().toString(36).substr(2, 9);
          }

          // Safely get title or use fallback
          const title = entry.title || '[Untitled Entry]';
          const subtitle = entry.subtitle ? `<div class="subtitle">${entry.subtitle}</div>` : '';
          const designation = createField('designation', 'Designation');
          const content = entry.content ? `<div class="content">${entry.content}</div>` : '<div class="content"><em>No content provided.</em></div>';

          const metaFields = [
            'significance', 'variations', 'teachings', 'artifacts',
            'legacy', 'manifestations', 'phenomena', 'signs', 'cycles',
            'lessons', 'principles', 'metaphors', 'journey_points', 'defining_moment'
          ];

          const metaContent = metaFields.map(field => {
            const label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return createField(field, label);
          }).join('');

          const crossRefs = entry.cross_references ? this.renderCrossReferences(entry.cross_references) : '';

          return `
            <div class="lore-entry" id="${id}">
              <h4>${title}</h4>
              ${subtitle}
              ${designation}
              ${content}
              ${metaContent}
              ${crossRefs}
            </div>
          `;
        } catch (error) {
          this.log('Error rendering entry:', error, entry);
          return `<div class="error-entry">Error rendering entry: ${error.message}</div>`;
        }
      },
      messageToReaders: (msg) => `
        <div class="message-to-readers">
          <h2>${msg.title}</h2>
          <div class="content">${msg.content}</div>
          ${msg.designation ? `<div class="designation">${msg.designation}</div>` : ''}
          ${msg.note ? `<div class="note">${msg.note}</div>` : ''}
        </div>
      `
    };
    
    // Bind the entry template method to ensure 'this' context
    this.templates.entry = this.templates.entry.bind(this);

    this.init().catch(error => {
      console.error('LoreSystem initialization failed:', error);
      this.render(this.templates.error('Failed to initialize the lore system. Check console for details.'));
    });
  }

  log(...args) {
    if (this.config.debug) {
      console.log('[LoreSystem]', ...args);
    }
  }

  async init() {
    try {
      this.log('Initializing LoreSystem...');
      
      // Initialize DOM elements
      await this.initializeDOMElements();
      
      // Load and process data
      await this.loadData();
      
      // Set up event handlers
      this.bindEvents();

      // Show initial content
      await this.showInitialContent();

      this.log('LoreSystem initialized successfully');
      return true;
    } catch (error) {
      this.log('Initialization failed:', error);
      throw error;
    }
  }

  async initializeDOMElements() {
    const selectors = {
      main: this.config.rootSelector,
      search: this.config.searchSelector,
      sidebar: this.config.sidebarSelector,
      nav: this.config.navSelector
    };

    for (const [key, selector] of Object.entries(selectors)) {
      const element = document.querySelector(selector);
      if (element) {
        this.domElements[key] = element;
        this.log(`Found ${key} element:`, selector);
      } else {
        this.log(`Warning: Element not found: ${selector}`);
      }
    }

    if (!this.domElements.main) {
      throw new Error(`Required element not found: ${this.config.rootSelector}`);
    }
  }

  async loadData() {
    try {
      this.log('Loading category data...');
      
      // Initialize cache
      this.cache = new Map();
      
      // If no category paths defined, just initialize empty cache
      if (!this.config.categoryPaths) {
        this.log('No category paths defined, initializing empty cache');
        return true;
      }
      
      // Load each category
      for (const [category, path] of Object.entries(this.config.categoryPaths)) {
        try {
          this.log(`Loading category '${category}' from ${path}`);
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`Failed to load ${category}: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          this.log(`Successfully loaded category '${category}'`);
          
          // Cache the category data
          this.cache.set(category, data);
          
        } catch (error) {
          this.log(`Error loading category '${category}':`, error);
          // Don't fail completely if one category fails to load
          console.error(`Failed to load category '${category}':`, error);
        }
      }
      
      this.log('Finished loading category data');
      return true;
    } catch (error) {
      this.log('Failed to load data:', error);
      throw error;
    }
  }

  buildCache() {
    this.log('Building cache...');
    this.log('Raw lore data:', JSON.stringify(this.loreData, null, 2));
    
    // Cache meta information
    if (this.meta) {
        this.cache.set('meta', this.meta);
        this.log('Cached meta information');
    }

    // Cache all categories
    for (const [categoryId, categoryData] of Object.entries(this.loreData)) {
        // Skip meta information
        if (categoryId === 'meta') continue;

        this.log(`Processing category '${categoryId}'`, JSON.stringify(categoryData, null, 2));

        // Cache category data
        this.cache.set(categoryId, categoryData);
        
        // Cache each section and its entries
        for (const [sectionId, section] of Object.entries(categoryData)) {
            // Skip meta information
            if (sectionId === 'meta') continue;

            this.log(`Processing section '${sectionId}' in category '${categoryId}'`, JSON.stringify(section, null, 2));

            // Cache section data
            const sectionKey = `${categoryId}.${sectionId}`;
            this.cache.set(sectionKey, section);
            
            // Cache entries within section
            if (section.entries) {
                for (const [entryId, entry] of Object.entries(section.entries)) {
                    const entryKey = `${categoryId}.${sectionId}.${entryId}`;
                    this.log(`Caching entry '${entryId}' in section '${sectionId}'`, JSON.stringify(entry, null, 2));
                    
                    this.cache.set(entryKey, {
                        ...entry,
                        sectionId,
                        category: categoryId
                    });
                    
                    // Cache cross-references if they exist
                    if (entry.cross_references) {
                        this.cache.set(`refs.${entryKey}`, entry.cross_references);
                    }
                }
            }
        }
    }
    
    this.log('Cache built successfully');
    this.log('Final cache contents:', Array.from(this.cache.entries()));
  }

  bindEvents() {
    this.log('Binding events...');
    
    // Handle URL changes
    window.addEventListener('hashchange', () => this.handleHashChange());
    
    // Handle category navigation
    document.addEventListener('click', (e) => {
      const crossRef = e.target.closest('a[data-category][data-ref]');
      const categoryLink = e.target.closest('[data-category]');
      
      if (crossRef) {
        e.preventDefault();
        this.handleCrossReferenceClick(crossRef.dataset);
      } else if (categoryLink) {
        e.preventDefault();
        const category = categoryLink.dataset.category;
        window.location.hash = category;
      }
    });

    // Search handler with debounce
    if (this.domElements.search) {
      let debounceTimeout;
      this.domElements.search.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const query = e.target.value;
        if (query.length >= this.config.minSearchLength) {
          debounceTimeout = setTimeout(() => this.search(query), this.config.searchDebounce);
        }
      });
    }

    this.log('Events bound successfully');
  }

  async showInitialContent() {
    this.log('Showing initial content...');
    
    // Check for category in URL hash
    await this.handleHashChange();
    
    // If no category in hash, show message to readers
    if (!this.currentCategory && this.meta?.message_to_readers) {
      this.render(this.templates.messageToReaders(this.meta.message_to_readers));
    }
  }

  async handleHashChange() {
    const category = window.location.hash.slice(1); // Remove the # symbol
    if (category) {
        this.log('URL hash changed to:', category);
        await this.loadCategory(category);
    }
  }

  async loadCategory(category) {
    this.log('Loading category:', category);
    
    try {
        // Update current category
        this.currentCategory = category;
        
        // Build the file path
        const filePath = `${this.config.dataPath}${category}.json`;
        this.log('Attempting to load from:', filePath);
        
        // Load category data if not in cache
        if (!this.cache.has(category)) {
            this.log('Category not in cache, fetching...');
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load category: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            this.log('Received raw data:', data);
            this.cache.set(category, data);
        }

        const rawCategoryData = this.cache.get(category);
        this.log('Raw category data keys:', Object.keys(rawCategoryData));
        
        // Handle nested structure (e.g., {"lore": {"lore": {...}}} or {"history": {...}})
        let categoryData = rawCategoryData[category] || rawCategoryData;
        // Handle double-nested structure (e.g., {"lore": {"lore": {...}}})
        if (categoryData[category]) {
            categoryData = categoryData[category];
        }
        
        this.log('Processed category data keys:', Object.keys(categoryData));
        this.log('Category content:', categoryData);

        if (categoryData) {
            // Generate HTML
            let html = `<div class="category-content">`;
            
            // Add category title and description from meta
            const meta = rawCategoryData.meta || {};
            html += `<h2 class="category-title">${meta.title || this.formatTitle(category)}</h2>`;
            if (meta.description) {
                html += `<p class="category-description">${meta.description}</p>`;
            }

            // Add sections from the category content
            Object.entries(categoryData).forEach(([sectionId, section]) => {
                this.log('Processing section:', sectionId, section);
                // Skip meta section as it's already handled
                if (sectionId === 'meta') return;
                
                if (typeof section === 'object' && section !== null) {
                    // Debug: Log section structure
                    this.log('Section keys:', Object.keys(section));
                    
                    // Handle both direct entries and nested entries
                    const entries = section.entries || {};
                    this.log('Entries found:', Object.keys(entries));
                    
                    html += `
                        <div class="lore-section" id="${sectionId}">
                            <div class="accordion-header" data-section="${sectionId}">
                                <h3>
                                    <span class="material-icons">history_edu</span>
                                    ${section.title || this.formatTitle(sectionId)}
                                </h3>
                                <span class="material-icons">expand_more</span>
                            </div>
                            ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
                            <div class="accordion-content">
                                <div class="entries-container">
                                    ${Object.entries(entries).map(([entryId, entry]) => {
                                        this.log(`Rendering entry: ${entryId}`, entry);
                                        return `
                                            <div class="entry-item" id="${entryId}">
                                                <div class="entry-preview" data-entry="${entryId}">
                                                    <h4>
                                                        <span class="material-icons">article</span>
                                                        ${entry.title}
                                                    </h4>
                                                    <span class="material-icons">open_in_new</span>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            html += `</div>`;
            
            this.log('Generated HTML:', html);
            
            // Render the content
            this.render(html);
            
            // Add event listeners for accordions
            this.initializeAccordions();
            
            // Update active state in navigation
            this.updateActiveNavItem(category);
            
            return true;
        }
    } catch (error) {
        this.log('Error loading category:', error);
        this.render(this.templates.error(`Failed to load category: ${error.message}`));
        return false;
    }
  }

  initializeAccordions() {
    // Section accordions
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.lore-section');
            const content = section.querySelector('.accordion-content');
            const icon = header.querySelector('.material-icons:last-child');
            
            // Toggle active state
            header.classList.toggle('active');
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = '0';
                icon.style.transform = 'rotate(0)';
            }
        });
    });

    // Entry previews - open in panel
    document.querySelectorAll('.entry-preview').forEach(preview => {
        preview.addEventListener('click', () => {
            const entryId = preview.dataset.entry;
            const section = preview.closest('.lore-section');
            const sectionId = section.id;
            
            // Get the cached category data
            const categoryData = this.cache.get(this.currentCategory);
            this.log('Category data:', categoryData);
            
            // Handle nested structure
            let entries;
            if (categoryData[this.currentCategory]) {
                // Double-nested structure
                entries = categoryData[this.currentCategory][sectionId]?.entries;
            } else {
                // Single-nested structure
                entries = categoryData[sectionId]?.entries;
            }
            
            this.log('Looking for entry:', entryId, 'in section:', sectionId);
            this.log('Available entries:', entries);
            
            if (entries && entries[entryId]) {
                const entry = entries[entryId];
                this.log('Found entry:', entry);
                this.showEntryDetail(entry, section.querySelector('h3').textContent.trim());
            } else {
                this.log('Entry not found:', entryId);
                console.error('Entry not found:', entryId);
            }
        });
    });
  }

  formatTitle(key) {
    if (!key || typeof key !== 'string') {
      return '[Unknown]';
    }
    // Convert something_like_this to Something Like This
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  updateActiveNavItem(category) {
    if (!this.domElements.nav) return;
    
    // Remove active class from all items
    const items = this.domElements.nav.querySelectorAll('.panel-item');
    items.forEach(item => item.classList.remove('active'));
    
    // Add active class to current category
    const activeItem = this.domElements.nav.querySelector(`[data-category="${category}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  search(query) {
    this.log('Searching for:', query);
    query = query.toLowerCase();
    const results = [];

    for (const [key, data] of this.cache.entries()) {
      // Skip non-entry items and meta data
      if (!key.includes('.') || key.startsWith('refs.') || key === 'meta') continue;
      
      // Check if this is an entry (has title and content)
      if (data.title && data.content) {
        const matches = 
          data.title.toLowerCase().includes(query) ||
          data.content.toLowerCase().includes(query);

        if (matches) {
          const [category, section] = key.split('.');
          const categoryData = this.cache.get(category);
          
          // Find or create category group in results
          let categoryGroup = results.find(r => r.category === category);
          if (!categoryGroup) {
            categoryGroup = {
              category,
              title: categoryData?.meta?.title || this.formatTitle(category),
              matches: []
            };
            results.push(categoryGroup);
          }
          
          categoryGroup.matches.push({
            ...data,
            section: this.formatTitle(section)
          });
        }
      }
    }

    this.log(`Found ${results.length} results`);
    this.render(results.length ? this.renderSearchResults(results) : this.templates.noResults());
    return results;
  }

  renderSearchResults(results) {
    return `
      <div class="search-results">
        <h2>Search Results</h2>
        ${results.map(result => `
          <div class="result-group">
            <h3>${result.title}</h3>
            <div class="search-entries">
              ${result.matches.map(match => `
                <div class="search-entry">
                  <div class="search-entry-header">
                    <h4>${match.title}</h4>
                    ${match.section ? `<span class="search-entry-section">${match.section}</span>` : ''}
                  </div>
                  ${this.templates.entry(match)}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCrossReferences(refs) {
    if (!refs || typeof refs !== 'object') return '';

    const sections = Object.entries(refs).map(([category, items]) => {
      if (!Array.isArray(items)) return '';
      
      const validItems = items.filter(ref => typeof ref === 'string' && ref.includes('.'));
      
      if (validItems.length === 0) return '';

      return `
        <div class="reference-section">
          <h5>${this.formatTitle(category)}</h5>
          <ul>
            ${validItems.map(ref => {
              const [_, title] = ref.split('.');
              if (!title) return '';
              return `
                <li>
                  <a href="#" data-category="${category}" data-ref="${ref}">
                    ${this.formatTitle(title)}
                  </a>
                </li>
              `;
            }).filter(Boolean).join('')}
          </ul>
        </div>
      `;
    }).filter(Boolean);

    return sections.length ? `
      <div class="cross-references">
        <h5>Related Content</h5>
        ${sections.join('')}
      </div>
    ` : '';
  }

  showEntryDetail(entry, sectionTitle) {
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.entry-detail-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'entry-detail-overlay';
        document.body.appendChild(overlay);
    }

    // Create panel if it doesn't exist
    let panel = document.querySelector('.entry-detail-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'entry-detail-panel';
        document.body.appendChild(panel);
    }

    // Update panel content
    panel.innerHTML = `
        <div class="entry-detail-header">
            <h2>${entry.title}</h2>
            <button class="entry-detail-close">
                <span class="material-icons">close</span>
            </button>
        </div>
        <div class="entry-detail-content">
            <div class="entry-detail-section">
                <h3>Content</h3>
                <div class="entry-detail-main">
                    ${entry.content || '<em>No content available.</em>'}
                </div>
            </div>
            
            ${entry.designation ? `
                <div class="entry-detail-section">
                    <h3>Designation</h3>
                    <div class="entry-detail-main">
                        ${entry.designation}
                    </div>
                </div>
            ` : ''}

            ${entry.significance ? `
                <div class="entry-detail-section">
                    <h3>Significance</h3>
                    <div class="entry-detail-main">
                        ${entry.significance}
                    </div>
                </div>
            ` : ''}

            ${(entry.principles || entry.phenomena) ? `
                <div class="entry-detail-section">
                    <h3>Details</h3>
                    <div class="entry-detail-meta">
                        ${entry.principles ? `
                            <div class="entry-detail-meta-item">
                                <strong>Principles</strong>
                                <p>${Array.isArray(entry.principles) ? entry.principles.join(', ') : entry.principles}</p>
                            </div>
                        ` : ''}
                        
                        ${entry.phenomena ? `
                            <div class="entry-detail-meta-item">
                                <strong>Phenomena</strong>
                                <p>${Array.isArray(entry.phenomena) ? entry.phenomena.join(', ') : entry.phenomena}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${entry.cross_references ? `
                <div class="entry-detail-section">
                    <h3>Related Entries</h3>
                    <div class="cross-references">
                        ${this.renderCrossReferences(entry.cross_references)}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Add close button handler
    panel.querySelector('.entry-detail-close').addEventListener('click', () => {
        this.hideEntryDetail();
    });

    // Add click handler to overlay for closing
    overlay.addEventListener('click', () => {
        this.hideEntryDetail();
    });

    // Add escape key handler
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            this.hideEntryDetail();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Show panel and overlay with animation
    requestAnimationFrame(() => {
        panel.classList.add('active');
        overlay.classList.add('active');
    });
  }

  hideEntryDetail() {
    const panel = document.querySelector('.entry-detail-panel');
    const overlay = document.querySelector('.entry-detail-overlay');
    
    if (panel && overlay) {
        // Hide panel and overlay with animation
        panel.classList.remove('active');
        overlay.classList.remove('active');
    }
  }

  render(content) {
    this.log('Rendering content to:', this.config.rootSelector);
    const mainElement = document.querySelector(this.config.rootSelector);
    if (mainElement) {
        if (content instanceof HTMLElement) {
            this.log('Rendering HTML element');
            mainElement.innerHTML = '';
            mainElement.appendChild(content);
        } else if (typeof content === 'string') {
            this.log('Rendering HTML string');
            mainElement.innerHTML = content;
        } else {
            console.error('Invalid content type for render:', content);
        }
    } else {
        console.error('Main element not found:', this.config.rootSelector);
    }
  }
}