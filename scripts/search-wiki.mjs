import https from 'https';

async function searchWiki(term) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=5&pithumbsize=800`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'MSEnterprisesBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? Object.values(json.query.pages) : [];
          console.log(`=== "${term}" ===`);
          for (const p of pages) {
            if (p.thumbnail) {
              console.log(p.title, p.thumbnail.source);
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
  await searchWiki('USB On-The-Go');
  await searchWiki('USB-C');
  await searchWiki('MicroSD');
  await searchWiki('Earphones');
  await searchWiki('Phone case');
})();

