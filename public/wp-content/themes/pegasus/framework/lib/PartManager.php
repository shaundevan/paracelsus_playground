<?php
namespace Pegasus;

use Plugandplay\Pegasus\Core\PegasusSingletonInterface;
use Plugandplay\Pegasus\Core\PegasusSingletonTrait;

/**
 * This basically manages the old school functional parts of the theme.
 *
 * Class PartManager
 * @author tamasfeiszt
 * @package Pegasus
 */
final class PartManager implements PegasusSingletonInterface
{
    use PegasusSingletonTrait;
    /**
     * @var array $parts
     */
    protected array $parts = [];

    /**
     * @return void
     * @author tamasfeiszt
     */
    private function __construct()
    {
    }

    /**
     * @param string $name
     * @param string $path
     * @return bool
     * @author tamasfeiszt
     */
    public function registerPart(string $name, string $path): bool
    {
        if(array_key_exists($name, $this->parts)){
            return false;
        }

        // Make sure the part path ends with a slash
        $path = trailingslashit($path);

        $this->addPart($name, $path);

        return true;
    }

    /**
     * @param string $name
     * @param string $path
     * @return void
     * @author tamasfeiszt
     */
    public function addPart(string $name, string $path): void
    {
        $this->parts[$name] = [
            'path' => $path,
        ];
    }

    /**
     * @param string $name
     * @return string|bool
     * @author tamasfeiszt
     */
    public function getPartDirectory(string $name): string|bool
    {
        if(!isset($this->parts[$name]['path']))
        {
            trigger_error("Can't find part '{$name}' has it been registered?", E_USER_WARNING);
            return false;
        }

        $dir = $this->parts[$name]['path'];

        return $dir;
    }

    /**
     * @param string $name
     * @param string $fileName
     * @return string|bool
     * @author tamasfeiszt
     */
    public function getPartFilePath(string $name, string $fileName): string|bool
    {
        $dir = $this->getPartDirectory($name);

        if(!file_exists($dir)){
            return false;
        }

        $dir = $dir . $fileName;

        return $dir;
    }

    /**
     * @param string $name
     * @param array $vars
     * @return true
     * @author tamasfeiszt
     */
    public function loadPartFunctions(string $name, array $vars = [])
    {
        $functions_path = $this->getPartFilePath($name, 'functions.php');

        if(file_exists($functions_path)){
            $key = $name; // The part name is unique so we'll use it as a key to access it elsewhere.
            $field = $vars; // These are the standard ACF fields which we need to make accessible from the functions file.
            include $functions_path; // You will run the application logic at this point! TODO: some cache would be great.
        }
        return true;
    }

    /**
     * @param string $name
     * @param array $data
     * @return array|string[]
     * @author tamasfeiszt
     */
    public function setPartData(string $name, array $data = []): array
    {
        if(!array_key_exists($name, $this->parts)) {
            trigger_error("Can't find Part '{$name}' has it been registered?", E_USER_WARNING);
            return [];
        };

        $partData = [
            'part_name' => $name,
        ];

        $this->parts[$name]['data'] = array_merge($partData, $data);

        return $partData;
    }

    /**
     * @param string $name
     * @return array
     * @author tamasfeiszt
     */
    public function getPartData(string $name): array
    {
        if(!array_key_exists($name, $this->parts)) {
            trigger_error("Can't find Component '{$name}' has it been registered?", E_USER_WARNING);
            return [];
        };

        return $this->parts[$name]['data'] ?? [];
    }

    /**
     * @return array
     * @author tamasfeiszt
     */
    public function getAllParts(): array
    {
        return $this->parts;
    }
}
