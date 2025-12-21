<?php
/**
*
* Init
*
* @package Pegasus
* @since 2.0
*/

namespace Pegasus;

use Plugandplay\Pegasus\Core\Pegasus as PegasusCore;

/**
 * Class Pegasus
 * @author tamasfeiszt
 * @package Pegasus
 */
final class Pegasus extends PegasusCore
{
    /**
     * @return void
     * @author tamasfeiszt
     */
    public static function init()
    {
        parent::init();
        /**
         * Checking the territory bootstrap, if present then run it.
         * This method will append the territory column and the filter to the post list
         */
        if (static::getContainer()->has('TerritoryBootstrap')) {
            static::getContainer()->get('TerritoryBootstrap', ['post', 'page'])->init();
        }

        /**
         * Any additional init code goes under this line
         */
    }
}