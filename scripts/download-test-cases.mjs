import fs from 'fs';
import path from 'path';
import https from 'https';

const testUnsplash = [
  { id: '1580910051074-3eb694886505', name: 'photo-1580910051074.jpg' },
  { id: '1586105251261-72a756497a11', name: 'photo-1586105251261.jpg' },
  { id: '1592750475338-74b7b21085ab', name: 'photo-1592750475338.jpg' },
  { id: '1511707171634-5f897ff02aa9', name: 'photo-1511707171634.jpg' },
  { id: '1598327105666-5b89351aff97', name: 'photo-1598327105666.jpg' },
  { id: '1601784551446-20c9e07cdbdb', name: 'photo-1601784551446.jpg' }
];

const tempDir = path.resolve('public/images/temp_inspect');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

function download(item) {
  return new Promise((resolve) => {
    const dest = path.join(tempDir, item.name);
    const url = `https://images.unsplash.com/photo-${item.id}?auto=format&fit=crop&w=700&q=80`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, r2 => {
          const file = fs.createWriteStream(dest);
          r2.pipe(file);
          file.on('finish', () => { file.close(); resolve(true); });
        });
        return;
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

(async () => {
  for (const item of testUnsplash) {
    const ok = await download(item);
    console.log(item.name, ok ? fs.statSync(path.join(tempDir, item.name)).size : 'FAIL');
  }
})();

