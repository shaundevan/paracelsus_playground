// Adform Tracking Configuration
const adformConfig = {
    httpHost: 'track.adform.net',
    pm: 2883116,
    scriptUrl: 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'
};

// Check if we're in development environment
const isDevelopment = () => {
    const host = window.location.hostname;
    return host.includes('localhost') || 
           host.includes('.lndo.site') || 
           host.includes('.local') || 
           host.includes('.test') || 
           host.includes('.dev');
};

// Initialize Adform tracking
function initAdformTracking() {
    if (isDevelopment()) {
        console.log('Adform tracking disabled in development environment');
        return;
    }

    try {
        window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
        window._adftrack.push({
            HttpHost: adformConfig.httpHost,
            pm: adformConfig.pm
        });

        // Load Adform script asynchronously
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = adformConfig.scriptUrl;
        script.onerror = (error) => {
            console.warn('Failed to load Adform tracking script:', error);
        };
        document.head.appendChild(script);
    } catch (error) {
        console.warn('Error initializing Adform tracking:', error);
    }
}

// Track conversion after 60 seconds
function trackConversion() {
    if (isDevelopment()) return;

    try {
        window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
        window._adftrack.push({
            HttpHost: adformConfig.httpHost,
            pm: adformConfig.pm,
            divider: encodeURIComponent('|'),
            pagename: encodeURIComponent('Conversion')
        });
    } catch (error) {
        console.warn('Error tracking conversion:', error);
    }
}

// Track three page visits
function trackThreePageVisits() {
    if (isDevelopment()) return;

    try {
        window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
        window._adftrack.push({
            HttpHost: adformConfig.httpHost,
            pm: adformConfig.pm,
            divider: encodeURIComponent('|'),
            pagename: encodeURIComponent('Three Page Visits')
        });
    } catch (error) {
        console.warn('Error tracking three page visits:', error);
    }
}

// Page visit counter
let pageVisitCount = 0;

// Initialize tracking when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize base tracking
    initAdformTracking();

    // Track conversion after 60 seconds
    setTimeout(trackConversion, 60000);

    // Increment page visit counter
    pageVisitCount = parseInt(localStorage.getItem('adformPageVisits') || '0') + 1;
    localStorage.setItem('adformPageVisits', pageVisitCount.toString());

    // Track three page visits
    if (pageVisitCount >= 3) {
        trackThreePageVisits();
    }
}); 