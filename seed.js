const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kdnwyemjbryypyfugkia.supabase.co';

const SUPABASE_KEY = 'YOUR_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const carsData = [
  {
    brand: 'Volkswagen',
    model: 'Golf 7',
    year: 2016,
    price: 145000,
    mileage: 120000,
    fuel: 'Diesel',
    transmission: 'Manual',
    city: 'Casablanca',
    description: 'Well-maintained Golf 7.',
    status: 'available',
    inspection_status: 'verified',
    guarantee_months: 6
  },
  {
    brand: 'Dacia',
    model: 'Duster',
    year: 2018,
    price: 98000,
    mileage: 95000,
    fuel: 'Diesel',
    transmission: 'Manual',
    city: 'Rabat',
    description: 'Spacious Duster ideal for family use.',
    status: 'available',
    inspection_status: 'verified',
    guarantee_months: 3
  },
  {
    brand: 'Renault',
    model: 'Clio 4',
    year: 2017,
    price: 82000,
    mileage: 88000,
    fuel: 'Essence',
    transmission: 'Automatic',
    city: 'Tangier',
    description: 'Compact and economical Clio 4.',
    status: 'available',
    inspection_status: 'verified',
    guarantee_months: 0
  },

  // زيد هنا باقي السيارات الـ12 بنفس الشكل
];

async function run() {
  const { data, error } = await supabase
    .from('cars')
    .insert(carsData)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ تم إدخال ${data.length} سيارات بنجاح!`);
}

run();