<?php

namespace Pegasus;

use Plugandplay\Pegasus\Core\BaseBlock;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 * Class for implementation of core pegasus twig functions
 *
 * Class Pegasus_Twig_Extension
 * @author tamasfeiszt
 * @package Pegasus
 */
class Pegasus_Twig_Extension extends AbstractExtension
{

    /**
     * @return array
     * @author <Unknown>
     */
    public function getFunctions()
    {
        return [
            new TwigFunction('page_part', [$this, 'page_part'], ['needs_environment' => true, 'needs_context' => true, 'is_safe' => ['all']]),
            new TwigFunction('render_edit_post_link', [$this, 'render_edit_post_link']),
            new TwigFunction('the_block', [$this, 'the_block']),
        ];
    }

    /**
     * Draws a page part
     *
     * @param Environment $env
     * @param $context
     * @param $part_name
     * @param $key
     * @param $vars
     * @return string
     * @author tamasfeiszt
     */
    public function page_part(Environment $env, $context, $part_name, $key = null, $vars = []): string
    {
        if(is_array($part_name)){
            $vars = array_merge($part_name, $vars);
            $part_name = $part_name['acf_fc_layout'];
        }

        $partManager = PartManager::getInstance();

        $part_path = THEME_PARTS . '/' . $part_name;

        if(isset($key) && !empty($key)){
            $part_index = $part_name.'_'.$key;
        } else {
            $part_index = $part_name;
        }

        $partManager->registerPart($part_index, $part_path);
        $part_path = $partManager->getPartFilePath($part_index, 'index.twig');
        $partManager->loadPartFunctions($part_index, $vars);
        $relative_path = ltrim(str_replace(get_template_directory(), '', $part_path), '/');

        if (!is_file($part_path)) {
            return '';
        }

        $part_data = $partManager->getPartData($part_index);

        if($part_data) {
            $vars = array_merge($vars, $part_data);
        }

        $loader = $env->getLoader();
        $loaderPaths = $loader->getPaths();
        $loader->addPath(dirname($part_path));

        $output = '';

        try {
            $template = $env->load($relative_path);
            $output = $template->render(array_merge($context, $vars));
        } catch (LoaderError $e) {
            trigger_error($e, E_USER_WARNING);
        }

        $loader->setPaths($loaderPaths);
        return $output;
    }

    /**
     * Draws an edit post link
     *
     * @param $post_id
     * @param $text
     * @param $before
     * @param $after
     * @param $id
     * @param $class
     * @return void
     * @author <Unknown>
     */
    public function render_edit_post_link($post_id, $text = null, $before = '', $after = '', $id = 0, $class = 'post-edit-link'): void
    {
        if (!$post_id || !is_int($post_id)) {
            return;
        }

        $url = get_edit_post_link($post_id);
        if ( ! $url ) {
            return;
        }

        if ( null === $text ) {
            $text = __( 'Edit This' );
        }

        $link = '<a class="' . esc_attr( $class ) . '" href="' . esc_url( $url ) . '" target="_blank" tabindex="-1" aria-label="'.__("Edit this page", "pegasus").'">' . $text . '</a>';

        /**
         * Filters the post edit link anchor tag.
         *
         * @since 2.3.0
         *
         * @param string $link    Anchor tag for the edit link.
         * @param int    $post_id Post ID.
         * @param string $text    Anchor text.
         */
        echo $before . apply_filters( 'edit_post_link', $link, $post_id, $text ) . $after;
    }

    /**
     * Renders a block with given variables and view
     *
     * @param string $name
     * @param array $vars
     * @param string $view
     * @return void
     * @throws \Psr\Cache\InvalidArgumentException
     * @author tamasfeiszt
     */
    public function the_block(string $name, array $vars = [], string $view = ''): void
    {
        if (!Pegasus::getContainer()->has($name)) {
            trigger_error("Block '{$name}' not found", E_USER_WARNING);
        }
        /** @var BaseBlock $block */
        $block = Pegasus::getContainer()->get($name, [
            'name' => $name,
            'data' => $vars
        ], $vars);
        try {
            $block->renderView($view);
        } catch (\Exception $e) {
            trigger_error($e, E_USER_WARNING);
        }
    }
}
