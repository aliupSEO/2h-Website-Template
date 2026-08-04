const fs = require('fs'); 
const path = require('path');

function walk(dir) { 
    let results = []; 
    const list = fs.readdirSync(dir); 
    list.forEach(file => { 
        file = path.resolve(dir, file); 
        const stat = fs.statSync(file); 
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) { 
            results = results.concat(walk(file)); 
        } else if (file.endsWith('EmptyState.tsx') || file.endsWith('ClientsList.tsx') || file.endsWith('ClientFilesField.tsx')) { 
            results.push(file); 
        } 
    }); 
    return results; 
}

const files = walk('d:/silvio/2h-central-hub-production/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace rounded-full or rounded-xl with rounded-2xl
    content = content.replace(/rounded-(?:full|xl)/g, 'rounded-2xl');
    
    // Replace bg-primary/xx with bg-primary
    content = content.replace(/bg-primary\/\d+/g, 'bg-primary');
    
    // Replace text-primary with text-black (for the icon wrappers)
    // Only where we see the icon wrapper pattern
    content = content.replace(/bg-primary text-primary/g, 'bg-primary text-black');
    
    // Replace ring with a nice glow
    content = content.replace(/ring-1 ring-primary\/\d+/g, 'shadow-[0_0_20px_rgba(198,245,50,0.2)]');
    
    fs.writeFileSync(file, content);
});
console.log('Updated ' + files.length + ' files');
