import fs from 'fs';
import path from 'path';
import https from 'https';

const downloads = [
  {
    file: 'public/images/products/powerbank-magnetic.jpg',
    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80',
    description: '10,000mAh Magnetic Wireless Power Bank'
  },
  {
    file: 'public/images/products/powerbank-slim.jpg',
    url: 'https://images.unsplash.com/photo-1594535182308-8ffefbb661e1?auto=format&fit=crop&w=700&q=80',
    description: 'Ultra-Slim 10,000mAh Dual USB Power Bank'
  },
  {
    file: 'public/images/products/battery-iphone.jpg',
    url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=700&q=80',
    description: 'iPhone High-Capacity Replacement Battery'
  },
  {
    file: 'public/images/products/battery-samsung.jpg',
    url: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=700&q=80',
    description: 'Samsung Galaxy 5000mAh Replacement Battery'
  },
  {
    file: 'public/images/products/battery-universal.jpg',
    url: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=700&q=80',
    description: 'Universal Mobile Phone Replacement Battery'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading power bank & battery images...');
  for (const item of downloads) {
    try {
      await downloadFile(item.url, item.file);
      const sz = fs.statSync(item.file).size;
      console.log(`✓ ${path.basename(item.file)}: ${sz} bytes (${item.description})`);
    } catch (e) {
      console.error(`✗ Error downloading ${item.file}:`, e.message);
    }
  }
  console.log('Done!');
}

run();

