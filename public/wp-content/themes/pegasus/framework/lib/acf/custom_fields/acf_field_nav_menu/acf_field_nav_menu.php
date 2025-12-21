<?php

class acf_field_nav_menu extends acf_field
{
    // vars
    var $settings, // will hold info such as dir / path
        $defaults, // will hold default field options
        $item_anscestors;

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
        $this->name = 'nav_menu';
        $this->label = __('Nav Menu Items', 'acf');
        $this->category = __("Relational",'acf'); // Basic, Content, Choice, etc
        $this->defaults = array(
            'allow_null' => -1,
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
    function render_field( $field )
    {
        // create Field HTML
        echo sprintf( '<select id="%s" class="%s" name="%s">', $field['id'], $field['class'], $field['name']  );

        // null
        if( $field['allow_null'] )
        {
            echo '<option value=""> - Select - </option>';
        }

        // Nav Menus
        $nav_menus = $this->get_nav_menus();

        foreach( $nav_menus as $nav_menu_id => $nav_menu_name ) {
            echo sprintf( '<optgroup label="%1$s">',$nav_menu_name);
            foreach(wp_get_nav_menu_items($nav_menu_id) as $nav_item_key => $nav_item){
                $this->item_anscestors = [];
                $this->get_descendant_level($nav_menu_id, $nav_item->ID);
                $selected = selected( $field['value'], $nav_item->ID );
                echo sprintf('<option value="%1$d" %3$s>%2$s</option>', $nav_item->ID, str_repeat('- ', count($this->item_anscestors)).$nav_item->title, $selected);
            }
            echo '</optgroup>';
        }

        echo '</select>';
    }

    function get_descendant_level($menu_id, $nav_item_id){
        $menu_items = wp_get_nav_menu_items($menu_id);

        foreach($menu_items as $key => $menu_item){
            if($menu_item->ID === $nav_item_id){
                if($menu_item->menu_item_parent != '0'){
                    $this->item_anscestors[] = $menu_item->menu_item_parent;
                    $this->get_descendant_level($menu_id, (int)$menu_item->menu_item_parent);
                }
            }
        }
    }

    function get_nav_menus() {
        $navs = get_terms('nav_menu', array( 'hide_empty' => false ) );

        $nav_menus = array();
        foreach( $navs as $nav ) {
            $nav_menus[ $nav->term_id ] = $nav->name;
        }

        return $nav_menus;
    }

    function format_value( $value, $post_id, $field )
    {
        // defaults
        $field = array_merge($this->defaults, $field);

        if( !$value ) {
            return false;
        }

        return $value;
    }
}

// create field
new acf_field_nav_menu();