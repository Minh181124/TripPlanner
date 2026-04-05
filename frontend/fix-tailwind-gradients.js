const fs = require('fs');
const path = require('path');

function replaceInvalidTailwindClasses(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceInvalidTailwindClasses(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('bg-linear-to-')) {
                const newContent = content.replace(/bg-linear-to-/g, 'bg-gradient-to-');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInvalidTailwindClasses(path.join(process.cwd(), 'src'));
console.log('Finished replacing invalid Tailwind gradient classes.');
