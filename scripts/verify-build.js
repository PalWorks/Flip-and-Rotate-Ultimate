import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

console.log('🔍 Verifying build...');

if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist directory not found. Run `npm run build` first.');
    process.exit(1);
}

if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Error: manifest.json not found in dist.');
    process.exit(1);
}

let manifest;
try {
    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    manifest = JSON.parse(manifestContent);
    console.log('✅ manifest.json is valid JSON.');
} catch (e) {
    console.error('❌ Error: manifest.json is invalid JSON.');
    process.exit(1);
}

let hasErrors = false;

// Check Background Script
if (manifest.background && manifest.background.service_worker) {
    const bgPath = path.join(DIST_DIR, manifest.background.service_worker);
    if (!fs.existsSync(bgPath)) {
        console.error(`❌ Error: Background script not found: ${manifest.background.service_worker}`);
        hasErrors = true;
    } else {
        console.log(`✅ Background script found: ${manifest.background.service_worker}`);
    }
}

// Check Content Scripts
if (manifest.content_scripts) {
    manifest.content_scripts.forEach((script, index) => {
        if (script.js) {
            script.js.forEach(jsFile => {
                const jsPath = path.join(DIST_DIR, jsFile);
                if (!fs.existsSync(jsPath)) {
                    console.error(`❌ Error: Content script not found: ${jsFile} (in content_scripts[${index}])`);
                    hasErrors = true;
                } else {
                    console.log(`✅ Content script found: ${jsFile}`);
                }
            });
        }
    });
}

// Check Icons
if (manifest.icons) {
    Object.values(manifest.icons).forEach(iconPath => {
        const fullIconPath = path.join(DIST_DIR, iconPath);
        if (!fs.existsSync(fullIconPath)) {
            console.error(`❌ Error: Icon not found: ${iconPath}`);
            hasErrors = true;
        } else {
            console.log(`✅ Icon found: ${iconPath}`);
        }
    });
}

if (hasErrors) {
    console.error('\n💥 Build verification FAILED. Please fix the missing files.');
    process.exit(1);
} else {
    console.log('\n✨ Build verification PASSED!');
    process.exit(0);
}
