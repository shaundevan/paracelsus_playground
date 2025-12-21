<?php

class acf_field_post_types extends acf_field
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
        $this->name = 'post_type';
        $this->label = __('Post Types', 'acf');
        $this->category = __("Relational", 'acf'); // Basic, Content, Choice, etc
        $this->defaults = array(
            'save_format' => 'name',
            'multiple' => 1,
            'allow_null' => -1,
            'container' => 'div'
        );

        // do not delete!
        parent::__construct();

        $this->settings = array(
            'path' => apply_filters('acf/helpers/get_path', __FILE__),
            'dir' => apply_filters('acf/helpers/get_dir', __FILE__),
            'version' => '1.1.2'
        );
    }

    function render_field_settings($field)
    {
        acf_render_field_setting( $field, [
            'label'			=> __('Return Format','acf'),
            'type'		=>	'radio',
            'name'		=> 'save_format',
            'layout'	=>	'horizontal',
            'choices' 	=>	[
                'object'	=>	__("Post Type Object",'acf'),
                'name'		=>	__("Post Type Name",'acf'),
            ]
        ]);

        acf_render_field_setting($field, [
            'label' => __('Allow Null', 'acf'),
            'instructions' => '',
            'type' => 'true_false',
            'name' => 'allow_null',
            'ui' => 1
        ]);

        acf_render_field_setting($field, [
            'label'        => __('Select Multiple', 'acf'),
            'instructions' => '',
            'type'         => 'true_false',
            'name'         => 'multiple',
            'ui'           => 1
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
        $field['type'] = 'select';
        $field['ui'] = 1;
        $field['ajax'] = 0;
        $field['choices'] = array();

        $post_types = get_post_types(['public' => true], 'objects');

        foreach ($post_types as $post_type) {
            if($post_type->name === 'attachment' || $post_type->name === 'page') {
                continue;
            }
            $field['choices'][$post_type->name] = $post_type->labels->name;
        }

        echo "<div class='acf-field acf-field-select' 
           data-name='{$field['_name']}' 
           data-type='select' 
           data-key='{$field['key']}'>";

        acf_render_field($field);
        echo "</div>";
    }

    function format_value($value, $post_id, $field)
    {
        $field = array_merge($this->defaults, $field);

        if (!$value) {
            return false;
        }

        if($field['save_format'] === 'object'){
            if(!$field['multiple']){
                $value = get_post_type_object($value);
            } else {
                $objects = null;
                foreach ($value as $val){
                    $objects[] = get_post_type_object($val);
                }
                $value = $objects;
            }

        }

        return $value;
    }
}

new acf_field_post_types();