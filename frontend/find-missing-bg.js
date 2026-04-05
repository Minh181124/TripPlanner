const fs = require('fs');
const path = require('path');

function findTextWhiteWithoutBg(dir, results) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            findTextWhiteWithoutBg(fullPath, results);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const classNameRegex = /className=(?:\{`|'|")([^`'"]*text-white[^`'"]*)(?:`\}|'|")/g;
            let match;
            while ((match = classNameRegex.exec(content)) !== null) {
                const classStr = match[1];
                if (!classStr.includes('bg-') && !classStr.includes('from-') && !classStr.includes('to-')) {
                    results.push(`Found missing bg in ${fullPath}`);
                    results.push(`Class: ${classStr}`);
                }
            }
        }
    }
}

const results = [];
findTextWhiteWithoutBg(path.join(process.cwd(), 'src'), results);
fs.writeFileSync('missing-bg-results.txt', results.join('\n'));
