<?php

class acf_field_post_taxonomy_terms extends acf_field
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
        $this->name = 'post_terms';
        $this->label = __('Post Terms', 'acf');
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
                'object'	=>	__('Object','acf'),
                'name'		=>	__('Name','acf'),
                'slug'      =>  __('Slug','acf'),
                'id'        =>  __('ID','acf'),
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
            if($taxonomy_key === 'wpmf_tag') {
                continue;
            }
            $choices = [];
            $parent_terms = get_terms([
                'taxonomy' => $taxonomy_key,
                'hide_empty' => false,
                'parent' => 0,
            ]);

            foreach($parent_terms as $key => $parent_term){
                $choices[$parent_term->term_id] = $parent_term->name;

                $this->item_descendants = [];
                $this->get_descendants($taxonomy_key, $parent_term->term_id);

                if(!empty($this->item_descendants)){
                    foreach($this->item_descendants as $descendant){
                        $this->descendant_level = [];
                        $this->get_descendant_level($taxonomy_key, $descendant['term_id']);
                        $choices[$descendant['term_id']] = str_repeat('- ', count($this->descendant_level)).$descendant['name'];
                    }
                }
            }

            $field['choices'][$taxonomy->label] = $choices;

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

    function get_descendants($taxonomy, $parent)
    {

        $terms = get_terms([
            'taxonomy' => $taxonomy,
            'hide_empty' => false,
            'parent' => $parent,
        ]);



        if(!empty($terms)){
            foreach($terms as $key => $term){
                $this->item_descendants[] = [
                    'term_id' => $term->term_id,
                    'name' => $term->name,
                ];

                $this->get_descendants($taxonomy, (int)$term->term_id);

            }
        }

    }

    function get_descendant_level($taxonomy, $term_id)
    {
        $terms = get_terms([
            'taxonomy' => $taxonomy,
            'hide_empty' => false,
        ]);

        foreach($terms as $key => $term){
            if($term->term_id === $term_id){
                if($term->parent != '0'){
                    $this->descendant_level[] = $term->parent;
                    $this->get_descendant_level($taxonomy, (int)$term->parent);
                }
            }
        }
    }

    function format_value($value, $post_id, $field)
    {
        $field = array_merge($this->defaults, $field);

        if (!$value) {
            return false;
        }

        $objects = [];

        if(!$field['multiple']){
            $term = get_term($value);
            if(!empty($term) && !is_null($term)){
                $objects[] = $term;
            }
        } else {
            foreach ($value as $val){
                $term = get_term($val);
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

new acf_field_post_taxonomy_terms();