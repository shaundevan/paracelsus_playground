<?php
namespace Pegasus;

use Plugandplay\Pegasus\Core\Cache\CacheFactory;
use Plugandplay\Pegasus\Core\PegasusSingletonTrait;

/**
 * Class MediaClearerCacheFactory
 * @author tamasfeiszt
 * @package Pegasus
 */
class MediaClearerCacheFactory extends CacheFactory
{
    use PegasusSingletonTrait;
    public static function isCacheEnabled(string $flag = ''): bool
    {
        // No cache if logged in as admin
        if (static::isEnvironmentCacheable()) {
            switch ($flag) {
                case static::BLOCK_CACHE_FLAG:
                    // Check if caching blocks is disabled.
                    return !static::isBlockCacheDisabled();
                case static::MODEL_CACHE_FLAG:
                    // check if caching models is disabled
                    return !static::isModelCacheDisabled();
                default:
                    return true; // We got no flag, so this is a custom cache, or an older project. If environment enabled we cache.
            }
        }
        return false;
    }
}
