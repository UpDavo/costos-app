export interface VehicleMake {
  name: string;
  models: string[];
}

export const VEHICLE_CATALOG: VehicleMake[] = [
  {
    name: 'Chevrolet',
    models: ['Aveo', 'Captiva', 'Colorado', 'D-MAX', 'Equinox', 'Sail', 'Spark', 'Tracker'],
  },
  {
    name: 'Toyota',
    models: ['Corolla', 'Fortuner', 'Hilux', 'Land Cruiser', 'Prius', 'RAV4', 'Rush', 'Yaris'],
  },
  {
    name: 'Kia',
    models: ['Carnival', 'Cerato', 'Picanto', 'Rio', 'Seltos', 'Sorento', 'Sportage', 'Stinger'],
  },
  {
    name: 'Hyundai',
    models: ['Accent', 'Creta', 'Elantra', 'i10', 'Santa Fe', 'Sonata', 'Tucson'],
  },
  {
    name: 'Mazda',
    models: ['BT-50', 'CX-30', 'CX-5', 'CX-9', 'Mazda2', 'Mazda3', 'Mazda6'],
  },
  {
    name: 'Ford',
    models: ['Bronco', 'EcoSport', 'Escape', 'Explorer', 'F-150', 'Mustang', 'Ranger'],
  },
  {
    name: 'Nissan',
    models: ['Frontier', 'Kicks', 'March', 'Murano', 'Pathfinder', 'Sentra', 'Versa', 'X-Trail'],
  },
  {
    name: 'Volkswagen',
    models: ['Amarok', 'Golf', 'Jetta', 'Passat', 'Polo', 'Taos', 'Tiguan', 'Touareg'],
  },
  {
    name: 'Renault',
    models: ['Duster', 'Jogger', 'Kardian', 'Koleos', 'Logan', 'Sandero', 'Stepway'],
  },
  {
    name: 'Suzuki',
    models: ['Ertiga', 'Grand Vitara', 'Jimny', 'S-Cross', 'Swift', 'Vitara'],
  },
  {
    name: 'Honda',
    models: ['Accord', 'City', 'Civic', 'CR-V', 'Fit', 'HR-V', 'Odyssey', 'Pilot'],
  },
  {
    name: 'Mitsubishi',
    models: ['ASX', 'Eclipse Cross', 'L200', 'Montero', 'Outlander', 'Xpander'],
  },
  {
    name: 'Jeep',
    models: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Renegade', 'Wrangler'],
  },
  {
    name: 'Peugeot',
    models: ['2008', '208', '3008', '408', '5008'],
  },
  {
    name: 'Fiat',
    models: ['Argo', 'Cronos', 'Mobi', 'Pulse', 'Toro'],
  },
  {
    name: 'BYD',
    models: ['Atto 3', 'Dolphin', 'Han', 'Seal', 'Seagull', 'Song Plus', 'Tang', 'Yuan Pro'],
  },
  {
    name: 'Chery',
    models: ['Arrizo 5', 'Omoda 5', 'Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8'],
  },
  {
    name: 'MG',
    models: ['MG3', 'MG5', 'MG ZS', 'MG HS', 'MG4 EV'],
  },
  {
    name: 'JAC',
    models: ['J7', 'JS3', 'JS4', 'T6', 'T8'],
  },
  {
    name: 'Yamaha',
    models: ['Crypton', 'FZ 150i', 'FZ 250', 'MT-03', 'N-MAX', 'SZ 150', 'XTZ 125', 'XTZ 150'],
  },
  {
    name: 'Honda Motos',
    models: ['CB 190R', 'CB 300R', 'CBR 300R', 'Elite 125', 'PCX 150', 'Storm 125', 'XR 150L'],
  },
  {
    name: 'Suzuki Motos',
    models: ['AX4 125', 'GN 125', 'GSX-R 150', 'Gixxer 150', 'Hayabusa', 'V-Strom 650'],
  },
  {
    name: 'Kawasaki',
    models: ['Ninja 400', 'Ninja 650', 'Versys 650', 'W175', 'Z400', 'Z650'],
  },
  {
    name: 'TVS',
    models: ['Apache 160', 'Apache 200', 'King 200', 'Ntorq 125', 'Ronin 225'],
  },
];

export const MAKE_NAMES = VEHICLE_CATALOG.map(m => m.name);

export function getModelsForMake(make: string): string[] {
  return VEHICLE_CATALOG.find(m => m.name === make)?.models ?? [];
}
