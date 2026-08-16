/* Configuration for AutoMarket Maroc */
const svgDataUri = (label, background, foreground, accent = '#0b774b') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stop-color="${background}"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" fill="url(#g)"/>
      <circle cx="110" cy="110" r="68" fill="${foreground}" opacity="0.18"/>
      <path d="M82 238L170 84l88 154h-42l-46-84-46 84H82z" fill="${foreground}" opacity="0.9"/>
      <rect x="250" y="90" width="250" height="130" rx="18" fill="rgba(255,255,255,0.16)"/>
      <text x="374" y="152" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="${foreground}">${label}</text>
      <text x="374" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${foreground}" opacity="0.85">Trusted deals in Morocco</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const CONFIG = {
  dealerName: 'AutoMarket Maroc',
  phone: '+212645823515',
  whatsapp: '+212645823515',
  email: 'info@automarket.ma',
  address: '123 Avenue Mohammed V, Casablanca, Morocco',
  googleMaps: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.0',
  facebook: 'https://facebook.com/automarketmaroc',
  instagram: 'https://instagram.com/automarketmaroc',
  logoPath: svgDataUri('AM', '#e8f5ee', '#0b774b', '#19a974'),
  heroBgPath: svgDataUri('AutoMarket', '#edf3f6', '#102a43', '#19a974')
};
