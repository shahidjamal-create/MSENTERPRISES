import https from 'https';

async function searchUnsplash(query) {
  // Query Unsplash search html
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=10`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`=== Unsplash: "${query}" ===`);
          if (json.results) {
            for (const r of json.results) {
              console.log(r.id, r.alt_description || r.description, r.urls.regular);
            }
          }
        } catch(e) {
          console.error(e.message);
        }
        resolve();
      });
    }).on('error', e => resolve());
  });
}

(async () => {
  await searchUnsplash('phone case stand');
  await searchUnsplash('phone case');
  await searchUnsplash('usb otg adapter');
})();

