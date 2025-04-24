// Modal functionality for deck info
const modal = document.getElementById('deckInfoModal');
const deckInfos = document.querySelectorAll('.deck-info');

// Open modal and show specific deck info
function openDeckInfo(deckType) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    
    // Hide all deck info sections first
    deckInfos.forEach(info => info.style.display = 'none');
    
    // Show the selected deck info
    const selectedInfo = document.getElementById(`${deckType}-info`);
    if (selectedInfo) {
        selectedInfo.style.display = 'block';
    }

    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
}

// Close modal
function closeDeckInfo() {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle escape key press
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeDeckInfo();
    }
}

// Close modal when clicking outside
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeDeckInfo();
    }
});

// Prevent modal content clicks from closing the modal
document.querySelector('.modal-content')?.addEventListener('click', (event) => {
    event.stopPropagation();
});

// Accordion functionality
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const allHeaders = document.querySelectorAll('.accordion-header');
    const allContents = document.querySelectorAll('.accordion-content');
    
    // Close all accordions
    allHeaders.forEach(h => h.classList.remove('active'));
    allContents.forEach(c => {
        c.classList.remove('active');
        c.style.maxHeight = null;
    });

    // Open clicked accordion
    header.classList.add('active');
    content.classList.add('active');
    content.style.maxHeight = content.scrollHeight + "px";
}

// Initialize accordions
document.addEventListener('DOMContentLoaded', () => {
    // Add click listeners to all accordion headers
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => toggleAccordion(header));
    });

    // Initialize video elements if present
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.play().catch(function(error) {
            console.log("Video play failed:", error);
        });
    });
}); 
