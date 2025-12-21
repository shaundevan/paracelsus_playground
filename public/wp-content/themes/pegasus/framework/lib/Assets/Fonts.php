<?php


namespace Pegasus\Assets;

class Fonts {


	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'wp_head', [ $this, 'preloadLocalFonts' ], 1 );
		add_action( 'admin_head', [ $this, 'preloadLocalFonts' ], 1 );
	}



    /**
     * Preload only critical fonts for LCP optimization
     */
    public function preloadLocalFonts()
    {
        // Only preload critical fonts that are needed above-the-fold
        $critical_fonts = [
            // Reckless Neue (serif) - prefer woff2, fallback to woff
            'reckless-neue/RecklessNeue-Regular.woff2',
            'reckless-neue/RecklessNeue-Regular.woff',
            
            // TWK Lausanne Pan 450 weight (sans-serif)
            'lausanne-pan/TWKLausannePan-450.woff2',
            'lausanne-pan/TWKLausannePan-450.woff',
            
            // TWK Lausanne Pan 300 weight (light sans-serif)
            'lausanne-pan/TWKLausannePan-300.woff2',
            'lausanne-pan/TWKLausannePan-300.woff',
        ];

        $fonts_to_preload = [];

        foreach($critical_fonts as $font_path) {
            $full_path = THEME_FONTS . '/' . $font_path;
            
            if (file_exists($full_path)) {
                $font_type = (strpos($font_path, '.woff2') !== false) ? 'woff2' : 'woff';
                
                // Create unique key for each font variant (family + weight)
                if (strpos($font_path, 'reckless-neue') !== false) {
                    $font_key = 'reckless-neue-regular';
                } elseif (strpos($font_path, 'TWKLausannePan-450') !== false) {
                    $font_key = 'lausanne-pan-450';
                } elseif (strpos($font_path, 'TWKLausannePan-300') !== false) {
                    $font_key = 'lausanne-pan-300';
                } else {
                    $font_key = basename($font_path, '.' . $font_type);
                }
                
                // Prefer woff2 over woff for the same font variant
                if (!isset($fonts_to_preload[$font_key]) || $font_type === 'woff2') {
                    $fonts_to_preload[$font_key] = [
                        'path' => $font_path,
                        'type' => $font_type
                    ];
                }
            }
        }

        // Output preload links for critical fonts only
        foreach($fonts_to_preload as $font_data) {
            $font_url = THEME_FONTS_URI . '/' . $font_data['path'];
            echo '<link rel="preload" href="' . $font_url . '" as="font" type="font/' . $font_data['type'] . '" crossorigin="anonymous">';
        }

        // Add to your Fonts.php - ensure font-display: swap
        echo '<style>
        @font-face {
            font-family: "TWK Lausanne Pan";
            font-display: swap; /* Critical for performance */
        }
        </style>';
    }

}
