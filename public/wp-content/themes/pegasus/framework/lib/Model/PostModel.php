<?php
namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\AbstractPostType;
use Timber\Timber;

/**
 * Class PostModel
 * @author owendixon
 * @package Pegasus\Model
 */
class PostModel extends AbstractPostType
{
    use TermsTrait;
    use RelatedPostsTrait;
    use TableOfContentsTrait;

    /**
     * @return string
     * @author owendixon
     */
    public static function getPostType(): string
    {
        return 'post';
    }
}
