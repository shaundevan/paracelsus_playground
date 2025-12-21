<?php
/**
*
* Array Helpers
*
* @package Pegasus
* @since 2.0
*/

/**
 * pegasus_array_flatten
 *
 * Description: Reduce a multi-dimensional array down to a flat array.
 *
 * @since 2.0
 *
 * @param array $array The array to flatten
 * @param int   $levels The number of levels in the array to traverse while flattening
 *
 * @return array|mixed $result The flattened array
 */
function pegasus_array_flatten($array, $levels = 0)
{
    if (!is_array($array)) {
        return false;
    }
    $result = array();
    $level = 1;
    foreach ($array as $key => $value) {

        if (is_array($value)) {
            if($levels === 0 || ($levels > 0 && $level < $levels)){
                $result = array_merge($result, pegasus_array_flatten($value));
            } else {
                $result = array_merge($result, $value);
            }
        } else {
            $result = array_merge($result, array($key => $value));
        }

        if($levels > 0){
            $level++;
        }
    }
    return $result;
}


function pegasus_array_key_merge($filtered, $changed) {
    $merged = array_intersect_key($changed, $filtered) + $filtered;
    ksort($merged);
    return $merged;
}
