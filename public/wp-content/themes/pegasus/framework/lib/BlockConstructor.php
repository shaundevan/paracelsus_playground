<?php

namespace Pegasus;

/**
 * Class BlockConstructor
 * @author tamasfeiszt
 * @package Pegasus
 */
final class BlockConstructor
{
    /**
     * Strategy all: When a block extended, both back-end and front-end files are created / copied from the vendor.
     */
    const STRATEGY_ALL = 'all';
    /**
     * Strategy frontend: When a block extended, the back-end files are created / copied from the vendor.
     * The block still using the template files from the vendor folder, unless it will copied later by hand.
     */
    const STRATEGY_BACKEND_ONLY = 'backend';

    /**
     * @var string[]
     */
    protected $fieldGroupPrefix = ['Block:', 'Part:'];
    /**
     * @var bool
     */
    public $pagePart = false;
    /**
     * @var string
     */
    public $blockName = '';
    /**
     * @var string
     */
    public $blockLabel = '';
    /**
     * @var string
     */
    public $className = '';
    /**
     * @var string
     */
    public $blockPath = '';
    /**
     * @var array
     */
    public $fieldGroup = [];
    /**
     * @var string
     */
    public $loadPath = '';
    /**
     * @var string
     */
    public $fileName = '';
    /**
     * @var string
     */
    public $sourceFolder = '';
    /**
     * @var string
     */
    public $vendorPackage = '';

    /**
     * @var string
     */
    public $strategy = self::STRATEGY_BACKEND_ONLY;

    /**
     * @param array $fieldGroup
     * @param string $fileName
     * @param string $loadPath
     */
    public function __construct(array $fieldGroup, string $fileName = '', string $loadPath = '')
    {
        // Cache heavy operations
        $cache_key = 'block_constructor_' . md5($fileName . $loadPath);
        $cached_data = wp_cache_get($cache_key);
        
        if (false !== $cached_data) {
            foreach ($cached_data as $property => $value) {
                $this->$property = $value;
            }
            return;
        }

        $this->loadPath = $loadPath;
        $this->fileName = $fileName;
        $this->fieldGroup = $this->prepareAcfJson($fieldGroup);
        $this->fieldGroup['modified'] = time();
        $this->vendorPackage = $this->getVendorPackage($this->loadPath);
        $this->blockName = $this->getBlockCleanName($fieldGroup['title'], $this->fieldGroupPrefix);
        $this->blockLabel = $this->getBlockCleanName($fieldGroup['title'], $this->fieldGroupPrefix, true);
        $this->className = $this->getClassName($this->blockName);
        $this->pagePart = str_starts_with($fieldGroup['title'], 'Part:');
        $this->blockPath = $this->getBlockPath($this->blockName, $this->pagePart);
        if ($strategy = Pegasus::getContainer()->get('Config')->get('block_constructor.strategy')) {
            if ($this->isValidStrategy($strategy)) {
                $this->strategy = $strategy;
            }
        }
        
        // Cache the constructed data
        $cache_data = [
            'loadPath' => $this->loadPath,
            'fileName' => $this->fileName,
            'fieldGroup' => $this->fieldGroup,
            'vendorPackage' => $this->vendorPackage,
            'blockName' => $this->blockName,
            'blockLabel' => $this->blockLabel,
            'className' => $this->className,
            'pagePart' => $this->pagePart,
            'blockPath' => $this->blockPath,
            'strategy' => $this->strategy
        ];
        wp_cache_set($cache_key, $cache_data, '', 3600);
    }

    /**
     * @param $strategy
     * @return bool
     * @author tamasfeiszt
     */
    protected function isValidStrategy($strategy): bool
    {
        return in_array($strategy, [self::STRATEGY_ALL, self::STRATEGY_BACKEND_ONLY]);
    }

    /**
     * @param string $loadPath
     * @return string
     */
    protected function getVendorPackage(string $loadPath): string
    {
        $startPos = (str_contains($loadPath, "vendor/")) ? strpos($loadPath, "vendor/") + strlen("vendor/") : false;
        $endPos = strpos($loadPath, "/src");

        // If "vendor/" and "/src" are found, extract the substring between them
        if ($startPos !== false && $endPos !== false) {
            return substr($loadPath, $startPos, $endPos - $startPos);
        }

        // If either "vendor/" or "/src" is not found, return an empty string
        return "";
    }

    /**
     * @return bool
     * @author tamasfeiszt
     */
    public function createBlock()
    {
        if (!$this->verifyFieldGroup($this->fieldGroup['title'], $this->fieldGroupPrefix)) {
            $this->createAcfJson(get_template_directory() . '/blocks' );
            return false;
        }
        if (!empty($this->blockPath)) {
            $sourceFolder = str_replace('/acf-json/' . $this->fileName, '', $this->loadPath);
            if (!empty($sourceFolder) && file_exists($sourceFolder)) {
                $this->sourceFolder = $sourceFolder;
            }
            if (!$this->initializeBlockFiles()) {
                return false;
            }
        }

        $disable = false;
        if ($this->pagePart) {
            $disable = true;
        } else {
            if (empty($this->sourceFolder)) {
                $this->fieldGroup['location'] = [
                    [
                        [
                            'param' => 'block',
                            'operator' => '==',
                            'value' => 'pegasus/' . strtolower($this->blockName),
                        ],
                    ],
                ];
            }
        }
        $this->createAcfJson(); // Create the acf-json file into the block/BlockName or part/PartName folder
        $this->updateAcfFieldGroup($disable); // Update the field group in the database
        return true;
    }

    /**
     * @param bool $disable
     * @return void
     * @author tamasfeiszt
     */
    public function updateAcfFieldGroup(bool $disable = false)
    {
        $fieldGroup = acf_get_field_group($this->fieldGroup['key']);
        if ($fieldGroup) {
            $this->fieldGroup['ID'] = $fieldGroup['ID'];
        }
        acf_update_field_group($this->fieldGroup);
        if ($disable === true) {
            $this->disableFieldGroup($this->fieldGroup['key']);
        }
    }

    /**
     * @param $id
     * @return true
     * @author tamasfeiszt
     */
    protected function disableFieldGroup($key)
    {
        global $wpdb;
        // Prepare the SQL query using placeholders for safety
        $query = "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND post_name = %s LIMIT 1";
        // Prepare the query with real values to ensure it's safe to execute
        $preparedQuery = $wpdb->prepare($query, 'acf-field-group', $key);

        // Execute the query and get the result
        $post = $wpdb->get_row($preparedQuery);
        if (!$post || $post instanceof \WP_Error) {
            return;
        }
        wp_update_post(['ID' => $post->ID, 'post_status' => 'acf-disabled']);
    }

    /**
     * @param $acfJson
     * @return array|mixed
     * @author tamasfeiszt
     */
    protected function prepareAcfJson($acfJson) {
        if (!is_array($acfJson)) {
            return $acfJson;
        }
        // Iterate through the array
        foreach ($acfJson as $key => &$value) {
            // If the key is 'ID' or starts with '_', unset it
            if ($key === 'ID' || strpos($key, '_') === 0 || $key === 'parent') {
                unset($acfJson[$key]);
            } else {
                // Else, recursively process the value
                $value = $this->prepareAcfJson($value);
            }
        }

        // Return the processed array
        return $acfJson;
    }


    /**
     * @return string
     * @author tamasfeiszt
     */
    public function initializeBlockFiles()
    {
        if (!file_exists($this->blockPath)) {
            if (!mkdir($this->blockPath, 0755, true)) {
                return false;
            }
        }

        return $this->generateBlockFiles();
    }

    /**
     * @return true
     * @author tamasfeiszt
     */
    protected function generateBlockFiles()
    {
        if (empty($this->sourceFolder) || !file_exists($this->sourceFolder)) {
            $requiredFiles = [
                'index.twig',
                '_style.scss',
                'script.js',
            ];

            foreach ($requiredFiles as $file) {
                $filePath = $this->blockPath . '/' . $file;

                if (!file_exists($filePath)) {
                    file_put_contents($filePath, '');
                }
            }
        } else {
            $excludedFiles = [
                'Base' . $this->blockName . '.php',
                'preview.php',
                'block.json',
                'Provider.php',
            ];
            if ($this->strategy === self::STRATEGY_BACKEND_ONLY) {
                $excludedFiles = array_merge($excludedFiles, [
                    'index.twig',
                    '_style.scss',
                    'script.js',
                ]);
            }
            $customFieldFiles = glob($this->sourceFolder . '/*.*');
            foreach ($customFieldFiles as $file) {
                if (in_array(basename($file), $excludedFiles)) {
                    continue;
                }
                $fileName = basename($file);
                $filePath = $this->blockPath . '/' . $fileName;
                if (!file_exists($filePath)) {
                    copy($file, $filePath);
                }
            }
            // copy partials folder if present
            if ($this->strategy !== self::STRATEGY_BACKEND_ONLY) {
                $foldersToCopy = [
                    'partials',
                ];
                $this->copySubFolders($this->sourceFolder, $this->blockPath, $foldersToCopy);
            }
        }

        if ($this->pagePart) {
            // Creating a new part from scaffolding
            return $this->setBlockFunctions();
        } else {
            // Creating a new block from scaffolding
            return ($this->setBlockFunctions() &&
                $this->setBlockProvider() &&
                $this->setBlockPreview() &&
                $this->setBlockJson());
        }
    }

    /**
     * @param string $path
     * @return void
     * @author tamasfeiszt
     */
    protected function createAcfJson(string $path = ''): void
    {
        if (empty($path)) {
            $path = $this->blockPath;
        }
        $path = trailingslashit($path);

        file_put_contents($path . $this->fileName, json_encode($this->fieldGroup, JSON_PRETTY_PRINT));
    }

    /**
     * @return bool
     * @author tamasfeiszt
     */
    protected function setBlockJson()
    {
        $sourceJson = $this->sourceFolder . '/block.json';
        $jsonPath = $this->blockPath . '/block.json';
        $jsonTemplate = (THEME_DIR . '/framework/scaffolding/blocks') . '/block.json.txt';
        clearstatcache();

        if (file_exists($jsonPath) || filesize($jsonPath) || !file_exists($jsonTemplate)) {
            return false;
        }
        if (empty($this->sourceFolder) || !file_exists($this->sourceFolder) || !file_exists($sourceJson)) {
            $jsonTemplateContent = file_get_contents($jsonTemplate);
            $jsonTemplateContent = str_replace('{{ slug }}', strtolower($this->blockName), $jsonTemplateContent);
            $jsonTemplateContent = str_replace('{{ title }}', $this->blockLabel, $jsonTemplateContent);
            $jsonTemplateContent = str_replace('{{ vendor }}', $this->vendorPackage, $jsonTemplateContent);
        } else {
            $jsonTemplateContent = file_get_contents($sourceJson);
            $json = json_decode($jsonTemplateContent, true);
            $json['pegasus'] = [];
            $json['pegasus']['vendor'] = $this->vendorPackage;
            $jsonTemplateContent = json_encode($json, JSON_PRETTY_PRINT);
        }

        file_put_contents($jsonPath, $jsonTemplateContent);

        return true;
    }

    /**
     * @return bool
     * @author tamasfeiszt
     */
    protected function setBlockProvider()
    {
        $scaffold = 'provider.txt';
        if (empty($this->sourceFolder) || !file_exists($this->sourceFolder)){
            $scaffold = 'empty_provider.txt';
        }
        $providerPath = $this->blockPath . '/Provider.php';
        $providerTemplate = ($this->pagePart ? (THEME_DIR . '/framework/scaffolding/parts') : (THEME_DIR . '/framework/scaffolding/blocks')) . '/' . $scaffold;
        clearstatcache();
        if (file_exists($providerPath) || filesize($providerPath) || !file_exists($providerTemplate)) {
            return false;
        }

        $providerTemplateContent = file_get_contents($providerTemplate);
        $providerTemplateContent = str_replace('{{ title }}', $this->className, $providerTemplateContent);
        file_put_contents($providerPath, $providerTemplateContent);

        return true;
    }

    /**
     * @return bool
     * @author tamasfeiszt
     */
    protected function setBlockPreview()
    {
        $previewPath = $this->blockPath . '/preview.php';
        $previewTemplate = ($this->pagePart ? (THEME_DIR . '/framework/scaffolding/parts') : (THEME_DIR . '/framework/scaffolding/blocks')) . '/preview.txt';
        clearstatcache();
        if (file_exists($previewPath) || filesize($previewPath) || !file_exists($previewTemplate)) {
            return false;
        }

        $previewTemplateContent = file_get_contents($previewTemplate);
        $previewTemplateContent = str_replace('{{ title }}', $this->className, $previewTemplateContent);
        file_put_contents($previewPath, $previewTemplateContent);

        return true;
    }

    /**
     * @return bool
     * @author tamasfeiszt
     */
    protected function setBlockFunctions()
    {
        $scaffold = 'class.txt';
        if (empty($this->sourceFolder) || !file_exists($this->sourceFolder)){
            $scaffold = 'empty_class.txt';
        }
        $functionsPath = $this->blockPath . '/' . $this->blockName . '.php';
        if ($this->pagePart) {
            $functionsPath = $this->blockPath . '/functions.php';
        }
        $functionsTemplate = ($this->pagePart ? (THEME_DIR . '/framework/scaffolding/parts') : (THEME_DIR . '/framework/scaffolding/blocks')) . '/' . $scaffold;
        clearstatcache();
        if (file_exists($functionsPath) || filesize($functionsPath) || !file_exists($functionsTemplate)) {
            if (file_exists($functionsPath)) {
                // If the block exists, before we go back with false, we override the local json.
                file_put_contents($this->blockPath . '/' . $this->fileName, json_encode($this->fieldGroup, JSON_PRETTY_PRINT));
            }
            return false;
        }

        $functionsTemplateContent = file_get_contents($functionsTemplate);
        $functionsTemplateContent = str_replace('{{ title }}', $this->className, $functionsTemplateContent);
        $functionsTemplateContent = str_replace('{{ group_json }}', $this->fieldGroup['key'], $functionsTemplateContent);
        file_put_contents($functionsPath, $functionsTemplateContent);

        return true;
    }

    /**
     * @param $name
     * @param $parts
     * @return string
     * @author tamasfeiszt
     */
    protected function getBlockPath($name, $parts = false)
    {
        if ($parts) {
            return THEME_PARTS . '/' . $name;
        }
        return THEME_BLOCKS . '/' . $name;
    }

    /**
     * @param $name
     * @param $prefix
     * @param $title
     * @return array|string|string[]|null
     * @author tamasfeiszt
     */
    protected function getBlockCleanName($name, $prefix, $title = false)
    {
        $cleanName = '';
        if (!is_array($prefix)) {
            $cleanName = str_replace([ucfirst($prefix), strtolower($prefix)], '', $name);
        } else {
            foreach ($prefix as $singlePrefix) {
                $titlePrefix = substr($name, 0, strlen($singlePrefix));
                if ($titlePrefix == ucfirst($singlePrefix) || $titlePrefix == strtolower($singlePrefix)) {
                    $cleanName = str_replace([ucfirst($singlePrefix), strtolower($singlePrefix)], '', $name);
                    break;
                }
            }
        }

        $cleanName = trim($cleanName);
        if ($title) {
            return $cleanName;
        }
        $cleanName = str_replace(' ', '', ucwords($cleanName));
        $cleanName = preg_replace('/[^a-zA-Z0-9_.]/', '-', $cleanName);

        return $cleanName;
    }

    /**
     * @param $title
     * @param $prefix
     * @return bool
     * @author tamasfeiszt
     */
    protected function verifyFieldGroup($title, $prefix)
    {
        if (!is_array($prefix)) {
            $titlePrefix = substr($title, 0, strlen($prefix));
            return $titlePrefix == ucfirst($prefix) || $titlePrefix == strtolower($prefix);
        } else {
            foreach ($prefix as $singlePrefix) {
                $titlePrefix = substr($title, 0, strlen($singlePrefix));
                if ($titlePrefix == ucfirst($singlePrefix) || $titlePrefix == strtolower($singlePrefix)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param $name
     * @return array|string|string[]
     * @author tamasfeiszt
     */
    protected function getClassName($name)
    {
        //replace -,_ and space with space
        $name = str_replace(['-', '_', ' '], ' ', $name);
        return str_replace(' ', '', ucwords($name));
    }

    /**
     * @param string $inputFolder
     * @param string $targetFolder
     * @param array $subFolderNames
     * @return void
     * @throws \Exception
     * @author tamasfeiszt
     */
    protected function copySubFolders(string $inputFolder, string $targetFolder, array $subFolderNames = []): void
    {
        // Append a directory separator to the folder paths if not present
        $inputFolder = rtrim($inputFolder, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $targetFolder = rtrim($targetFolder, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        // Find all sub-folders using glob.
        $folders = glob($inputFolder . '*', GLOB_ONLYDIR);
        if (empty($folders)) {
            return;
        }
        foreach ($folders as $dir) {
            $dirName = basename($dir);

            // Skip, if given folder names are not empty and the current folder is not in the list. Otherwise we copy everything.
            if (!empty($subFolderNames) && !in_array($dirName, $subFolderNames)) {
                continue;
            }

            $destDir = $targetFolder . $dirName;

            // Use a recursive function to copy each sub folder
            $this->recursiveCopy($dir, $destDir);
        }
    }

    /**
     * Recursively copies a source directory to a destination directory.
     *
     * @param string $src The source directory path.
     * @param string $dst The destination directory path.
     * @return void
     * @throws \Exception If the source directory does not exist.
     * @author tamasfeiszt
     */
    protected function recursiveCopy($src, $dst): void
    {
        // Create the destination directory if it does not exist
        if (!file_exists($dst)) {
            mkdir($dst, 0755, true);
        }

        // Open the source directory
        $dir = opendir($src);

        // Copy each file and subdirectory
        while (($file = readdir($dir)) !== false) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . DIRECTORY_SEPARATOR . $file)) {
                    // Recursive copy for directories
                    $this->recursiveCopy($src . DIRECTORY_SEPARATOR . $file, $dst . DIRECTORY_SEPARATOR . $file);
                } else {
                    // Simple copy for files
                    copy($src . DIRECTORY_SEPARATOR . $file, $dst . DIRECTORY_SEPARATOR . $file);
                }
            }
        }

        // Close the source directory
        closedir($dir);
    }
}
