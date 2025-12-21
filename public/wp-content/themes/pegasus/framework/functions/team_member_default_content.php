<?php

add_filter( 'default_content', 'team_member_editor_content', 10, 2 );
 
function team_member_editor_content( $content, $post ) {
 
    if($post->post_type != 'team-member'){
        return $content;
    }

    $content = '<!-- wp:pegasus/container {"name":"pegasus/container","data":{"section_width":"container","_section_width":"field_65f9a6675e362","overflow":"","_overflow":"field_65f9a7771d32a","hide_on":"","_hide_on":"field_65f9f0adebc2d","layout_0_viewport":"lg","_layout_0_viewport":"field_661d1ccc3c6ee","layout_0_height_type":"h-fit","_layout_0_height_type":"field_66169d9c72g51","layout":1,"_layout":"field_661d1cae3c6ed","background_video":"","_background_video":"field_66df0a9ae4b13","content_colour":"","_content_colour":"field_65f9f0ade9187","stretch_content_to_fill":"0","_stretch_content_to_fill":"field_66e45cd7cb97c","tablet_layout_rows":"","_tablet_layout_rows":"field_662237c40e2c4","tablet_layout_columns":"","_tablet_layout_columns":"field_662237e00e2c5","tablet_layout":"","_tablet_layout":"field_662237910e2c3","mobile_stacking_stacking_direction":"standard","_mobile_stacking_stacking_direction":"field_6622381a0e2c7","mobile_stacking":"","_mobile_stacking":"field_662237f60e2c6"},"mode":"preview","alignContent":"top","lock":{"move":true,"remove":true},"backgroundColor":"pale-01","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|40"}}}} -->
<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"0"}}}} -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:pegasus/container {"name":"pegasus/container","data":{"section_width":"w-full","_section_width":"field_65f9a6675e362","overflow":"","_overflow":"field_65f9a7771d32a","hide_on":"","_hide_on":"field_65f9f0adebc2d","layout_0_viewport":"lg","_layout_0_viewport":"field_661d1ccc3c6ee","layout_0_height_type":"h-relative","_layout_0_height_type":"field_66169d9c72g51","layout_0_height_relative":"75","_layout_0_height_relative":"field_66169f8972g52","layout_0_unit":"vh","_layout_0_unit":"field_6687c80d45b3a","layout_1_viewport":"sm","_layout_1_viewport":"field_661d1ccc3c6ee","layout_1_height_type":"h-fixed","_layout_1_height_type":"field_66169d9c72g51","layout_1_height_fixed":"550","_layout_1_height_fixed":"field_66169fe572g53","layout":2,"_layout":"field_661d1cae3c6ed","background_video":"","_background_video":"field_66df0a9ae4b13","content_colour":"","_content_colour":"field_65f9f0ade9187","stretch_content_to_fill":"0","_stretch_content_to_fill":"field_66e45cd7cb97c","tablet_layout_rows":"","_tablet_layout_rows":"field_662237c40e2c4","tablet_layout_columns":"","_tablet_layout_columns":"field_662237e00e2c5","tablet_layout":"","_tablet_layout":"field_662237910e2c3","mobile_stacking_stacking_direction":"standard","_mobile_stacking_stacking_direction":"field_6622381a0e2c7","mobile_stacking":"","_mobile_stacking":"field_662237f60e2c6"},"mode":"preview","alignContent":"top","style":{"position":{"type":"sticky","top":"0px"},"spacing":{"padding":{"top":"0"}}}} -->
<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"0"}}}} -->
<div class="wp-block-columns"><!-- wp:column {"width":""} -->
<div class="wp-block-column"><!-- wp:pegasus/container {"name":"pegasus/container","data":{"section_width":"w-full","_section_width":"field_65f9a6675e362","overflow":"","_overflow":"field_65f9a7771d32a","hide_on":"","_hide_on":"field_65f9f0adebc2d","layout_0_viewport":"lg","_layout_0_viewport":"field_661d1ccc3c6ee","layout_0_height_type":"h-relative","_layout_0_height_type":"field_66169d9c72g51","layout_0_height_relative":"75","_layout_0_height_relative":"field_66169f8972g52","layout_0_unit":"vh","_layout_0_unit":"field_6687c80d45b3a","layout_1_viewport":"sm","_layout_1_viewport":"field_661d1ccc3c6ee","layout_1_height_type":"h-fixed","_layout_1_height_type":"field_66169d9c72g51","layout_1_height_fixed":"550","_layout_1_height_fixed":"field_66169fe572g53","layout":2,"_layout":"field_661d1cae3c6ed","background_video":"","_background_video":"field_66df0a9ae4b13","content_colour":"","_content_colour":"field_65f9f0ade9187","stretch_content_to_fill":"0","_stretch_content_to_fill":"field_66e45cd7cb97c","tablet_layout_rows":"","_tablet_layout_rows":"field_662237c40e2c4","tablet_layout_columns":"","_tablet_layout_columns":"field_662237e00e2c5","tablet_layout":"","_tablet_layout":"field_662237910e2c3","mobile_stacking_stacking_direction":"standard","_mobile_stacking_stacking_direction":"field_6622381a0e2c7","mobile_stacking":"","_mobile_stacking":"field_662237f60e2c6"},"mode":"preview","alignContent":"top","lock":{"move":true,"remove":true}} -->
<!-- wp:pegasus/media {"name":"pegasus/media","data":{"media_type":"video_upload","_media_type":"field_65957037dabf3","layout":"object-cover","_layout":"field_6595720bdabf7","image":null,"_image":"field_659570b5dabf4","video_placeholder":"","_video_placeholder":"field_6731cc7d12c18","video_upload":null,"_video_upload":"field_659570dcdabf5","video_options":"","_video_options":"field_6596967bc76c3","round_corners":"0","_round_corners":"field_6731fd51a8dcb","text":"","_text":"field_6731d2e4aba4e"},"mode":"preview","lock":{"move":true,"remove":false},"style":{"dimensions":{"minHeight":"100%"}}} /-->
<!-- /wp:pegasus/container --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"60px","lock":{"move":true,"remove":true}} -->
<div class="wp-block-column" style="flex-basis:60px"></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:pegasus/container --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"border":{"left":{"color":"var:preset|color|mid","width":"1px"},"top":{},"right":{},"bottom":{}}}} -->
<div class="wp-block-column" style="border-left-color:var(--wp--preset--color--mid);border-left-width:1px"><!-- wp:group {"layout":{"type":"default"}} -->
<div class="wp-block-group"><!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"0"}}}} -->
<div class="wp-block-columns"><!-- wp:column {"width":"60px","lock":{"move":true,"remove":true}} -->
<div class="wp-block-column" style="flex-basis:60px"></div>
<!-- /wp:column -->

<!-- wp:column {"width":""} -->
<div class="wp-block-column"><!-- wp:pegasus/container {"name":"pegasus/container","data":{"section_width":"w-full","_section_width":"field_65f9a6675e362","overflow":"","_overflow":"field_65f9a7771d32a","hide_on":"","_hide_on":"field_65f9f0adebc2d","layout_0_viewport":"lg","_layout_0_viewport":"field_661d1ccc3c6ee","layout_0_height_type":"h-relative","_layout_0_height_type":"field_66169d9c72g51","layout_0_height_relative":"75","_layout_0_height_relative":"field_66169f8972g52","layout_0_unit":"vh","_layout_0_unit":"field_6687c80d45b3a","layout_1_viewport":"sm","_layout_1_viewport":"field_661d1ccc3c6ee","layout_1_height_type":"h-fit","_layout_1_height_type":"field_66169d9c72g51","layout":2,"_layout":"field_661d1cae3c6ed","background_video":"","_background_video":"field_66df0a9ae4b13","content_colour":"","_content_colour":"field_65f9f0ade9187","stretch_content_to_fill":"0","_stretch_content_to_fill":"field_66e45cd7cb97c","tablet_layout_rows":"","_tablet_layout_rows":"field_662237c40e2c4","tablet_layout_columns":"","_tablet_layout_columns":"field_662237e00e2c5","tablet_layout":"","_tablet_layout":"field_662237910e2c3","mobile_stacking_stacking_direction":"standard","_mobile_stacking_stacking_direction":"field_6622381a0e2c7","mobile_stacking":"","_mobile_stacking":"field_662237f60e2c6"},"mode":"preview","alignContent":"center","lock":{"move":true,"remove":true}} -->
<!-- wp:heading {"textAlign":"center","level":1,"lock":{"move":true,"remove":true},"fontSize":"xxxx-large"} -->
<h1 class="wp-block-heading has-text-align-center has-xxxx-large-font-size">Team Member Name</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","fontSize":"medium"} -->
<p class="has-text-align-center has-medium-font-size">Team Member Category</p>
<!-- /wp:paragraph -->
<!-- /wp:pegasus/container -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|20"}},"border":{"top":{"color":"var:preset|color|mid","width":"1px"},"right":{},"bottom":{},"left":{}}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="border-top-color:var(--wp--preset--color--mid);border-top-width:1px;padding-top:var(--wp--preset--spacing--20)"><!-- wp:paragraph {"fontSize":"medium"} -->
<p class="has-medium-font-size">Bio</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"48px"} -->
<div style="height:48px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph -->
<p>I work from an integrated perspective, so I explore all angles with my clients. My experience lies in issues such as abuse, trauma, depression, anxiety, anger management and eating disorders. My passion for my work comes from my own family history of addictions and negative cycles, so I can empathise deeply with my clients. I work with adults and children alike to resolve a range of issues in the home, including domestic violence.</p>
<!-- /wp:paragraph -->

<!-- wp:separator {"className":"is-style-default","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"backgroundColor":"mid"} -->
<hr class="wp-block-separator has-text-color has-mid-color has-alpha-channel-opacity has-mid-background-color has-background is-style-default" style="margin-top:var(--wp--preset--spacing--20)"/>
<!-- /wp:separator -->

<!-- wp:paragraph {"fontSize":"medium"} -->
<p class="has-medium-font-size"><br>Credentials</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"48px"} -->
<div style="height:48px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:list {"style":{"spacing":{"margin":{"left":"var:preset|spacing|10"}}},"fontFamily":"body"} -->
<ul style="margin-left:var(--wp--preset--spacing--10)" class="wp-block-list has-body-font-family"><!-- wp:list-item -->
<li>BSc (HONS) in Psychology</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Accredited addiction Counsellor</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>PGCE</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Lecturer of Psychology and Counselling in Cardiff and the Vale College (CAVC)</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Qualified in Systemic Family Therapy, Emotional Focused Therapy, sexual addictions and compulsivity</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Trained Counselling Supervisor.&nbsp;</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Own private practice for over 20 years and has worked in Rehabilitations Internationally</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:spacer {"height":"48px"} -->
<div style="height:48px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:separator {"backgroundColor":"mid"} -->
<hr class="wp-block-separator has-text-color has-mid-color has-alpha-channel-opacity has-mid-background-color has-background"/>
<!-- /wp:separator -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button">See all team</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:pegasus/container -->

<!-- wp:pegasus/container {"name":"pegasus/container","data":{"section_width":"container","_section_width":"field_65f9a6675e362","overflow":"","_overflow":"field_65f9a7771d32a","hide_on":"","_hide_on":"field_65f9f0adebc2d","layout_0_viewport":"lg","_layout_0_viewport":"field_661d1ccc3c6ee","layout_0_height_type":"h-fit","_layout_0_height_type":"field_66169d9c72g51","layout":1,"_layout":"field_661d1cae3c6ed","background_video":"","_background_video":"field_66df0a9ae4b13","content_colour":"","_content_colour":"field_65f9f0ade9187","stretch_content_to_fill":"0","_stretch_content_to_fill":"field_66e45cd7cb97c","tablet_layout_rows":"","_tablet_layout_rows":"field_662237c40e2c4","tablet_layout_columns":"","_tablet_layout_columns":"field_662237e00e2c5","tablet_layout":"","_tablet_layout":"field_662237910e2c3","mobile_stacking_stacking_direction":"standard","_mobile_stacking_stacking_direction":"field_6622381a0e2c7","mobile_stacking":"","_mobile_stacking":"field_662237f60e2c6"},"mode":"preview","alignContent":"top","backgroundColor":"yellow-01","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}} -->
<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column {"width":"33.33%"} -->
<div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:paragraph {"className":"is-style-eyebrow","fontSize":"x-small"} -->
<p class="is-style-eyebrow has-x-small-font-size">EXPERTISE</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"66.66%"} -->
<div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:heading {"fontSize":"xx-large"} -->
<h2 class="wp-block-heading has-xx-large-font-size">“ If you or a loved one are suffering, remember that sometimes things don’t make sense until you take time to work the little things through. Your journey starts with one small step.”</h2>
<!-- /wp:heading -->

<!-- wp:spacer {"height":"32px"} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|20"}}}} -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:pegasus/post-grid {"name":"pegasus/post-grid","data":{"how_to_populate":"pick_posts","_how_to_populate":"field_66420d0c1764d","posts":["817"],"_posts":"field_66420d2e1764e","posts_per_page":"1","_posts_per_page":"field_6627a34279f79","filter_by":"","_filter_by":"field_668d396491792","card_content":["thumbnail","title","tags"],"_card_content":"field_663c7e3945174","taxonomies_to_show":["category"],"_taxonomies_to_show":"field_663ca58b57bad","thumbnail_size":"medium","_thumbnail_size":"field_663ccc71b7206","number_of_columns":"1","_number_of_columns":"field_663c8123cb631","pagination":"","_pagination":"field_662a5f94b2622","no_posts_message":"","_no_posts_message":"field_663c9c198ee38"},"mode":"preview"} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:spacer {"height":"3vw"} -->
<div style="height:3vw" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:pegasus/post-grid {"name":"pegasus/post-grid","data":{"how_to_populate":"pick_posts","_how_to_populate":"field_66420d0c1764d","posts":["804"],"_posts":"field_66420d2e1764e","posts_per_page":"1","_posts_per_page":"field_6627a34279f79","filter_by":"","_filter_by":"field_668d396491792","card_content":["thumbnail","title","tags"],"_card_content":"field_663c7e3945174","taxonomies_to_show":["category"],"_taxonomies_to_show":"field_663ca58b57bad","thumbnail_size":"medium","_thumbnail_size":"field_663ccc71b7206","number_of_columns":"1","_number_of_columns":"field_663c8123cb631","pagination":"","_pagination":"field_662a5f94b2622","no_posts_message":"","_no_posts_message":"field_663c9c198ee38"},"mode":"preview"} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:pegasus/container -->';
 
    return $content;
}
