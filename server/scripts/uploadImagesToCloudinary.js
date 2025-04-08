import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sample image URLs for each category
const productImages = {
  'CISCO Switch': [
    'https://www.cisco.com/c/dam/en/us/products/switches/catalyst-9300-series-switches/images/catalyst-9300-series-switches-new.jpg',
    'https://www.cisco.com/c/dam/en/us/products/switches/catalyst-9300-series-switches/images/catalyst-9300-series-switches-back.jpg',
    'https://www.cisco.com/c/dam/en/us/products/switches/catalyst-9300-series-switches/images/catalyst-9300-series-switches-detail.jpg'
  ],
  'Server': [
    'https://i.dell.com/is/image/DellContent/content/dam/global-site-design/product-images/enterprise-systems/poweredge/r750/r750_1.psd?fmt=png-alpha&pscan=auto&scl=1&wid=4000&hei=2600&qlt=100,0&resMode=sharp2&size=4000,2600',
    'https://i.dell.com/is/image/DellContent/content/dam/global-site-design/product-images/enterprise-systems/poweredge/r750/r750_2.psd?fmt=png-alpha&pscan=auto&scl=1&wid=4000&hei=2600&qlt=100,0&resMode=sharp2&size=4000,2600',
    'https://i.dell.com/is/image/DellContent/content/dam/global-site-design/product-images/enterprise-systems/poweredge/r750/r750_3.psd?fmt=png-alpha&pscan=auto&scl=1&wid=4000&hei=2600&qlt=100,0&resMode=sharp2&size=4000,2600'
  ],
  'Monitors': [
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-hero?wid=2560&hei=1440&fmt=jpeg&qlt=95&.v=1572384942877',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-side?wid=2560&hei=1440&fmt=jpeg&qlt=95&.v=1572384942877',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/pro-display-xdr-back?wid=2560&hei=1440&fmt=jpeg&qlt=95&.v=1572384942877'
  ],
  'Logitech World': [
    'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png',
    'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-side-view-graphite.png',
    'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-detail-graphite.png'
  ],
  'Bags': [
    'https://images.samsonite.com/is/image/Samsonite/pro-tech-laptop-backpack-front?$PDPzoom$',
    'https://images.samsonite.com/is/image/Samsonite/pro-tech-laptop-backpack-open?$PDPzoom$',
    'https://images.samsonite.com/is/image/Samsonite/pro-tech-laptop-backpack-detail?$PDPzoom$'
  ],
  'Charger': [
    'https://cdn.shopify.com/s/files/1/0573/5472/7911/products/gan-pro-140w-charger-main.jpg',
    'https://cdn.shopify.com/s/files/1/0573/5472/7911/products/gan-pro-140w-charger-ports.jpg',
    'https://cdn.shopify.com/s/files/1/0573/5472/7911/products/gan-pro-140w-charger-size.jpg'
  ]
};

const downloadImage = async (url, category, index) => {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}-${index}.jpg`;
    const filePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(filePath, response.data);
    return filePath;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    return null;
  }
};

const uploadToCloudinary = async (filePath, category) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `carecorner/${category.toLowerCase().replace(/\s+/g, '-')}`,
      resource_type: 'auto',
    });

    fs.unlinkSync(filePath); // Clean up temp file
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading to Cloudinary:`, error.message);
    return null;
  }
};

const processImages = async () => {
  const cloudinaryUrls = {};

  for (const [category, urls] of Object.entries(productImages)) {
    console.log(`Processing images for ${category}...`);
    cloudinaryUrls[category] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Downloading image ${i + 1} of ${urls.length} for ${category}...`);
      
      const filePath = await downloadImage(url, category, i + 1);
      if (filePath) {
        console.log(`Uploading to Cloudinary...`);
        const cloudinaryUrl = await uploadToCloudinary(filePath, category);
        if (cloudinaryUrl) {
          cloudinaryUrls[category].push(cloudinaryUrl);
        }
      }
    }
  }

  // Save URLs to a JSON file
  const outputPath = path.join(__dirname, 'cloudinaryUrls.json');
  fs.writeFileSync(outputPath, JSON.stringify(cloudinaryUrls, null, 2));
  console.log(`Cloudinary URLs saved to ${outputPath}`);

  // Clean up temp directory
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmdirSync(tempDir, { recursive: true });
  }
};

processImages().catch(console.error); 