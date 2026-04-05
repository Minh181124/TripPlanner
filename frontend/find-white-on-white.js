const fs = require('fs');
const path = require('path');

function findConflictingClasses(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            findConflictingClasses(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if ((line.includes('bg-white') && line.includes('text-white'))
                     || (line.includes('bg-[#ffffff]') && line.includes('text-white'))
                     || (line.includes('bg-white') && line.includes('text-[#ffffff]'))) {
                    console.log(`Found on same line in ${fullPath}:${i + 1}`);
                    console.log(line.trim());
                }
            }
            
            // Check cross-line but within same className="" string
            const classNameRegex = /className=["'{`][\s\S]*?["'}`]/g;
            let match;
            while ((match = classNameRegex.exec(content)) !== null) {
                const classStr = match[0];
                if (classStr.includes('bg-white') && classStr.includes('text-white')) {
                    console.log(`Found in same className block in ${fullPath}`);
                    console.log(classStr);
                }
            }
        }
    }
}

findConflictingClasses(path.join(process.cwd(), 'src'));
