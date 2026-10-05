import { TFunction } from 'i18next';
import { Donor } from './DonorFormModal';

export const getDefaultDonors = (t: TFunction): Donor[] => [
  {
    id: '1',
    name: 'Killu Bysmali',
    skinUrl: '/skins/killu.png?v=fixed',
    description: t('donors.profiles.killu'),
    ranks: ['killu'],
  },
  {
    id: '2',
    name: 'Neroferno Ultranix',
    skinUrl: 'https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c',
    description: t('donors.profiles.neroferno'),
    ranks: ['neroferno'],
  },
  {
    id: '3',
    name: 'Lawchihuahua',
    skinUrl: '/skins/law.png',
    description: t('donors.profiles.law'),
    ranks: ['fundador'],
  },
  {
    id: '4',
    name: 'pixiesixer',
    skinUrl: 'https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a',
    description: t('donors.profiles.pixie'),
    ranks: ['fundador'],
  },
  {
    id: '5',
    name: 'Zeta',
    skinUrl: '/skins/zeta.png',
    description: t('donors.profiles.zeta'),
    ranks: ['fundador'],
  },
  {
    id: '6',
    name: 'SendPles',
    skinUrl: 'https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29',
    description: t('donors.profiles.sendples'),
    ranks: ['fundador'],
  },
  {
    id: '7',
    name: 'ZenXeone',
    skinUrl: 'https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041',
    description: t('donors.profiles.zen'),
    ranks: ['donador'],
  },
  {
    id: '8',
    name: 'Churly',
    skinUrl: '/skins/churly.png',
    description: t('donors.profiles.churly'),
    ranks: ['donador', 'developer'],
  },
  {
    id: '9',
    name: 'Nana Fubuki',
    skinUrl: '/skins/nana-fubuki.png',
    description: t('donors.profiles.nana'),
    ranks: ['donador'],
  },
];
