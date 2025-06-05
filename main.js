// Main JavaScript for WebShell.lol
import { i18n } from './lang.js';

// DOM Elements
const html = document.documentElement;
const body = document.body;
window.addEventListener('DOMContentLoaded', () => {
  const banners = document.querySelectorAll('div[style*="position: fixed"][style*="bottom: 0px"][style*="z-index: 9999"]');

  banners.forEach(banner => {
    const img = banner.querySelector('img[src*="tiiny.host/assets/img/ad.png"]');
    if (img) {
      banner.style.display = 'none';
    }
  });
});

// Current language handling
let currentLanguage = localStorage.getItem('webshell-language') || 
                     navigator.language || 
                     navigator.userLanguage || 
                     'en';

// Ensure the language is supported, default to 'en' if not
if (!i18n[currentLanguage]) {
  // Check if we have a language match without the region code (e.g., 'en-US' -> 'en')
  const langBase = currentLanguage.split('-')[0];
  if (i18n[langBase]) {
    currentLanguage = langBase;
  } else if (i18n[`${langBase}-${currentLanguage.split('-')[1]?.toUpperCase()}`]) {
    // Check for region-specific match (e.g., 'pt-br' -> 'pt-BR')
    currentLanguage = `${langBase}-${currentLanguage.split('-')[1]?.toUpperCase()}`;
  } else {
    currentLanguage = 'en';
  }
}

// Store the current language
localStorage.setItem('webshell-language', currentLanguage);

// Theme handling
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem('webshell-theme') || (prefersDarkMode ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

// Apply translations to the page
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    
    if (i18n[currentLanguage] && i18n[currentLanguage][key]) {
      // Handle different element types
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.getAttribute('placeholder')) {
          el.setAttribute('placeholder', i18n[currentLanguage][key]);
        } else {
          el.value = i18n[currentLanguage][key];
        }
      } else if (el.tagName === 'IMG') {
        el.setAttribute('alt', i18n[currentLanguage][key]);
      } else {
        el.textContent = i18n[currentLanguage][key];
      }
    }
  });

  // Update meta tags
  document.title = i18n[currentLanguage]['meta-title'] || 'WebShell.lol';
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', i18n[currentLanguage]['meta-description'] || '');
  }
  
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', i18n[currentLanguage]['meta-keywords'] || '');
  }
}

// Language switcher functionality
function setupLanguageSwitcher() {
  const languageSwitcher = document.getElementById('language-switcher');
  
  if (languageSwitcher) {
    // Clear existing options
    languageSwitcher.innerHTML = '';
    
    // Add options for each language
    const languages = {
      'en': 'English',
      'id': 'Bahasa Indonesia',
      'zh': '中文',
      'tr': 'Türkçe',
      'es': 'Español',
      'pt-BR': 'Português (Brasil)'
    };
    
    Object.keys(languages).forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = languages[lang];
      option.selected = lang === currentLanguage;
      languageSwitcher.appendChild(option);
    });
    
    // Add change event listener
    languageSwitcher.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
      localStorage.setItem('webshell-language', currentLanguage);
      applyTranslations();
      
      // If on a blog post, redirect to the appropriate language version
      const currentPath = window.location.pathname;
      if (currentPath.includes('/posts/sample-post')) {
        window.location.href = `/posts/sample-post.${currentLanguage}.html`;
      }
    });
  }
}

// Theme toggle functionality
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('webshell-theme', currentTheme);
      
      // Update aria-label for accessibility
      themeToggle.setAttribute('aria-label', 
        i18n[currentLanguage]['theme-toggle'] || 'Toggle theme'
      );
    });
  }
}

// Mobile menu functionality
function setupMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
      
      // Update aria-expanded for accessibility
      const isExpanded = nav.classList.contains('open');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded.toString());
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && 
          !nav.contains(e.target) && 
          e.target !== mobileMenuToggle) {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Handle header scrolling effects
function setupScrollEffects() {
  const header = document.querySelector('.header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

// Setup intersection observer for animations
function setupIntersectionObserver() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-up');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Stop observing once visible
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // If user prefers reduced motion, add visible class to all elements immediately
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-up')
      .forEach(el => el.classList.add('visible'));
  }
}

// Blog functionality
function setupBlog() {
  const blogContainer = document.querySelector('.blog-posts-container');
  
  if (blogContainer) {
    // Sample blog posts data
    const blogPosts = [
      {
        title: 'sample-post-title',
        slug: 'sample-post',
        date: 'sample-post-date',
        author: 'sample-post-author',
        category: 'sample-post-category',
        readingTime: 'sample-post-reading-time',
        excerpt: 'sample-post-intro',
        featured: true,
        image: 'https://images.pexels.com/photos/6963944/pexels-photo-6963944.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        title: 'How PBNs Complement WebShell Technology',
        slug: 'pbn-complement-webshell',
        date: '2024-12-10',
        author: 'Maria Rodriguez',
        category: 'PBN Strategies',
        readingTime: '6 min read',
        excerpt: 'Discover the synergy between Private Blog Networks and WebShell technology for maximum SEO impact.',
        featured: false,
        image: 'https://images.pexels.com/photos/5483064/pexels-photo-5483064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        title: 'Algorithm-Proof Rankings with Advanced WebShell Techniques',
        slug: 'algorithm-proof-rankings',
        date: '2024-11-25',
        author: 'James Wilson',
        category: 'WebShell Technology',
        readingTime: '7 min read',
        excerpt: 'Learn how to maintain stable rankings through major algorithm updates using WebShell technology.',
        featured: false,
        image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        title: 'E-commerce SEO Success Story: 187% Traffic Increase',
        slug: 'ecommerce-seo-success-story',
        date: '2024-11-10',
        author: 'Sophia Patel',
        category: 'Case Studies',
        readingTime: '5 min read',
        excerpt: 'Case study: How an e-commerce client achieved a 187% increase in organic traffic in just 2 months.',
        featured: false,
        image: 'https://images.pexels.com/photos/6663/desk-white-black-header.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ];
    
    // Check if we need to render the featured post
    const featuredContainer = document.querySelector('.featured-post');
    if (featuredContainer) {
      const featuredPost = blogPosts.find(post => post.featured);
      if (featuredPost) {
        let featuredTitle = featuredPost.title;
        if (featuredPost.slug === 'sample-post') {
          featuredTitle = i18n[currentLanguage]['sample-post-title'];
        }
        
        featuredContainer.innerHTML = `
          <div class="featured-post-image">
            <img src="${featuredPost.image}" alt="${featuredTitle}" loading="lazy">
          </div>
          <div class="featured-post-content">
            <span class="post-category">${featuredPost.category}</span>
            <h3>${featuredTitle}</h3>
            <p class="post-meta">
              <span class="post-date">${i18n[currentLanguage]['blog-published-on'] || 'Published on'} ${featuredPost.date}</span>
              <span class="post-author">${i18n[currentLanguage]['blog-by-author'] || 'by'} ${featuredPost.author}</span>
              <span class="post-reading-time">${featuredPost.readingTime}</span>
            </p>
            <p class="post-excerpt">${featuredPost.slug === 'sample-post' ? i18n[currentLanguage]['sample-post-intro'] : featuredPost.excerpt}</p>
            <a href="/posts/${featuredPost.slug}.${currentLanguage}.html" class="btn btn-primary">${i18n[currentLanguage]['blog-read-more'] || 'Read More'}</a>
          </div>
        `;
      }
    }
    
    // Render blog posts grid
    const recentPosts = blogPosts.filter(post => !post.featured).slice(0, 3);
    if (recentPosts.length > 0) {
      const postsHTML = recentPosts.map(post => {
        let postTitle = post.title;
        let postExcerpt = post.excerpt;
        
        if (post.slug === 'sample-post') {
          postTitle = i18n[currentLanguage]['sample-post-title'];
          postExcerpt = i18n[currentLanguage]['sample-post-intro'];
        }
        
        return `
          <div class="blog-post-card fade-in">
            <div class="post-image">
              <img src="${post.image}" alt="${postTitle}" loading="lazy">
            </div>
            <div class="post-content">
              <span class="post-category">${post.category}</span>
              <h3>${postTitle}</h3>
              <p class="post-meta">
                <span class="post-date">${post.date}</span>
                <span class="post-reading-time">${post.readingTime}</span>
              </p>
              <p class="post-excerpt">${postExcerpt.substring(0, 120)}...</p>
              <a href="/posts/${post.slug}.${currentLanguage}.html" class="btn btn-outline">${i18n[currentLanguage]['blog-read-more'] || 'Read More'}</a>
            </div>
          </div>
        `;
      }).join('');
      
      blogContainer.innerHTML = postsHTML;
    }
  }
}

// Pricing currency conversion
function setupPricingToggle() {
  const pricingToggle = document.querySelector('.pricing-toggle');
  const annualToggle = document.getElementById('annual-toggle');
  const monthlyToggle = document.getElementById('monthly-toggle');
  const currencySelector = document.getElementById('currency-selector');
  
  if (pricingToggle && annualToggle && monthlyToggle) {
    // Toggle between monthly and annual pricing
    const prices = {
      monthly: {
        basic: { USD: 499, EUR: 459, GBP: 399, IDR: 7499000, CNY: 3499, TRY: 15999, BRL: 2499 },
        pro: { USD: 999, EUR: 919, GBP: 799, IDR: 14999000, CNY: 6999, TRY: 29999, BRL: 4999 },
        enterprise: { USD: 2499, EUR: 2299, GBP: 1999, IDR: 37499000, CNY: 17499, TRY: 74999, BRL: 12499 }
      },
      annual: {
        basic: { USD: 399, EUR: 369, GBP: 319, IDR: 5999000, CNY: 2799, TRY: 12799, BRL: 1999 },
        pro: { USD: 799, EUR: 739, GBP: 639, IDR: 11999000, CNY: 5599, TRY: 23999, BRL: 3999 },
        enterprise: { USD: 1999, EUR: 1839, GBP: 1599, IDR: 29999000, CNY: 13999, TRY: 59999, BRL: 9999 }
      }
    };
    
    // Currency symbols and formats
    const currencyFormats = {
      USD: { symbol: '$', position: 'before' },
      EUR: { symbol: '€', position: 'before' },
      GBP: { symbol: '£', position: 'before' },
      IDR: { symbol: 'Rp', position: 'before' },
      CNY: { symbol: '¥', position: 'before' },
      TRY: { symbol: '₺', position: 'before' },
      BRL: { symbol: 'R$', position: 'before' }
    };
    
    // Default currency based on language
    const languageCurrencyMap = {
      'en': 'USD',
      'id': 'IDR',
      'zh': 'CNY',
      'tr': 'TRY',
      'es': 'EUR',
      'pt-BR': 'BRL'
    };
    
    let currentPricingPeriod = 'monthly';
    let currentCurrency = localStorage.getItem('webshell-currency') || 
                         languageCurrencyMap[currentLanguage] || 
                         'USD';
    
    // Setup currency selector
    if (currencySelector) {
      // Clear existing options
      currencySelector.innerHTML = '';
      
      // Add options for each currency
      Object.keys(currencyFormats).forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        option.selected = currency === currentCurrency;
        currencySelector.appendChild(option);
      });
      
      // Add change event listener
      currencySelector.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        localStorage.setItem('webshell-currency', currentCurrency);
        updatePricingDisplay();
      });
    }
    
    // Update pricing based on period and currency
    function updatePricingDisplay() {
      const priceElements = document.querySelectorAll('.price-amount');
      
      priceElements.forEach(element => {
        const plan = element.getAttribute('data-plan');
        if (plan && prices[currentPricingPeriod][plan]) {
          const price = prices[currentPricingPeriod][plan][currentCurrency];
          const format = currencyFormats[currentCurrency];
          
          let formattedPrice;
          if (format.position === 'before') {
            formattedPrice = `${format.symbol}${price.toLocaleString()}`;
          } else {
            formattedPrice = `${price.toLocaleString()} ${format.symbol}`;
          }
          
          element.textContent = formattedPrice;
        }
      });
      
      // Update period text
      const periodElements = document.querySelectorAll('.price-period');
      const periodText = currentPricingPeriod === 'monthly' ? 
                        i18n[currentLanguage]['pricing-basic-period'] || '/month' : 
                        '/year';
      
      periodElements.forEach(element => {
        element.textContent = periodText;
      });
    }
    
    // Toggle between monthly and annual pricing
    annualToggle.addEventListener('click', () => {
      currentPricingPeriod = 'annual';
      annualToggle.classList.add('active');
      monthlyToggle.classList.remove('active');
      updatePricingDisplay();
    });
    
    monthlyToggle.addEventListener('click', () => {
      currentPricingPeriod = 'monthly';
      monthlyToggle.classList.add('active');
      annualToggle.classList.remove('active');
      updatePricingDisplay();
    });
    
    // Initialize pricing display
    updatePricingDisplay();
  }
}

// Contact form handling
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const formButton = contactForm.querySelector('button[type="submit"]');
      const formStatus = document.createElement('div');
      formStatus.className = 'form-status';
      
      // Show sending state
      formButton.disabled = true;
      formButton.textContent = i18n[currentLanguage]['contact-form-sending'] || 'Sending...';
      
      try {
        // Simulate form submission with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        formStatus.classList.add('success');
        formStatus.textContent = i18n[currentLanguage]['contact-form-success'] || 
                               'Your message has been sent successfully. We\'ll get back to you shortly.';
        
        // Reset form
        contactForm.reset();
      } catch (error) {
        // Show error message
        formStatus.classList.add('error');
        formStatus.textContent = i18n[currentLanguage]['contact-form-error'] || 
                               'There was an error sending your message. Please try again.';
      } finally {
        // Reset button state
        formButton.disabled = false;
        formButton.textContent = i18n[currentLanguage]['contact-form-submit'] || 'Send Message';
        
        // Add status message to form
        contactForm.appendChild(formStatus);
        
        // Remove status message after 5 seconds
        setTimeout(() => {
          formStatus.remove();
        }, 5000);
      }
    });
  }
}

// 404 page auto-redirect
function setup404Redirect() {
  const redirectContainer = document.querySelector('.redirect-container');
  
  if (redirectContainer) {
    let secondsLeft = 10;
    const secondsElement = document.getElementById('redirect-seconds');
    
    if (secondsElement) {
      const countdown = setInterval(() => {
        secondsLeft -= 1;
        secondsElement.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
          clearInterval(countdown);
          window.location.href = '/';
        }
      }, 1000);
    }
  }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
  // Apply translations
  applyTranslations();
  
  // Setup UI components
  setupLanguageSwitcher();
  setupThemeToggle();
  setupMobileMenu();
  setupScrollEffects();
  setupIntersectionObserver();
  
  // Setup page-specific functionality
  setupBlog();
  setupPricingToggle();
  setupContactForm();
  setup404Redirect();
  
  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
});