<?php
/**
 *
 * Custom template elements for this theme
 *
 * @package Pegasus
 * @since 2.0
 */

namespace Pegasus\Helper;

use DateTime;
use Pegasus\Pegasus;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Pegasus\Model\PegasusImage;

/**
 * Class Pegasus_Template_Tags
 * @author <Unknown>
 * @package Pegasus\Helper
 */
class Pegasus_Template_Tags extends AbstractExtension
{

    /**
     * @return TwigFunction[]
     * @author <Unknown>
     */
    public function getFunctions()
    {
        return [
            new TwigFunction('pegasus_button', [$this, 'pegasusButton']),
            new TwigFunction('pegasus_responsive_image', [$this, 'pegasusResponsiveImage']),
            new TwigFunction('pegasus_video', [$this, 'pegasusVideo']),
            new TwigFunction('pegasus_picture', [$this, 'pegasusPicture']),
            new TwigFunction('pegasus_render_credit_link', [$this, 'pegasusRenderCreditLink']),
            new TwigFunction('to_json', [$this, 'toJson']),
            new TwigFunction('pegasus_render_block', [$this, 'pegasusRenderBlock']),
            new TwigFunction('pegasus_render_synced_pattern', [$this, 'pegasusRenderSyncedPattern']),
            new TwigFunction('pegasus_block_styles', [$this, 'pegasusBlockStyles']),
            new TwigFunction('pegasus_image_preload', [$this, 'pegasusImagePreload']),
            new TwigFunction('inline_svg', [$this, 'inlineSvg'], ['is_safe' => ['html']]),
        ];
    }

    /**
     * pegasusButton
     *
     * Displays a simple button
     *
     * @param string   $label The text to display on the button.
     * @param string   $atts The html attributes to apply to the button.
     * @param boolean  $modal Whether the button should open a modal.
     *
     */
    public function pegasusButton($label = 'button', array $atts = [], bool $modal = false)
    {
        $defaults = [
            'href' => '#',
            'target' => '_self',
            'class' => 'bg-button-primary hover:bg-button-primary-hover rounded-xl py-4 px-8 text-lg font-medium shadow-md whitespace-nowrap inline-flex items-center justify-center border transition ease-in-out duration-300 text-content-light',
        ];

        if($modal) {
            $defaults['data-pegasus-modal'] = 'Modal--full';
        }

        $atts = wp_parse_args($atts, $defaults);

        if (!empty($download)) {
            $atts['href'] = $download['url'];
            $atts['download'] = $download['title'];
        }

        $link_post = url_to_postid($atts['href']);

        echo '<a ';
        foreach ($atts as $name => $att) {
            if (!empty($att)) {
                echo $name . '="' . $att . '" ';
            }
        };
        echo '>';
        if(!empty($link_post)){
            echo '<span class="sr-only">'.get_the_title($link_post).'</span>';
        }
        echo '<span>' . $label . '</span></a>';
    }

    /**
     * pegasusPicture
     *
     * Displays a responsive picture with WebP support and optimized LCP performance
     *
     * @param string $picture the attachment data to build into an image
     * @param string $imageSize the WP image size value to generate the image at.
     * @param array  $options The arguments for how the image is displayed.
     * @return void
     */
    public function pegasusPicture($picture, $imageSize = 'full', $options = []) : void
    {
        $picture_atts = $options['picture_atts'] ?? [];
        
        // Get the ID of the picture
        $img_id = null;
        if (is_array($picture)) {
            $img_id = $picture['ID'];
        } else if (is_object($picture)) {
            $img_id = $picture->ID;
        } else if (is_numeric($picture)) {
            $img_id = $picture;
        }

        if (empty($img_id)) {
            echo '';
            return;
        }

        // Get the image data
        $image = Pegasus::getContainer()->get('PegasusImage', $img_id, $imageSize)->toArray();

        // Determine if this is a priority image (LCP optimization)
        $isPriority = $options['priority'] ?? false;
        if (!$isPriority && (!isset($options['skip_image_indexing']) || !$options['skip_image_indexing'])) {
            $currentIndex = ImageTracker::getInstance()->incrementIndex();
            $isPriority = ($currentIndex <= 4); // First 4 images are high priority for LCP
        }

        // If it's an SVG, inline it and inject attributes
        if (strpos($image['mime'], 'svg+xml') !== false) {
            $svg_atts = $options['img_atts'] ?? [];
            echo $this->inlineSvg($img_id, $imageSize, $svg_atts);
            return;
        }

        // Set up responsive sizes attribute
        $defaultImgAtts = [
            'width' => $imageSize === 'full' ? $image['width'] : $image['image_sizes'][$imageSize]['width'],
            'height' => $imageSize === 'full' ? $image['height'] : $image['image_sizes'][$imageSize]['height'],
            'class' => 'attachment-' . $imageSize . ' size-' . $imageSize,
            'alt' => trim(strip_tags($image['alt'])),
            'loading' => $isPriority ? 'eager' : 'lazy',
            'decoding' => $isPriority ? 'sync' : 'async',
        ];

        // Add fetchpriority for LCP optimization
        if ($isPriority) {
            $defaultImgAtts['fetchpriority'] = 'high';
        }

        // Create properly sized placeholder SVG
        $aspectRatio = ($image['width'] && $image['width'] > 0) ? ($image['height'] / $image['width']) : 0.5625; // Default to 16:9 aspect ratio if width is invalid
        $svg = sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" style="background-color: rgba(0,0,0,0.1)"><rect width="100%%" height="100%%" fill="transparent"/></svg>',
            100,
            round(100 * $aspectRatio)
        );
        $placeholder = 'data:image/svg+xml,' . rawurlencode($svg);

        // Add lazy loading class and merge with existing classes
        $picture_class = !$isPriority ? 'pegasus-lazy-wrapper' : '';
        if(isset($picture_atts['class'])) {
            $picture_class .= ' ' . $picture_atts['class'];
        }
        $picture_atts['class'] = trim($picture_class);

        // Start building picture element
        $output = '<picture';
        foreach ($picture_atts as $name => $att) {
            if (!empty($att)) {
                $output .= ' ' . $name . '="' . $att . '"';
            }
        }
        $output .= '>';

        // Filter srcset to exclude unnecessarily large sizes
        $max_width = $imageSize === 'full' ? $image['width'] : ($image['image_sizes'][$imageSize]['width'] ?? 0);
        $srcset_parts = explode(', ', $image['srcset']);
        $filtered_srcset = implode(', ', array_filter($srcset_parts, function($part) use ($max_width) {
            preg_match('/(\d+)w$/', $part, $matches);
            return !isset($matches[1]) || intval($matches[1]) <= $max_width;
        }));

        // Generate responsive sizes attribute
        $defaultImgAtts['sizes'] = '(min-width: 1536px) 1536px, (min-width: 1280px) 1280px, (min-width: 1024px) 1024px, (min-width: 768px) 768px, (min-width: 640px) 640px, 100vw';

        // Generate WebP sources if WebP support is available
        $webp_srcset = $this->generateWebPSrcset($img_id, $imageSize, $max_width);

        // Add WebP source elements first (browsers will use the first supported format)
        if (!empty($webp_srcset)) {
            if (!$isPriority) {
                $output .= sprintf(
                    '<source data-srcset="%s" data-sizes="%s" type="image/webp">',
                    $webp_srcset,
                    $defaultImgAtts['sizes']
                );
            } else {
                $output .= sprintf(
                    '<source srcset="%s" sizes="%s" type="image/webp">',
                    $webp_srcset,
                    $defaultImgAtts['sizes']
                );
            }
        }

        // Add fallback source elements with proper attributes
        if (!$isPriority) {
            $output .= sprintf(
                '<source data-srcset="%s" data-sizes="%s" type="%s">',
                $filtered_srcset,
                $defaultImgAtts['sizes'],
                $image['mime']
            );
        } else {
            $output .= sprintf(
                '<source srcset="%s" sizes="%s" type="%s">',
                $filtered_srcset,
                $defaultImgAtts['sizes'],
                $image['mime']
            );
        }

        // Merge user-provided img attributes
        if(isset($options['img_atts'])) {
            $defaultImgAtts = array_merge($defaultImgAtts, $options['img_atts']);
        }

        // Add image element with proper attributes
        $output .= '<img';
        if (!$isPriority) {
            $defaultImgAtts['src'] = $placeholder;
            $defaultImgAtts['data-src'] = $image['base_url'];
            $defaultImgAtts['data-srcset'] = $filtered_srcset;
            $defaultImgAtts['data-sizes'] = $defaultImgAtts['sizes'];
        } else {
            $defaultImgAtts['src'] = $image['base_url'];
            $defaultImgAtts['srcset'] = $filtered_srcset;
            $defaultImgAtts['sizes'] = $defaultImgAtts['sizes'];
        }
        
        foreach ($defaultImgAtts as $name => $value) {
            if (!empty($value)) {
                $output .= ' ' . $name . '="' . $value . '"';
            }
        }
        $output .= '>';
        
        $output .= '</picture>';
        
        echo $output;
    }

    /**
     * Generate WebP srcset for an image
     *
     * @param int $img_id Image attachment ID
     * @param string $imageSize WordPress image size
     * @param int $max_width Maximum width to include in srcset
     * @return string WebP srcset or empty string if WebP not available
     */
    private function generateWebPSrcset($img_id, $imageSize = 'full', $max_width = 1536): string
    {
        // Check if WebP support is enabled (this could be a plugin or custom implementation)
        if (!function_exists('wp_get_webp_info') && !class_exists('WebP_Express\Convert')) {
            // For now, return empty - this would need WebP generation plugin
            return '';
        }

        $image_meta = wp_get_attachment_metadata($img_id);
        if (!$image_meta) {
            return '';
        }

        $upload_dir = wp_upload_dir();
        $image_file = get_attached_file($img_id);
        $image_url = wp_get_attachment_url($img_id);

        $srcset_parts = [];

        // Add full size WebP if it exists
        $webp_file = $this->convertToWebPPath($image_file);
        $webp_url = $this->convertToWebPPath($image_url);

        if (file_exists($webp_file)) {
            $srcset_parts[] = $webp_url . ' ' . $image_meta['width'] . 'w';
        }

        // Add intermediate sizes
        if (isset($image_meta['sizes'])) {
            foreach ($image_meta['sizes'] as $size_name => $size_data) {
                if ($size_data['width'] <= $max_width) {
                    $intermediate_file = path_join(dirname($image_file), $size_data['file']);
                    $intermediate_webp = $this->convertToWebPPath($intermediate_file);

                    if (file_exists($intermediate_webp)) {
                        $intermediate_url = str_replace(basename($image_url), $size_data['file'], $image_url);
                        $intermediate_webp_url = $this->convertToWebPPath($intermediate_url);
                        $srcset_parts[] = $intermediate_webp_url . ' ' . $size_data['width'] . 'w';
                    }
                }
            }
        }

        return implode(', ', $srcset_parts);
    }

    /**
     * Convert file path/URL to WebP equivalent
     *
     * @param string $path Original file path or URL
     * @return string WebP file path or URL
     */
    private function convertToWebPPath($path): string
    {
        $path_info = pathinfo($path);
        return $path_info['dirname'] . '/' . $path_info['filename'] . '.webp';
    }

    /**
     * Generate preload link for critical images
     *
     * @param string|array|object $image Image data
     * @param string $imageSize WordPress image size
     * @param array $options Additional options
     * @return string Preload link HTML or empty string
     */
    public function pegasusImagePreload($image, $imageSize = 'full', $options = []): string
    {
        // Get the ID of the picture
        $img_id = null;
        if (is_array($image)) {
            $img_id = $image['ID'];
        } else if (is_object($image)) {
            $img_id = $image->ID;
        } else if (is_numeric($image)) {
            $img_id = $image;
        }

        if (empty($img_id)) {
            return '';
        }

        $image_data = Pegasus::getContainer()->get('PegasusImage', $img_id, $imageSize)->toArray();

        if (empty($image_data['base_url'])) {
            return '';
        }

        // Generate WebP preload if available
        $webp_url = $this->convertToWebPPath($image_data['base_url']);
        $preload_url = (file_exists($this->convertToWebPPath(get_attached_file($img_id)))) ? $webp_url : $image_data['base_url'];

        // Generate media attribute for responsive preloading
        $media = $options['media'] ?? '(max-width: 640px)';

        $preload_html = sprintf(
            '<link rel="preload" as="image" href="%s" media="%s">',
            esc_url($preload_url),
            esc_attr($media)
        );

        return $preload_html;
    }

    /**
     * pegasusResponsiveImage
     *
     * Displays a responsive image
     *
     * @param string $image the attachment data to build into an image
     * @param string $placeholder_size the WP image size value to generate the image at.
     * @param array  $atts The arguments for how the image is displayed.
     *
     */
    public function pegasusResponsiveImage($image, string $placeholder_size = 'full', array $atts = []) 
    {
        if (isset($image) && !empty($image)) {
            $image_id = $image;

            if (is_object($image)) {
                $image_id = $image->ID;
            } else if (is_array($image)) {
                $image_id = $image['ID'];
            } else if (filter_var($image, FILTER_VALIDATE_URL)) {
                $image_id = attachment_url_to_postid($image);
            }

            $attachment = get_post($image_id);

            if (!empty($attachment)) {
                // Determine if this is a priority image (LCP optimization)
                $isPriority = $atts['priority'] ?? false;
                if (!$isPriority && (!isset($atts['skip_image_indexing']) || !$atts['skip_image_indexing'])) {
                    $currentIndex = ImageTracker::getInstance()->incrementIndex();
                    $isPriority = ($currentIndex <= 4);
                }

                $image_meta = wp_get_attachment_metadata($image_id);
                $image_mime = get_post_mime_type($image_id);
                $image_width = $image_meta['width'] ?? null;
                $image_height = $image_meta['height'] ?? null;

                if (strpos($image_mime, 'svg+xml') !== false) {
                    $file = get_attached_file($image_id);
                    if(!empty($file)){
                        $stream_opts = [
                            "ssl" => [
                                "verify_peer"=>false,
                                "verify_peer_name"=>false,
                            ]
                        ];
                        $xml = file_get_contents($file,false, stream_context_create($stream_opts));
                        if($xml){
                            $xmlget = simplexml_load_string($xml);
                            $xmlattributes = $xmlget->attributes();
                            $image_width = (string) $xmlattributes->width;
                            $image_height = (string) $xmlattributes->height;
                        }
                    }
                }

                // Create properly sized placeholder SVG for lazy loading
                $aspectRatio = ($image_width && $image_width > 0) ? ($image_height / $image_width) : 0.5625; // Default to 16:9 aspect ratio if width is invalid
                $svg = sprintf(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" style="background-color: rgba(0,0,0,0.1)"><rect width="100%%" height="100%%" fill="transparent"/></svg>',
                    100,
                    round(100 * $aspectRatio)
                );
                $placeholder = 'data:image/svg+xml,' . rawurlencode($svg);

                $defaults = [
                    'width' => $image_width,
                    'height' => $image_height,
                    'class' => 'attachment-' . $placeholder_size . ' size-' . $placeholder_size,
                    'alt' => trim(strip_tags(get_post_meta($image_id, '_wp_attachment_image_alt', true))),
                    'loading' => $isPriority ? 'eager' : 'lazy',
                    'decoding' => $isPriority ? 'sync' : 'async'
                ];

                // Add fetchpriority for LCP optimization
                if ($isPriority) {
                    $defaults['fetchpriority'] = 'high';
                }

                // Always add wrapper class for lazy loading
                if (!$isPriority) {
                    $defaults['class'] .= ' pegasus-lazy-wrapper';
                }

                if (empty($defaults['alt'])) {
                    $defaults['alt'] = trim(strip_tags($attachment->post_title));
                }

                // Set up image attributes
                if (strpos($image_mime, 'svg+xml') !== false) {
                    if (!$isPriority) {
                        $defaults['src'] = $placeholder;
                        $defaults['data-src'] = wp_get_attachment_image_url($image_id, 'full', false);
                    } else {
                        $defaults['src'] = wp_get_attachment_image_url($image_id, 'full', false);
                    }
                } else {
                    // Handle non-SVG images
                    $srcset = wp_get_attachment_image_srcset($image_id);
                    $max_width = 1536;
                    
                    // Filter srcset to exclude unnecessarily large sizes
                    $srcset_parts = explode(', ', $srcset);
                    $filtered_srcset = implode(', ', array_filter($srcset_parts, function($part) use ($max_width) {
                        preg_match('/(\d+)w$/', $part, $matches);
                        return isset($matches[1]) && intval($matches[1]) <= $max_width;
                    }));

                    $sizes = '(min-width: 1536px) 1536px, (min-width: 1280px) 1280px, (min-width: 1024px) 1024px, (min-width: 768px) 768px, (min-width: 640px) 640px, 100vw';

                    if (!$isPriority) {
                        $defaults['src'] = $placeholder;
                        $defaults['data-src'] = wp_get_attachment_image_url($image_id, $placeholder_size, false);
                        $defaults['data-srcset'] = $filtered_srcset;
                        $defaults['data-sizes'] = $sizes;
                    } else {
                        $defaults['src'] = wp_get_attachment_image_url($image_id, $placeholder_size, false);
                        $defaults['srcset'] = $filtered_srcset;
                        $defaults['sizes'] = $sizes;
                    }
                }

                // Merge user provided attributes
                $atts = wp_parse_args($atts, $defaults);

                // Output the image tag
                echo '<img';
                foreach ($atts as $name => $value) {
                    if (!empty($value)) {
                        echo ' ' . $name . '="' . $value . '"';
                    }
                }
                echo '>';
            }
        } else {
            $this->get_placeholder_image($placeholder_size, $atts);
        }
    }

    /**
     * get_placeholder_image
     *
     * Constructs an svg placeholder image
     *
     * @param string $size The WP image size value to generate the image at.
     * @param array  $atts The arguments for how the placeholder is displayed.
     *
     */
    public function get_placeholder_image($size = 'full', array $atts = []): void
    {
        $sizes = pegasus_get_image_sizes();
        
        if ($size === 'full') {
            $width = 1536; // Max reasonable width
            $height = round($width * 0.5625); // 16:9 aspect ratio as default
        } else {
            $width = $sizes[$size]['width'] ?? 1536;
            $height = $sizes[$size]['height'] ?? round($width * 0.5625);
        }

        // If width/height are provided in atts, use those instead
        if (!empty($atts['width']) && !empty($atts['height'])) {
            $width = $atts['width'];
            $height = $atts['height'];
        }

        // Create aspect-ratio preserving placeholder
        $aspectRatio = ($width && $width > 0) ? ($height / $width) : 0.5625; // Default to 16:9 aspect ratio if width is invalid
        $svg = sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMid slice">' .
            '<rect width="100%%" height="100%%" fill="rgba(0,0,0,0.1)"/>' .
            '<text x="50%%" y="50%%" dy=".3em" font-family="system-ui" font-size="'.round(min($width, $height) * 0.1).'" text-anchor="middle" fill="rgba(0,0,0,0.3)">Loading...</text>' .
            '</svg>',
            $width,
            $height
        );

        // Add placeholder class
        $atts['class'] = isset($atts['class']) ? $atts['class'] . ' placeholder-image' : 'placeholder-image';
        
        // Output as data URI
        echo '<img src="data:image/svg+xml,' . rawurlencode($svg) . '" ';
        foreach ($atts as $name => $value) {
            if (!empty($value)) {
                echo $name . '="' . $value . '" ';
            }
        }
        echo '/>';
    }

    /**
     * pegasusVideo
     *
     * Displays a video
     *
     * @param string|object $video the attachment or embed html for the video
     * @param array         $atts The arguments for how the video is displayed and played.
     *
     */
    public function pegasusVideo($video, array $atts = []): void
    {
        if (isset($video) && !empty($video)) {
            $type = '';

            if (is_object($video)) {
                $type = 'upload';
            } else if (is_string($video)) {
                $type = 'embed';
            }

            switch ($type) {
                case 'embed':
                    $video = str_replace(['<iframe ', '></iframe>'], '', $video);
                    $defaults = [
                        'title' => pegasus_string_between($video, 'title="', '"'),
                        'src' => pegasus_string_between($video, 'src="', '"').'&rel=0',
                        'width' => pegasus_string_between($video, 'width="', '"'),
                        'height' => pegasus_string_between($video, 'height="', '"')
                    ];
                    if(!empty(pegasus_string_between($video, 'allow="', '"'))){
                        $defaults['allow'] = pegasus_string_between($video, 'allow="', '"');
                    }

                    $atts = wp_parse_args($atts, $defaults);

                    if(isset($atts['autoplay'])){
                        $atts['src'] .= '&autoplay='.$atts['autoplay'].'&mute='.$atts['autoplay'].'&muted='.$atts['autoplay'];
                    }

                    if(isset($atts['loop'])){
                        $atts['src'] .= '&loop='.$atts['loop'];
                    }

                    if(isset($atts['controls'])){
                        $atts['src'] .= '&controls='.$atts['controls'];
                    }

                    $video_tag = '<iframe ';
                    foreach ($atts as $name => $att) {
                        if (!empty($att)) {
                            $video_tag .= $name . '="' . $att . '" ';
                        }
                    };
                    $video_tag .= ' frameborder="0"></iframe>';
                    break;

                default :
                    $defaults = [
                        'title' => $video['title'],
                        'width' => $video['width'],
                        'height' => $video['height'],
                        'controls' => true,
                    ];

                    $atts = wp_parse_args($atts, $defaults);

                    $video_tag = '<video ';
                    foreach ($atts as $name => $att) {
                        if (!empty($att)) {
                            $video_tag .= $name . '="' . $att . '" ';
                        }
                    };
                    $video_tag .= '><source src="' . $video['url'] . '"  type="video/mp4"></video>';
                    break;

            }
            echo $video_tag;
        }
    }

    /**
     * pegasusRenderCreditLink
     *
     * Displays the web design london link
     *
     * @param string   $label custom label for the link.
     *
     */
    public function pegasusRenderCreditLink($label = 'Web Design London'): void
    {
        $link_container = '<a href="https://www.plugandplaydesign.co.uk" target="_blank">%s</a>';

        $label = sprintf(__('%s', 'pegasus'), $label);

        $link_container = sprintf($link_container, $label);

        echo $link_container;
    }

    /**
     * toJson
     *
     * Converts an array to a json string
     *
     * @param array $data
     * @return string
     */
    public function toJson($data)
    {
        return htmlspecialchars(json_encode($data));
    }

    /**
     * pegasusRenderBlock
     *
     * @param $block_name
     * @param $attrs
     * @return void
     * @author <Unknown>
     */
    function pegasusRenderBlock( $block_name, $attrs = [] )
    {
        $block = acf_get_block_type( 'pegasus/'.$block_name );
        $content = '';
        $is_preview = false;

        foreach( $attrs as $attr => $val) {
            $block['data'][$attr] = $val;
        }

        echo acf_rendered_block( $block, $content, $is_preview );
    }

    /**
     * pegasusRenderSyncedPattern
     *
     * @param $patternName
     * @return void
     * @throws \Psr\Cache\InvalidArgumentException
     * @throws \Exception
     */
    public function pegasusRenderSyncedPattern($patternName)
    {
        $args = [
            'post_type' => 'wp_block',
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'title' => $patternName,
            'meta_query' => [
                [
                    'key' => 'wp_pattern_sync_status',
                    'compare' => 'NOT EXISTS'
                ]
            ]
        ];

        $pattern = get_posts($args);

        if($pattern) {
            $pattern = $pattern[0];
            $pattern_content = apply_filters('the_content', $pattern->post_content);
            echo $pattern_content;
        }
    }

    public function pegasusBlockStyles($data) {
        if (!empty($data['styleStrings'])) {
            echo implode('', $data['styleStrings']);
        }
    }

    /**
     * Inline an SVG file's contents for direct embedding, with attribute injection
     * @param string|array|object $svg The attachment or path to the SVG
     * @param string $imageSize (optional) WP image size (default: 'full')
     * @param array $attributes (optional) Attributes to inject into <svg>
     * @return string SVG markup or empty string
     */
    public function inlineSvg($svg, $imageSize = 'full', $attributes = []) {
        $svg_path = null;
        if (is_array($svg) && isset($svg['ID'])) {
            $svg_path = get_attached_file($svg['ID']);
        } elseif (is_object($svg) && isset($svg->ID)) {
            $svg_path = get_attached_file($svg->ID);
        } elseif (is_numeric($svg)) {
            $svg_path = get_attached_file($svg);
        } elseif (is_string($svg) && file_exists($svg)) {
            $svg_path = $svg;
        }
        if ($svg_path && file_exists($svg_path)) {
            $svg_markup = file_get_contents($svg_path);
            // Inject attributes into the <svg ...> tag
            if (!empty($attributes) && preg_match('/<svg\b[^>]*>/i', $svg_markup, $matches)) {
                $attr_str = '';
                foreach ($attributes as $key => $value) {
                    $attr_str .= ' ' . $key . '="' . esc_attr($value) . '"';
                }
                $svg_markup = preg_replace('/<svg\b([^>]*)>/i', '<svg$1' . $attr_str . '>', $svg_markup, 1);
            }
            return $svg_markup;
        }
        return '';
    }
}
