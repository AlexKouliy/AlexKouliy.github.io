import { LoreSystem } from './js/LoreSystem.js';

// Initialize the lore system when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Codex] DOM Content Loaded');
    
    // Configure the lore system
    const config = {
        // Paths
        dataPath: './data/',  // Base path for JSON files
        
        // Selectors (matching our HTML)
        rootSelector: '.central-section',
        searchSelector: '#search-input',
        sidebarSelector: '.sidebar',
        navSelector: '#category-nav',
        
        // Search behavior
        searchDebounce: 300,
        minSearchLength: 2,
        
        // Enable debugging
        debug: true,
        
        // Theme from body attribute
        theme: document.body.dataset.theme || 'dark'
    };

    // Create and initialize the lore system
    try {
        console.log('[Codex] Initializing LoreSystem...');
        const loreSystem = new LoreSystem(config);
        
        // Add click handlers for navigation
        document.querySelectorAll('.panel-item').forEach(item => {
            console.log('[Codex] Adding click handler for:', item.dataset.category);
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const category = item.dataset.category;
                console.log('[Codex] Category clicked:', category);
                if (category) {
                    // Update URL hash and load category
                    window.location.hash = category;
                    loreSystem.loadCategory(category);
                }
            });
        });

        // Handle initial URL hash if present
        const initialCategory = window.location.hash.slice(1);
        if (initialCategory) {
            console.log('[Codex] Loading initial category:', initialCategory);
            loreSystem.loadCategory(initialCategory);
        }

        // Export loreSystem to window for debugging
        window.loreSystem = loreSystem;
        
    } catch (error) {
        console.error('[Codex] Failed to initialize LoreSystem:', error);
    }
});