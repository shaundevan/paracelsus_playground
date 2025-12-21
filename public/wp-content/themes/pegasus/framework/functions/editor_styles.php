<?php
/**
 *
 * Add a format menu to the wysiwyg editor
 *
 * @package Pegasus
 * @since 2.0
 */

// Enable custom WYSIWYG styles dropdown
add_filter('mce_buttons_2', 'pegasus_tinymce_buttons');
function pegasus_tinymce_buttons($buttons)
{
    array_unshift($buttons, 'styleselect');
    return $buttons;
}

// Set the options for the TinyMCE dropdown
add_filter('tiny_mce_before_init', 'pegasus_before_init_insert_formats');
function pegasus_before_init_insert_formats($init_array)
{

    $style_formats = [
        [
            'title' => 'Headings',
            'items' => [
                [
                    'title'     => 'Heading 1',
                    'selector'  => 'h1, h2, h3, h4, h5, h6',
                    'classes' => 'heading-one',
                    'wrapper' => false,
                ],
                [
                    'title'     => 'Heading 2',
                    'selector'  => 'h1, h2, h3, h4, h5, h6',
                    'classes' => 'heading-two',
                    'wrapper' => false,
                ],
                [
                    'title'     => 'Heading 3',
                    'selector'  => 'h1, h2, h3, h4, h5, h6',
                    'classes' => 'heading-three',
                    'wrapper' => false,
                ],
                [
                    'title'     => 'Heading 4',
                    'selector'  => 'h1, h2, h3, h4, h5, h6',
                    'classes' => 'heading-four',
                    'wrapper' => false,
                ],
                [
                    'title'     => 'Heading 5',
                    'selector'  => 'h1, h2, h3, h4, h5, h6',
                    'classes' => 'heading-five',
                    'wrapper' => false,
                ],
                [
                    'title'     => 'Heading 6',
                    'selector'  => 'h1, h2, h3, h4, h5, h6',
                    'classes' => 'heading-six',
                    'wrapper' => false,
                ]
            ]
        ],
        [
            'title' => 'Subtitle Text',
            'items' => [
                [
                    'title' => 'Extra Large',
                    'block' => 'span',
                    'classes' => 'subtitle-xl',
                    'wrapper' => true,
                ],
                [
                    'title' => 'Large',
                    'block' => 'span',
                    'classes' => 'subtitle-lg',
                    'wrapper' => true,
                ],
                [
                    'title' => 'Medium',
                    'block' => 'span',
                    'classes' => 'subtitle-md',
                    'wrapper' => true,
                ],
                [
                    'title' => 'Small',
                    'block' => 'span',
                    'classes' => 'subtitle-sm',
                    'wrapper' => true,
                ],
            ]
            ],
        [
            'title' => 'Body Text',
            'items' => [
                [
                    'title' => 'Large',
                    'block' => 'span',
                    'classes' => 'body-lg',
                    'wrapper' => true,
                ],
                [
                    'title' => 'Medium',
                    'block' => 'span',
                    'classes' => 'body-md',
                    'wrapper' => true,
                ],
                [
                    'title' => 'Small',
                    'block' => 'span',
                    'classes' => 'body-sm',
                    'wrapper' => true,
                ],
                [
                    'title' => 'Extra Small',
                    'block' => 'span',
                    'classes' => 'body-xs',
                    'wrapper' => true,
                ],
            ]
        ],
        [
            'title' => 'Eyebrow',
            'block' => 'span',
            'classes' => 'eyebrow',
            'wrapper' => true,
        ],
    ];

    // Insert the array, JSON ENCODED, into 'style_formats'
    $init_array['style_formats'] = json_encode($style_formats);
    return $init_array;
}

// Custom Colour Pallet
add_filter('tiny_mce_before_init', 'pegasus_tinymce_options');
function pegasus_tinymce_options($init) {

    $custom_colours = '
        "000000", "black",
        "ffffff", "white",
        "ff0000", "red",
    ';

    // build colour grid default+custom colors
    $init['textcolor_map'] = '['.$custom_colours.']';

    return $init;
}

function pegasus_acf_input_admin_footer() { ?>

    <script type="text/javascript">
    (function($) {

    acf.add_filter('color_picker_args', function( args, $field ){

    // add the hexadecimal codes here for the colors you want to appear as swatches
    args.palettes = [
        "#000000",
        "#ffffff",
        "#ff0000",
    ]

    // return colors
    return args;

    });

    })(jQuery);
    </script>

    <?php }

    add_action('acf/input/admin_footer', 'pegasus_acf_input_admin_footer');


add_action('admin_head', 'pegasus_focal_point_styles');
function pegasus_focal_point_styles()
{
    echo '<style>
    .acf-field[data-name="image_focal_point"] .acf-button-group{
        display: grid;
        max-width:150px;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        grid-column-gap: 20px;
        grid-row-gap: 20px;
        background-color: #DADADA;
        padding:10px;
    }

    .acf-field[data-name="image_focal_point"] .acf-button-group label {
        color: rgba(0,0,0,0);
        width:30px;
        height:30px;
    }
    </style>';
}