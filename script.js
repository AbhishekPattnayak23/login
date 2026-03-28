/**
 * Simple Responsive Page JavaScript Layer
 * Handles click interactions, event delegation, and progressive enhancement
 */

(function() {
    'use strict';

    // Configuration object for centralized settings
    const CONFIG = {
        debounceDelay: 250,
        animationDuration: 300,
        classNames: {
            active: 'active',
            loading: 'loading',
            error: 'error',
            success: 'success',
            hidden: 'hidden'
        },
        selectors: {
            interactiveElements: '[data-js-interactive]',
            dynamicContent: '[data-js-content]',
            formElements: '[data-js-form]',
            navigation: '[data-js-nav]'
        },
        storageKeys: {
            userPreference: 'simpleRespPagePrefs',
            lastInteraction: 'jsLastClick'
        }
    };

    // Cache for frequently accessed elements
    const cache = {
        elements: new Map(),
        clicks: new Map()
    };

    // Utility functions
    const utils = {
        /**
         * Debounce function to limit rapid function calls
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Get cached element or query DOM
         */
        getElement: function(selector) {
            if (cache.elements.has(selector)) {
                return cache.elements.get(selector);
            }
            const element = document.querySelector(selector);
            if (element) {
                cache.elements.set(selector, element);
            }
            return element;
        },

        /**
         * Show content section with animation
         */
        showSection: function(sectionId) {
            const sections = document.querySelectorAll(CONFIG.selectors.dynamicContent);
            sections.forEach(section => {
                section.classList.add(CONFIG.classNames.hidden);
                setTimeout(() => {
                    section.style.display = 'none';
                }, CONFIG.animationDuration);
            });

            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
                setTimeout(() => {
                    targetSection.classList.remove(CONFIG.classNames.hidden);
                }, 50);
            }
        },

        /**
         * Handle navigation clicks
         */
        handleNavigation: function(event) {
            const navItem = event.target;
            if (!navItem.classList.contains('nav-item')) return;

            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove(CONFIG.classNames.active);
            });

            // Add active class to clicked item
            navItem.classList.add(CONFIG.classNames.active);

            // Get section ID from text content
            const sectionMap = {
                'Home': 'home',
                'About': 'about',
                'Contact': 'contact'
            };

            const sectionName = navItem.textContent.trim();
            const sectionId = sectionMap[sectionName];

            if (sectionId) {
                utils.showSection(sectionId);

                // Store preference in localStorage
                try {
                    localStorage.setItem(CONFIG.storageKeys.userPreference, sectionId);
                } catch (e) {
                    console.warn('LocalStorage not available');
                }
            }
        },

        /**
         * Handle CTA button clicks
         */
        handleCTAClick: function(event) {
            const button = event.target;
            if (button.classList.contains('cta-button')) {
                button.textContent = 'Clicked!';
                button.disabled = true;

                setTimeout(() => {
                    button.textContent = 'Click me!';
                    button.disabled = false;
                }, 2000);

                // Log interaction
                console.log('CTA button clicked at:', new Date().toISOString());
            }
        },

        /**
         * Handle toggle box interactions
         */
        handleToggleBox: function(event) {
            const toggleBox = event.target;
            if (toggleBox.classList.contains('toggle-box')) {
                toggleBox.classList.toggle(CONFIG.classNames.active);
                const isActive = toggleBox.classList.contains(CONFIG.classNames.active);
                toggleBox.textContent = isActive ? 'Content is active' : 'Toggle content';

                // Store state
                try {
                    localStorage.setItem(CONFIG.storageKeys.lastInteraction, {
                        element: 'toggle-box',
                        state: isActive,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    console.warn('Storage state save failed');
                }
            }
        },

        /**
         * Handle form submission
         */
        handleFormSubmit: function(event) {
            event.preventDefault();
            const form = event.target;
            const button = form.querySelector('button[type="submit"]');

            // Get form data
            const formData = new FormData(form);
            const data = {
                email: form.querySelector('input[type="email"]').value,
                message: form.querySelector('textarea').value
            };

            // Basic validation
            if (!data.email || !data.message) {
                alert('Please fill in all fields');
                return;
            }

            // Show loading state
            button.classList.add(CONFIG.classNames.loading);
            button.textContent = 'Sending...';
            button.disabled = true;

            // Simulate form submission
            setTimeout(() => {
                button.classList.remove(CONFIG.classNames.loading);
                button.classList.add(CONFIG.classNames.success);
                button.textContent = 'Sent!';

                // Clear form
                form.reset();

                setTimeout(() => {
                    button.classList.remove(CONFIG.classNames.success);
                    button.textContent = 'Send';
                    button.disabled = false;
                }, 3000);

                console.log('Form submitted:', data);
            }, 1500);
        }
    };

    // Event delegation setup
    const initEventDelegation = function() {
        // Navigation events
        const nav = utils.getElement(CONFIG.selectors.navigation);
        if (nav) {
            nav.addEventListener('click', utils.debounce(utils.handleNavigation, CONFIG.debounceDelay));
        }

        // Interactive elements
        document.addEventListener('click', function(event) {
            const target = event.target;

            if (target.matches(CONFIG.selectors.interactiveElements)) {
                if (target.classList.contains('cta-button')) {
                    utils.handleCTAClick(event);
                } else if (target.classList.contains('toggle-box')) {
                    utils.handleToggleBox(event);
                }
            }
        });

        // Form submission
        const forms = document.querySelectorAll(CONFIG.selectors.formElements);
        forms.forEach(form => {
            form.addEventListener('submit', utils.handleFormSubmit);
        });
    };

    // Progressive enhancement setup
    const initProgressiveEnhancement = function() {
        // Check if JavaScript is enabled by removing 'no-js' class
        document.documentElement.classList.remove('no-js');

        // Load saved preferences
        try {
            const savedSection = localStorage.getItem(CONFIG.storageKeys.userPreference);
            if (savedSection && document.getElementById(savedSection)) {
                utils.showSection(savedSection);

                // Update active nav item
                const sectionMap = {
                    'home': 'Home',
                    'about': 'About',
                    'contact': 'Contact'
                };

                const navText = sectionMap[savedSection];
                if (navText) {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.toggle(CONFIG.classNames.active, item.textContent === navText);
                    });
                }
            }
        } catch (e) {
            console.log('Progressive enhancement features unavailable');
        }
    };

    // Initialize the application
    const init = function() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initEventDelegation();
                initProgressiveEnhancement();
                console.log('Simple Responsive Page initialized');
            });
        } else {
            initEventDelegation();
            initProgressiveEnhancement();
            console.log('Simple Responsive Page initialized');
        }
    };

    // Start the application
    init();
})();
