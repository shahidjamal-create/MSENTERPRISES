import fs from 'fs';
import path from 'path';
import https from 'https';

const downloads = [
  {
    file: 'public/images/products/case-magnetic-ring.jpg',
    url: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=700&q=80',
    description: 'Magnetic ring stand matte case'
  },
  {
    file: 'public/images/products/case-silicone.jpg',
    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80',
    description: 'Liquid silicone soft protective case'
  },
  {
    file: 'public/images/products/case-armor.jpg',
    url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=700&q=80',
    description: 'Clear shockproof armor case'
  },
  {
    file: 'public/images/products/glass-11d.jpg',
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=700&q=80',
    description: '11D edge-to-edge tempered glass'
  },
  {
    file: 'public/images/products/glass-ceramic.jpg',
    url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=700&q=80',
    description: 'Ceramic flexible screen guard'
  },
  {
    file: 'public/images/products/charger.jpg',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80',
    description: '65W GaN fast charger'
  },
  {
    file: 'public/images/products/cable.jpg',
    url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=700&q=80',
    description: 'Braided 100W Type-C cable'
  },
  {
    file: 'public/images/products/earphones.jpg',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80',
    description: 'In-ear wired earphones'
  },
  {
    file: 'public/images/products/headphones.jpg',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    description: 'ANC over-ear wireless headphones'
  },
  {
    file: 'public/images/products/holder.jpg',
    url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=700&q=80',
    description: 'Car phone holder mount'
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
  console.log('Downloading distinct real images...');
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

