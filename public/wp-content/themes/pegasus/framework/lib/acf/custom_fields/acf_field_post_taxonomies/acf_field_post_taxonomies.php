<?php

class acf_field_post_taxonomies extends acf_field
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
        $this->name = 'post_taxonomies';
        $this->label = __('Post Taxonomies', 'acf');
        $this->category = __("Relational", 'acf'); // Basic, Content, Choice, etc
        $this->defaults = array(
            'affected_by'  => null,
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
            'label'	  => __('Return Format','acf'),
            'type'	  => 'radio',
            'name'	  => 'save_format',
            'layout'  => 'horizontal',
            'choices' =>	[
                'object'	=>	__("Object",'acf'),
                'name'		=>	__("Name",'acf'),
            ]
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

        $taxonomies = get_taxonomies([
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true
        ], 'objects');


        foreach ($taxonomies as $taxonomy_key => $taxonomy) {
            if($taxonomy_key == 'post_format'){
                continue;
            }
            $field['choices'][$taxonomy_key] = $taxonomy->label;
        }

        echo "<div class='acf-field acf-field-select' 
           data-name='{$field['_name']}' 
           data-type='select' 
           data-key='{$field['key']}'";
           if(!empty($field['affected_by'])) {
               echo "data-affected-by = '{$field['affected_by']}' > ";
            } else {
            echo ">";
            }


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

new acf_field_post_taxonomies();