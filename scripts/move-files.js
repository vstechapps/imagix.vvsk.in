const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/imagix/browser');
const docsPath = path.join(__dirname, '../docs');

try {
    if (fs.existsSync(docsPath)) {
        fs.rmSync(docsPath, { recursive: true, force: true });
        console.log('Cleaned up existing docs folder.');
    }

    if (fs.existsSync(distPath)) {
        // Ensure parent directory of docsPath exists if we were to move individual files, 
        // but since we are renaming the directory, we just need to make sure the destination parent exists.
        // The destination parent is the root, which exists.

        fs.renameSync(distPath, docsPath);
        console.log('Successfully moved build artifacts from dist/docs-vvsk-in/browser to docs.');

        const indexPath = path.join(docsPath, 'index.html');
        const notFoundPath = path.join(docsPath, '404.html');

        if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, notFoundPath);
            console.log('Successfully copied index.html to 404.html');
        }
    } else {
        console.error('Build directory not found:', distPath);
        process.exit(1);
    }
} catch (err) {
    console.error('Error moving files:', err);
    process.exit(1);
}
