import https from 'https';

const candidateUrls = [
  // OTG Adapter candidates
  { name: 'otg-1', url: 'https://images.unsplash.com/photo-1618761714958-0abbbc12dd40?auto=format&fit=crop&w=700&q=80' },
  { name: 'otg-2', url: 'https://images.unsplash.com/photo-1622445262464-84b14e3245b3?auto=format&fit=crop&w=700&q=80' },
  { name: 'otg-3', url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=700&q=80' },
  { name: 'otg-4', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80' },
  { name: 'otg-5', url: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=700&q=80' },
  { name: 'otg-6', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=700&q=80' },
  { name: 'otg-7', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80' },
  
  // Magnetic Ring Stand Case candidates
  { name: 'ringcase-1', url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=700&q=80' },
  { name: 'ringcase-2', url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=700&q=80' },
  { name: 'ringcase-3', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80' },
  { name: 'ringcase-4', url: 'https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=700&q=80' },
  
  // Silicone Case candidates
  { name: 'silicone-1', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80' },
  { name: 'silicone-2', url: 'https://images.unsplash.com/photo-1603313011101-320f75742755?auto=format&fit=crop&w=700&q=80' },
  { name: 'silicone-3', url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=700&q=80' }
];

async function check(item) {
  return new Promise((resolve) => {
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      console.log(item.name, res.statusCode, res.headers.location || '');
      resolve();
    }).on('error', (e) => {
      console.log(item.name, 'ERR', e.message);
      resolve();
    });
  });
}

(async () => {
  for (const c of candidateUrls) {
    await check(c);
  }
})();

