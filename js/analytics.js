// Vercel Web Analytics initialization
// Import from CDN to avoid build step requirement
(function() {
  // Load analytics from @vercel/analytics package
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import { inject } from 'https://cdn.jsdelivr.net/npm/@vercel/analytics@1/+esm';
    inject({ mode: '${window.location.hostname === 'localhost' ? 'development' : 'production'}' });
  `;
  document.head.appendChild(script);
})();
