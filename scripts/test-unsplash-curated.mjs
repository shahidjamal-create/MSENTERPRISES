import https from 'https';

// Curated Unsplash photos of technology & phone accessories
const testList = [
  // USB drives / dongles / adapters / cables / connectors:
  { id: '1618761714958-0abbbc12dd40', desc: 'USB device' },
  { id: '1628155930542-3c7a64e2c833', desc: 'USB flash drive mini metal' },
  { id: '1597872200969-2b65d56bd16b', desc: 'Hardware connector adapter' },
  { id: '1544716278-ca5e3f4abd8c', desc: 'USB memory stick' },
  { id: '1616440347437-b1c73416efc2', desc: 'Small metal tech device' },
  { id: '1541807084-5c52b6b3adef', desc: 'Tech accessory close-up' },
  { id: '1587829741301-dc798b83add3', desc: 'Keyboard and USB peripheral' },
  { id: '1591488320449-011701bb6704', desc: 'Microchip & electronics' },
  { id: '1517336714731-489689fd1ca8', desc: 'MacBook port dongle' },
  { id: '1588508065123-287b28e013da', desc: 'Braided cable' },
  
  // Phone cases:
  { id: '1580910051074-3eb694886505', desc: 'Phone with protective case & stand' },
  { id: '1586105251261-72a756497a11', desc: 'Phone case on wooden table' },
  { id: '1546868871-7041f2a55e12', desc: 'Smart device case' },
  { id: '1574755393849-623942496936', desc: 'iPhone sleek cover' },
  { id: '1598327105666-5b89351aff97', desc: 'Pastel liquid silicone case' },
  { id: '1601784551446-20c9e07cdbdb', desc: 'Phone back cover holder' },
  { id: '1585060544812-6b45742d762f', desc: 'Smartphone modern case' },
  { id: '1592750475338-74b7b21085ab', desc: 'iPhone back stand' },
  { id: '1511707171634-5f897ff02aa9', desc: 'Phone standing on desk' },
  { id: '1565849904461-04a58ad377e0', desc: 'Smartphone holding display' }
];

async function test(p) {
  const url = `https://images.unsplash.com/photo-${p.id}?auto=format&fit=crop&w=700&q=80`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      console.log(`${p.id} | ${res.statusCode} | ${p.desc}`);
      resolve();
    }).on('error', (e) => {
      console.log(`${p.id} | ERR: ${e.message}`);
      resolve();
    });
  });
}

(async () => {
  for (const item of testList) {
    await test(item);
  }
})();

