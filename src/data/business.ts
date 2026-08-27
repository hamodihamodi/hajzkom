import type { BusinessInfo, DayHours } from '../types'

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] as const

function standardWeek(open: string, close: string): DayHours[] {
  return [
    ...DAYS.slice(0, 6).map((day) => ({ day, open, close })),
    { day: DAYS[6] },
  ]
}

function fridayEveningWeek(open: string, close: string): DayHours[] {
  return [
    ...DAYS.slice(0, 6).map((day) => ({ day, open, close })),
    { day: DAYS[6], open: '16:00', close: '22:00' },
  ]
}

export const sampleBusiness: BusinessInfo = {
  name: 'صالون لمسة جمال',
  logoInitial: 'ل',
  description:
    'صالون تجميل نسائي متخصص في العناية بالشعر والبشرة والمكياج، بأيدي خبيرات محترفات وبأجواء أنيقة ومريحة.',
  whatsappNumber: '9647701234567',
  phoneDisplay: '+964 770 123 4567',
  phoneLink: 'tel:+9647701234567',
  socials: {
    instagram: 'https://instagram.com/lamsatjamal',
    facebook: 'https://facebook.com/lamsatjamal',
  },
  locations: [
    {
      id: 'karada',
      name: 'فرع الكرادة',
      description: 'الفرع الرئيسي، غرف خاصة وأجواء هادئة.',
      hours: fridayEveningWeek('10:00', '22:00'),
    },
    {
      id: 'jadriya',
      name: 'فرع الجادرية',
      description: 'فرعنا الجديد بتصميم عصري ومساحات واسعة.',
      hours: standardWeek('09:00', '21:00'),
    },
  ],
  services: [
    { id: 'haircut', name: 'قصّة وتصفيف شعر', durationMin: 45 },
    { id: 'coloring', name: 'صبغة شعر كاملة', durationMin: 90 },
    { id: 'hammam', name: 'حمام مغربي', durationMin: 60 },
    { id: 'manicure', name: 'مانيكير', durationMin: 40 },
    { id: 'pedicure', name: 'باديكير', durationMin: 50 },
    { id: 'makeup', name: 'مكياج سواريه', durationMin: 75 },
  ],
  monthlyLimitReached: false,
}
