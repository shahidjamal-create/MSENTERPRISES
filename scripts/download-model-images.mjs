import fs from 'fs';
import path from 'path';
import https from 'https';

const modelsDir = path.resolve('public/images/models');
const productsDir = path.resolve('public/images/products');

if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });

const images = [
  // Phone Models Real Images
  {
    name: 'iphone-16-pro.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'iphone-15.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'iphone-14.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'samsung-s24-ultra.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'samsung-s23.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'samsung-a55.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'oneplus-12.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'oneplus-nord.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'redmi-note-13.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'vivo-v30.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'pixel-8.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'realme-12.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80'
  },

  // Brand Badges
  {
    name: 'brand-apple.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'brand-samsung.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'brand-oneplus.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'brand-xiaomi.jpg',
    dir: modelsDir,
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'
  },

  // Additional Real Product Images
  {
    name: 'glass-privacy.jpg',
    dir: productsDir,
    url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'glass-uv.jpg',
    dir: productsDir,
    url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'case-silicone.jpg',
    dir: productsDir,
    url: 'https://images.unsplash.com/photo-1603313011101-320f75742755?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'case-armor.jpg',
    dir: productsDir,
    url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80'
  }
];

function download(item) {
  return new Promise((resolve) => {
    const dest = path.join(item.dir, item.name);
    const getUrl = (u) => {
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          return getUrl(res.headers.location);
        }
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('✓ Downloaded:', item.name, '(' + fs.statSync(dest).size + ' bytes)');
            resolve(true);
          });
        } else if (item.fallbackUrl && u !== item.fallbackUrl) {
          console.log('Retrying with fallback for:', item.name);
          getUrl(item.fallbackUrl);
        } else {
          console.error('✗ Failed:', item.name, 'Status:', res.statusCode);
          resolve(false);
        }
      }).on('error', (err) => {
        console.error('✗ Error downloading:', item.name, err.message);
        resolve(false);
      });
    };
    getUrl(item.url);
  });
}

(async () => {
  console.log('Starting image downloads...');
  for (const item of images) {
    await download(item);
  }
  console.log('Finished downloading model and product images.');
})();

