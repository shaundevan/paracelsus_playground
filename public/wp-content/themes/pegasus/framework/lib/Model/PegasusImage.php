<?php

namespace Pegasus\Model;

use Plugandplay\Pegasus\Core\Model\ModelInterface;

class PegasusImage implements ModelInterface
{
    /**
     * @var int
     */
    public $ID;

    /**
     * @var string|array
     */
    public $imageSize;

    /**
     * @var string
     */
    public $baseUrl;

    /**
     * @var string
     */
    public $mime;

    /**
     * @var string
     */
    public $srcset;

    /**
     * @var string
     */
    public $sizes;

    /**
     * @var int
     */
    public $width;

    /**
     * @var int
     */
    public $height;

    /**
     * @var string
     */
    public $alt;

    /**
     * @var string
     */
    public $caption;

    /**
     * @var bool
     */
    protected $inflated = false;

    /**
     * @param int $imgId
     * @return void
     * @author philipmarklew
     */
    public function __construct($imgId, $imageSize = "full")
    {
        $this->ID = $imgId;
        $this->imageSize = $imageSize;
    }

    /**
     * @return array
     * @author philipmarklew
     */
    public function toArray(): array
    {
        if (!$this->inflated) {
            $this->inflate();
        }

        return [
            'id' => $this->ID,
            'base_url' => $this->baseUrl,
            'width' => $this->width,
            'height' => $this->height,
            'mime' => $this->mime,
            'srcset' => $this->srcset,
            'image_sizes' => $this->sizes,
            'alt' => $this->alt,
            'caption' => $this->caption
        ];
    }

    /**
     * @param int $imgId
     * @return array
     * @author philipmarklew
     */
    protected function getImageSizes($imgId): array
    {
        $sizes = get_intermediate_image_sizes();
        $imageSizes = [];

        foreach ($sizes as $size) {
            $src = wp_get_attachment_image_src($imgId, $size);
            if ($src) {
                $imageSizes[$size] = [
                    'url' => $src[0],
                    'width' => $src[1],
                    'height' => $src[2]
                ];
            }
        }

        $full = wp_get_attachment_image_src($imgId, 'full');
        $imageSizes['full'] = [
            'url' => $full[0],
            'width' => $full[1],
            'height' => $full[2]
        ];

        return $imageSizes;
    }

    /**
     * @param int $imgId
     * @return string
     * @author philipmarklew
     */
    protected function getBaseUrl($imgId): string
    {
        $file = get_attached_file($imgId);
        $url = wp_get_attachment_url($imgId);

        $jpg_file = str_replace(".webp", ".jpg", $file);
        $jpeg_file = str_replace(".webp", ".jpeg", $file);
        $png_file = str_replace(".webp", ".png", $file);

        if ('image/webp' === $this->mime) {
            if (file_exists($jpg_file)) {
                return str_replace(".webp", ".jpg", $url);
            } elseif (file_exists($jpeg_file)) {
                return str_replace(".webp", ".jpeg", $url);
            } elseif (file_exists($png_file)) {
                return str_replace(".webp", ".png", $url);
            }
        }

        return $url;
    }

    /**
     * @return bool
     * @author tamasfeiszt
     */
    public function isLoaded(): bool
    {
        return $this->inflated;
    }

    /**
     * @return void
     * @author tamasfeiszt
     */
    public function inflate(): void
    {
        $this->mime = get_post_mime_type($this->ID);
        $this->baseUrl = $this->getBaseUrl($this->ID);
        $this->width = wp_get_attachment_image_src($this->ID, 'full')[1];
        $this->height = wp_get_attachment_image_src($this->ID, 'full')[2];
        $this->srcset = wp_get_attachment_image_srcset($this->ID, $this->imageSize);
        $this->sizes = $this->getImageSizes($this->ID);
        $this->alt = get_post_meta($this->ID, '_wp_attachment_image_alt', true);
        $this->caption = get_post($this->ID)->post_excerpt;

        $this->inflated = true;
    }

    /**
     * @return string
     * @author tamasfeiszt
     */
    public function getId(): string
    {
        return (string) $this->ID;
    }
}
