<?php
namespace Pegasus\Helpers;

use Pegasus\EnvironmentHelper;

class AdformTracking {
    /**
     * Initialize Adform tracking
     */
    public static function init() {
        // Only initialize tracking in production environment
        if (EnvironmentHelper::isProduction()) {
            add_action('wp_enqueue_scripts', [self::class, 'enqueue_scripts']);
            add_action('wp_footer', [self::class, 'add_noscript_fallback']);
        }
    }

    /**
     * Enqueue tracking scripts with lazy loading
     */
    public static function enqueue_scripts() {
        // Inline lazy-loaded tracking script instead of external file
        add_action('wp_footer', [self::class, 'add_lazy_tracking_script'], 25);
    }

    /**
     * Add lazy-loaded tracking script (loads on user interaction)
     */
    public static function add_lazy_tracking_script() {
        ?>
        <script>
        (function() {
            let adformLoaded = false;
            
            const adformConfig = {
                httpHost: 'track.adform.net',
                pm: 2883116,
                scriptUrl: 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'
            };
            
            function loadAdform() {
                if (adformLoaded) return;
                adformLoaded = true;
                
                try {
                    window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
                    window._adftrack.push({
                        HttpHost: adformConfig.httpHost,
                        pm: adformConfig.pm
                    });

                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.async = true;
                    script.src = adformConfig.scriptUrl;
                    script.onerror = () => console.warn('Adform script failed to load');
                    document.head.appendChild(script);
                    
                    // Track conversion after delay
                    setTimeout(() => {
                        try {
                            window._adftrack.push({
                                HttpHost: adformConfig.httpHost,
                                pm: adformConfig.pm,
                                divider: encodeURIComponent('|'),
                                pagename: encodeURIComponent('Conversion')
                            });
                        } catch(e) {}
                    }, 60000);
                    
                    // Handle page visit tracking
                    const pageVisits = parseInt(localStorage.getItem('adformPageVisits') || '0') + 1;
                    localStorage.setItem('adformPageVisits', pageVisits.toString());
                    
                    if (pageVisits >= 3) {
                        window._adftrack.push({
                            HttpHost: adformConfig.httpHost,
                            pm: adformConfig.pm,
                            divider: encodeURIComponent('|'),
                            pagename: encodeURIComponent('Three Page Visits')
                        });
                    }
                } catch(error) {
                    console.warn('Adform tracking error:', error);
                }
            }
            
            // Load on user interaction OR after 5 seconds (whichever comes first)
            const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
            const loadOnInteraction = () => {
                loadAdform();
                events.forEach(event => document.removeEventListener(event, loadOnInteraction));
            };
            
            events.forEach(event => document.addEventListener(event, loadOnInteraction, {once: true, passive: true}));
            setTimeout(loadAdform, 5000); // Fallback after 5 seconds
        })();
        </script>
        <?php
    }

    /**
     * Add noscript fallback for tracking
     */
    public static function add_noscript_fallback() {
        ?>
        <noscript>
            <p style="margin:0;padding:0;border:0;">
                <img src="https://track.adform.net/Serving/TrackPoint/?pm=2883116" width="1" height="1" alt="" />
            </p>
        </noscript>
        <?php
    }
}

// Initialize the tracking
AdformTracking::init(); 