import https from 'https';

const testUrls = [
  { name: 'otg-adapter-a', url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/USB_OTG_Type-C_Adapter_-_A.jpg' },
  { name: 'otg-adapter-c', url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/USB_OTG_Type_C.jpg' },
  { name: 'sandisk-microsd', url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/SanDisk_Ultra_32GB_MicroSD_card_with_Adapter_-_2015.jpg' },
  { name: 'iphone-leather-wallet', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Mujjo_iPhone_Wallet_Brown.jpg' },
  { name: 'magsafe-ring-case', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/IPhone_XR_MagSafe_case_with_Romoss_Power_Bank.jpg' },
  { name: 'iphone-silicone-black', url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Apple_iPhone_17_Silicone_Case_%28Black%29.jpg' },
  { name: 'nord-case', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Protective_phone_case_for_OnePlus_Nord.jpg' }
];

async function checkHeaders(item) {
  return new Promise((resolve) => {
    https.get(item.url, { headers: { 'User-Agent': 'MSEnterprisesBot/1.0' } }, (res) => {
      console.log(item.name, res.statusCode, res.headers['content-type'], res.headers['content-length']);
      resolve();
    }).on('error', e => {
      console.error(item.name, e.message);
      resolve();
    });
  });
}

(async () => {
  for (const t of testUrls) {
    await checkHeaders(t);
  }
})();

