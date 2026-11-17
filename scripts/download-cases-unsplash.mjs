import fs from 'fs';
import path from 'path';
import https from 'https';

const items = [
  { id: '1541807084-5c52b6b3adef', name: 'photo-armor.jpg' },
  { id: '1574755393849-623942496936', name: 'photo-1574.jpg' },
  { id: '1585060544812-6b45742d762f', name: 'photo-1585.jpg' },
  { id: '1565849904461-04a58ad377e0', name: 'photo-1565.jpg' }
];

const tempDir = path.resolve('public/images/temp_inspect');

function download(item) {
  return new Promise((resolve) => {
    const dest = path.join(tempDir, item.name);
    const url = `https://images.unsplash.com/photo-${item.id}?auto=format&fit=crop&w=700&q=80`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
  for (const item of items) {
    await download(item);
    console.log(item.name, fs.existsSync(path.join(tempDir, item.name)) ? fs.statSync(path.join(tempDir, item.name)).size : 'FAIL');
  }
})();

