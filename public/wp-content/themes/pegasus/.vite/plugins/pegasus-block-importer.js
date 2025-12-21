import fs from 'fs';
import path from 'path';

function getBlockFiles(dir, callback) {
    const files = fs.readdirSync(dir);

    const isBlock = files.some(file => file === 'block.json');

    if (isBlock) {
        const fullPathFiles = files.map(file => path.join(dir, file));

        callback(fullPathFiles);
    } else {
        for (let file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
        
            if (stats.isDirectory()) {
                getBlockFiles(filePath, callback);
            }
        }
    }
}

export const pegasusBlockImporter = (directories) => {
    return {
        name: 'pegasus-block-importer',
        config() {
            //destination path
            const moduleJsFilePath = path.resolve('assets/scripts/block-imports/modules.js');
            const globalJsFilePath = path.resolve('assets/scripts/block-imports/scripts.js');
            const scssFilePath = path.resolve('assets/styles/block-imports/_styles.scss');
            
            //import statements to be built up
            const moduleJsImports = new Map();
            const globalJsImports = new Map();
            const scssImports = new Map();

            const excludedImports = [];
    
            //loop over dirs and build up import statements
            directories.forEach((dirPath) => {

                if (!fs.existsSync(dirPath)) return;

                getBlockFiles(dirPath, (blockFiles) => {
                    //create a map for easy access of block assets
                    const blockFileMap = blockFiles.reduce((acc, file) => {
                        if (file.includes('block.json')) {
                            acc.json = file;
                        } else if (file.endsWith('module.js')) {
                            acc.moduleJs = file;
                        } else if (file.endsWith('.js')) {
                            acc.js = file;
                        } else if (file.endsWith('.scss')) {
                            acc.scss = file;
                        }
                        return acc;
                    }, {});

                    //building excluded assets to read from later
                    const blockJson = JSON.parse(fs.readFileSync(blockFileMap.json ?? '', 'utf8'));
                    if (blockJson.pegasus && blockJson.pegasus.vendor) {
                        let excludedAssets = {};

                        if (blockFileMap.js || blockFileMap.moduleJs) {
                            excludedAssets.js = path.resolve('vendor/'+blockJson.pegasus.vendor + '/src');
                        }
                        if (blockFileMap.scss) {
                            excludedAssets.scss = path.resolve('vendor/'+blockJson.pegasus.vendor + '/src');
                        }

                        excludedImports.push(excludedAssets);
                    }


                    //building import statements onto respective maps
                    if (blockFileMap.moduleJs) {
                        const moduleName = blockJson?.pegasus?.module?.name ?? blockJson?.title;
                        const relativePath = path.relative(path.dirname(moduleJsFilePath), blockFileMap.moduleJs).replace(/\\/g, '/');
                        moduleJsImports.set(path.dirname(blockFileMap.moduleJs), `${moduleName}: () => import('${relativePath}'),\n`);
                    }
                    if (blockFileMap.js) {
                        const relativePath = path.relative(path.dirname(globalJsFilePath), blockFileMap.js).replace(/\\/g, '/');
                        globalJsImports.set(path.dirname(blockFileMap.js), `import '${relativePath}';\n`);
                    }
                    if (blockFileMap.scss) {
                        const relativePath = path.relative(path.dirname(scssFilePath), blockFileMap.scss).replace(/\\/g, '/');
                        scssImports.set(path.dirname(blockFileMap.scss), `@import '${relativePath}';\n`);
                    }
                });
            });

            // Remove excluded imports from jsImports
            excludedImports.forEach((excludedAsset) => {
                if (excludedAsset.js) {
                    globalJsImports.delete(excludedAsset.js);
                    moduleJsImports.delete(excludedAsset.moduleJs);
                }
                if (excludedAsset.scss) {
                    scssImports.delete(excludedAsset.scss);
                }
            });
    
            //generated file setup
            if (!fs.existsSync(globalJsFilePath)) {
                fs.writeFileSync(globalJsFilePath, '// START GENERATED IMPORTS\n\n  // END GENERATED IMPORTS\n');
            }
            if (!fs.existsSync(moduleJsFilePath)) {
                fs.writeFileSync(moduleJsFilePath, 'export default {\n  // START GENERATED IMPORTS\n\n  // END GENERATED IMPORTS\n}\n');
            }
            if (!fs.existsSync(scssFilePath)) {
                fs.writeFileSync(scssFilePath, '// START GENERATED IMPORTS\n\n// END GENERATED IMPORTS\n');
            }
            
            //update the generated files by injected imports into defined area (in between comments)
            const globalJsFileContent = fs.readFileSync(globalJsFilePath, 'utf-8');
            const updatedGlobalJsContent = globalJsFileContent.replace(/\/\/ START GENERATED IMPORTS[\s\S]*\/\/ END GENERATED IMPORTS/, `// START GENERATED IMPORTS\n${Array.from(globalJsImports.values()).join('')}  // END GENERATED IMPORTS`);
            fs.writeFileSync(globalJsFilePath, updatedGlobalJsContent);

            const moduleJsFileContent = fs.readFileSync(moduleJsFilePath, 'utf-8');
            const updatedJsContent = moduleJsFileContent.replace(/\/\/ START GENERATED IMPORTS[\s\S]*\/\/ END GENERATED IMPORTS/, `// START GENERATED IMPORTS\n${Array.from(moduleJsImports.values()).join('')}  // END GENERATED IMPORTS`);
            fs.writeFileSync(moduleJsFilePath, updatedJsContent);
        
            const scssFileContent = fs.readFileSync(scssFilePath, 'utf-8');
            const updatedScssContent = scssFileContent.replace(/\/\/ START GENERATED IMPORTS[\s\S]*\/\/ END GENERATED IMPORTS/, `// START GENERATED IMPORTS\n${Array.from(scssImports.values()).join('')}  // END GENERATED IMPORTS`);
            fs.writeFileSync(scssFilePath, updatedScssContent);
        },
    }
};
