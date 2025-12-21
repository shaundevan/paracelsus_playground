<?php

add_filter( 'default_content', 'calendar_event_editor_content', 10, 2 );

function calendar_event_editor_content( $content, $post ) {

    if($post->post_type != 'event'){
        return $content;
    }
    $content = '';

    return $content;
}
