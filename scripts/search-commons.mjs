import https from 'https';

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'MSEnterprisesBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? Object.values(json.query.pages) : [];
          console.log(`=== "${query}" ===`);
          for (const p of pages) {
            if (p.imageinfo && p.imageinfo[0]) {
              console.log(p.title, p.imageinfo[0].url);
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
  await searchCommons('Type-C OTG');
  await searchCommons('USB Type-C adapter');
  await searchCommons('MicroSD card SanDisk');
  await searchCommons('Smartphone silicone case');
  await searchCommons('Smartphone case ring');
})();

