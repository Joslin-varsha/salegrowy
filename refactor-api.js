const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

walk(srcDir, (filePath) => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

    // Only process if it contains fetch calls we care about
    if (
      content.includes('fetch(\'/api/') || 
      content.includes('fetch(`/api/') || 
      content.includes('fetch("http://192.168.100.144:3000/api/') ||
      content.includes('fetch(\'http://192.168.100.144:3000/api/')
    ) {
        
        console.log(`Processing ${filePath}`);

        // Add import at the top if not exists
        if (!content.includes('import { API_BASE_URL }')) {
            // calculate relative path to src/config.js
            let relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'config.js'));
            relativePath = relativePath.replace(/\\/g, '/');
            if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
            }
            // Remove the .js extension for imports
            relativePath = relativePath.replace(/\.js$/, '');
            
            // Insert import after the last import line, or at top
            const lines = content.split('\n');
            let lastImportIndex = -1;
            for(let i=0; i<lines.length; i++) {
                 if (lines[i].startsWith('import ')) {
                     lastImportIndex = i;
                 }
            }
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, `import { API_BASE_URL } from '${relativePath}';`);
                content = lines.join('\n');
            } else {
                content = `import { API_BASE_URL } from '${relativePath}';\n` + content;
            }
        }

        // Replace fetch calls
        content = content.replace(/fetch\(\s*['"]\/api\//g, "fetch(`${API_BASE_URL}/api/");
        content = content.replace(/fetch\(\s*`\/api\//g, "fetch(`${API_BASE_URL}/api/");
        content = content.replace(/fetch\(\s*['"]http:\/\/192\.168\.100\.144:3000\/api\//g, "fetch(`${API_BASE_URL}/api/");
        
        // Also replace '/api/vendor/profile', etc in case of fetch(url, ...)
        // To be safe, let's just use the regex above which handles the standard case
        
        // Update dashboard layout specifically which had: await fetch('/api/vendor/profile'
        
        fs.writeFileSync(filePath, content, 'utf8');
    }
    } catch (err) {
        require('fs').writeFileSync('error.log', "Error processing " + filePath + ": " + err.message + "\n" + err.stack);
        process.exit(1);
    }
});

console.log('Refactoring complete.');
