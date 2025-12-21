<?php
namespace Pegasus\Lib\Helper;

class EnvironmentHelper {
    /**
     * Check if the current environment is production
     *
     * @return boolean
     */
    public static function isProduction() {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        return !self::isDevelopment($host);
    }

    /**
     * Check if the current environment is development
     *
     * @param string|null $host Optional host to check, defaults to current host
     * @return boolean
     */
    public static function isDevelopment(?string $host = null) {
        $host = $host ?? ($_SERVER['HTTP_HOST'] ?? '');
        
        return strpos($host, 'localhost') !== false 
            || strpos($host, '.lndo.site') !== false 
            || strpos($host, '.local') !== false
            || strpos($host, '.test') !== false
            || strpos($host, '.dev') !== false
            || strpos($host, '.localhost') !== false;
    }

    /**
     * Get current environment name
     *
     * @return string
     */
    public static function getEnvironment() {
        if (self::isDevelopment()) {
            return 'development';
        }
        return 'production';
    }
} 