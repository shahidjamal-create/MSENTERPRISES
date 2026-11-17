import https from 'https';

function queryWikimedia(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=imageinfo&iiprop=url|mime|size&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'MSEnterprisesBot/1.0 (contact@msenterprises.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? Object.values(json.query.pages) : [];
          console.log(`=== Query: "${query}" ===`);
          for (const p of pages) {
            if (p.imageinfo && p.imageinfo[0]) {
              console.log(p.title, p.imageinfo[0].url);
            }
          }
        } catch (e) {
          console.error(e.message);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.error(e.message);
      resolve();
    });
  });
}

(async () => {
  await queryWikimedia('USB OTG type-c adapter');
  await queryWikimedia('phone case ring stand');
  await queryWikimedia('microSD card adapter');
  await queryWikimedia('mobile phone leather wallet case');
})();

