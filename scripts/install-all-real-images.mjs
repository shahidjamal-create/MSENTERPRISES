import fs from 'fs';
import path from 'path';
import https from 'https';

const downloads = [
  // 17: OTG Adapter
  {
    target: 'public/images/products/otg.jpg',
    sourceFile: 'public/images/temp_inspect/otg-test.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/USB_OTG_Type-C_Adapter_-_A.jpg',
    desc: 'Metal USB 3.0 to Type-C OTG Adapter'
  },
  // 8: Ring Stand Case
  {
    target: 'public/images/products/case-magnetic-ring.jpg',
    sourceFile: 'public/images/temp_inspect/ring-stand-1.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/HK_finger_rings_for_smartphones_April_2017_IX1_01.jpg',
    desc: 'Magnetic Slim Matte Case with Ring Stand'
  },
  // 7: Liquid Silicone Case (keep distinct from ring stand)
  {
    target: 'public/images/products/case-silicone.jpg',
    sourceFile: 'public/images/products/pouch.jpg',
    desc: 'Liquid Silicone Soft Touch Protective Cover'
  },
  // 5: Armor Case
  {
    target: 'public/images/products/case-armor.jpg',
    sourceFile: 'public/images/temp_inspect/spigen-armor-stand.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Spigen_Tough_Armor_on_iPhone_6_Plus.jpg',
    desc: 'Clear / Hybrid Armor Case'
  },
  // 6: Leather Wallet Cover
  {
    target: 'public/images/products/pouch-leather.jpg',
    sourceFile: 'public/images/temp_inspect/leather-wallet.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Mujjo_iPhone_Wallet_Brown.jpg',
    desc: 'Leather Wallet Flip Cover'
  },
  // 15: Car Air Vent Holder
  {
    target: 'public/images/products/holder.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Car_universal_holder_for_smartphones_and_phablets%2C_Oude_Pekela_%282018%29_01.jpg',
    desc: '360 Rotatable Car Air Vent Phone Holder Mount'
  },
  // 10: 100W Fast Cable
  {
    target: 'public/images/products/cable.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/USB-C_plug%2C_focus_stacked.jpg/800px-USB-C_plug%2C_focus_stacked.jpg',
    desc: 'Braided Type-C Fast Charging Cable'
  },
  // 16: MicroSD Card
  {
    target: 'public/images/products/memorycard.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/SanDisk_Ultra_32GB_MicroSD_card_with_Adapter_-_2015.jpg',
    desc: 'MicroSD Memory Card'
  },
  // 1: 11D Tempered Glass
  {
    target: 'public/images/products/glass-11d.jpg',
    sourceFile: 'public/images/products/glass.jpg',
    desc: '11D Edge-to-Edge Tempered Glass'
  },
  // 2: Privacy Tempered Glass
  {
    target: 'public/images/products/glass-privacy.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/%D9%85%D8%AD%D8%A7%D9%81%D8%B8_%D8%B5%D9%81%D8%AD%D9%87_%D9%86%D9%85%D8%A7%DB%8C%D8%B4_%D8%AD%D8%B1%DB%8C%D9%85_%D8%B4%D8%AE%D8%B5%DB%8C.jpg',
    desc: 'Matte Anti-Glare Privacy Tempered Glass'
  },
  // 3: UV Curved Glass
  {
    target: 'public/images/products/glass-uv.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Tempered_Glass.jpg',
    desc: 'UV Curved Liquid Glue Tempered Glass'
  },
  // 4: Ceramic Glass
  {
    target: 'public/images/products/glass-ceramic.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/IPhone_with_Matte_Screen_Protector_vs._Plain_iPod.jpg',
    desc: 'Ceramic Flexible Unbreakable Screen Guard'
  },
  // 18: MagSafe / Samsung Fast Charging Power Bank
  {
    target: 'public/images/products/powerbank-magnetic.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/SAMSUNG_BATTERY_PACK_%28POWER_BANK%29_EB-P4520.jpg',
    desc: '10,000mAh Magnetic Fast Charging Power Bank'
  },
  // 19: Ultra-Slim Power Bank
  {
    target: 'public/images/products/powerbank-slim.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Portable_power_bank.jpg',
    desc: 'Ultra-Slim 10,000mAh Dual Port Power Bank'
  },
  // 20: iPhone Replacement Battery
  {
    target: 'public/images/products/battery-iphone.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Li_Polymer_Battery_for_iPhone.jpg',
    desc: 'iPhone High-Capacity Replacement Battery'
  },
  // 21: Samsung Replacement Battery
  {
    target: 'public/images/products/battery-samsung.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Samsung_mobile_phone_battery.JPG',
    desc: 'Samsung Galaxy Replacement Battery'
  },
  // 22: Universal Battery Cell
  {
    target: 'public/images/products/battery-universal.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/CMF_Phone_1_battery.jpg',
    desc: 'Universal Mobile Battery Cell'
  }
];

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://commons.wikimedia.org/'
    }}, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => { f.close(); resolve(); });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Installing verified real product images...');
  for (const item of downloads) {
    const dest = path.resolve(item.target);
    if (item.sourceFile && fs.existsSync(item.sourceFile)) {
      fs.copyFileSync(item.sourceFile, dest);
      console.log(`✓ Copied local file to ${item.target} (${fs.statSync(dest).size} bytes) - ${item.desc}`);
    } else if (item.url) {
      try {
        await downloadUrl(item.url, dest);
        console.log(`✓ Downloaded ${item.target} (${fs.statSync(dest).size} bytes) - ${item.desc}`);
      } catch (e) {
        console.error(`✗ Error downloading ${item.target}: ${e.message}`);
      }
    }
  }
  console.log('Finished updating product images.');
}

run();

