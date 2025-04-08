import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files to remove
const filesToRemove = [
  '../data/products.js',
  './seedProducts.js',
  './seedDB.js',
  './scrapeProducts.js',
  './checkProducts.js',
  './checkFeaturedProducts.js',
  './checkFeaturedProductsCollection.js',
  './clearProducts.js',
  './updateFeaturedProducts.js'
];

console.log('🚀 Starting mock data removal...');

let removedCount = 0;
let skippedCount = 0;

// Remove each file
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
      removedCount++;
    } else {
      console.log(`⚠️ Skipped (not found): ${file}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error removing ${file}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Removed: ${removedCount} files`);
console.log(`- Skipped: ${skippedCount} files`);
console.log(`- Total: ${filesToRemove.length} files`);

console.log('\n✅ Mock data removal completed!'); 