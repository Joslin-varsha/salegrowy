const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'src', 'automation'),
    path.join(__dirname, 'src', 'aiagent')
];

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
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

targetDirs.forEach(dir => {
    walk(dir, (filePath) => {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;

            // Simple replace for axios.post(..., { ... })
            // To be safe, we will just use a global axios interceptor inside the file, or just add it globally in main.jsx
            // Actually, inserting it globally in main.jsx is infinitely safer and more robust.
        } catch (err) {
            console.error(err);
        }
    });
});
