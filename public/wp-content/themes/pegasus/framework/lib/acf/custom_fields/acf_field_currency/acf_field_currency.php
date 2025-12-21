<?php

class acf_field_currency extends acf_field
{
    // vars
    var $settings, // will hold info such as dir / path
        $defaults; // will hold default field options

    /*
    *  __construct
    *
    *  Set name / label needed for actions / filters
    *
    *  @since	3.6
    *  @date	23/01/13
    */

    function __construct()
    {
        // vars
        $this->name = 'currency';
        $this->label = __('Currency', 'acf');
        $this->category = __("Relational", 'acf'); // Basic, Content, Choice, etc
        $this->defaults = array(
            'allow_null' => 0,
            'container' => 'div'
        );

        // do not delete!
        parent::__construct();

        // settings
        $this->settings = array(
            'path' => apply_filters('acf/helpers/get_path', __FILE__),
            'dir' => apply_filters('acf/helpers/get_dir', __FILE__),
            'version' => '1.1.2'
        );
    }

    function render_field_settings($field)
    {
        acf_render_field_setting($field, [
            'label' => __('Allow Null', 'acf'),
            'instructions' => '',
            'type' => 'true_false',
            'name' => 'allow_null',
            'ui' => 1
        ]);
    }

    /*
    *  create_field()
    *
    *  Create the HTML interface for your field
    *
    *  @param	$field - an array holding all the field's data
    *
    *  @type	action
    *  @since	3.6
    *  @date	23/01/13
    */
    function render_field($field)
    {
        // create Field HTML
        echo sprintf( '<select id="%s" class="%s" name="%s">', $field['id'], $field['class'], $field['name']  );

        // null
        if( $field['allow_null'] )
        {
            echo '<option value=""> - Select - </option>';
        }

        // Execute repeatedly as long as the below statement is true
        while( have_rows('currencies', 'option') ) {
            the_row();

            // Variables
            $value = get_sub_field('currency_code');
            $selected = selected( $field['value'], $value, false );

            // Append to choices
            echo sprintf('<option value="%1$s" %2$s>%1$s</option>', $value, $selected);
        }

        echo '</select>';
    }
}

new acf_field_currency();
