<?php

class acf_field_post_meta extends acf_field
{
    // vars
    var $settings, // will hold info such as dir / path
        $defaults, // will hold default field options
        $item_descendants,
        $descendant_level;

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
        $this->name = 'post_meta';
        $this->label = __('Post Meta', 'acf');
        $this->category = __("Relational", 'acf'); // Basic, Content, Choice, etc
        $this->defaults = array(
            'save_format'  => 'name',
            'multiple'     => 0,
            'allow_null'   => -1,
            'container'    => 'div'
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
            'label'	  => __('Post Type To Exclude','acf'),
            'instructions' => 'Exclude meta fields from the selected post types. Leave blank to show meta fields from all post types.',
            'type'	  => 'post_type',
            'name'	  => 'post_type',
            'layout'  => 'horizontal',
        ]);

        acf_render_field_setting($field, [
            'label'        => __('Allow Text Meta Fields', 'acf'),
            'instructions' => 'By default this field will only display selection based meta fields such as select, checkbox, button group etc. If you would like to allow text based meta fields such as text, textarea, number etc, please check this box.',
            'type'         => 'true_false',
            'name'         => 'text_meta',
            'ui'           => 1
        ]);

        acf_render_field_setting($field, [
            'label'        => __('Allow Null', 'acf'),
            'instructions' => '',
            'type'         => 'true_false',
            'name'         => 'allow_null',
            'ui'           => 1
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
    *  render_field()
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
        $field['choices'] = [];


        $all_post_types = get_post_types(['public' => true], 'objects');
        $all_post_types = wp_list_pluck($all_post_types, 'name');
        $post_types = is_array($field['post_type']) ? array_diff($all_post_types, $field['post_type']) : array_diff($all_post_types, [$field['post_type']]);
        $allowed_field_types = ['select', 'checkbox', 'radio', 'button_group', 'true_false'];
        
        if($field['text_meta']){
            $allowed_field_types = ['select', 'checkbox', 'radio', 'button_group', 'true_false', 'text', 'textarea', 'number', 'email', 'url', 'range', 'wysiwyg', 'oembed', 'image', 'file', 'date_picker', 'time_picker'];
        }
        
        
        foreach($post_types as $post_type){
            $groups = acf_get_field_groups(['post_type' => $post_type]);

            foreach ($groups as $group_key => $group) {
                $meta_fields = acf_get_fields($group['key']);

                foreach($meta_fields as $meta_field_key => $meta_field){
                    if(!in_array($meta_field['type'], $allowed_field_types)){
                        continue;
                    }
                    $field['choices'][ucwords($post_type)][$meta_field['key']] = $meta_field['label'];
                }
            }
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

        $objects = [];

        if(!$field['multiple']){
            $term = get_taxonomy($value);
            if(!empty($term) && !is_null($term)){
                $objects[] = $term;
            }
        } else {
            foreach ($value as $val){
                $term = get_taxonomy($val);
                if(!empty($term) && !is_null($term)){
                    $objects[] = $term;
                }
            }
        }

        if(!empty($objects) && !is_null($objects[0])){
            if($field['save_format'] === 'object'){
                $value = $objects;
            } elseif($field['save_format'] === 'name'){
                $names = [];
                foreach($objects as $object){
                    $names[] = $object->name;
                }
                $value = $names;
            }
        }

        return $value;
    }
}

new acf_field_post_meta();