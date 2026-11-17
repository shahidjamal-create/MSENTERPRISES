import https from 'https';

async function fetchUnsplashSearch(query) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/https:\/\/images\.unsplash\.com\/photo-([0-9a-fA-F-]+)\?[^"'\s]+/g)];
        const ids = [...new Set(matches.map(m => m[1]))].slice(0, 8);
        console.log(`=== Unsplash: "${query}" ===`);
        for (const id of ids) {
          console.log(`photo-${id}`);
        }
        resolve(ids);
      });
    }).on('error', e => {
      console.error(e.message);
      resolve([]);
    });
  });
}

(async () => {
  await fetchUnsplashSearch('usb-c-adapter');
  await fetchUnsplashSearch('phone-case-stand');
  await fetchUnsplashSearch('silicone-phone-case');
  await fetchUnsplashSearch('microsd-card');
})();

