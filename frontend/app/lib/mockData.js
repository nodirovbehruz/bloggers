// Mock data for the Blogger Association Voting Platform

export const categories = [
  { id: 1, name: 'Лайфстайл', slug: 'lifestyle', image: '/categories/lifestyle.jpg', bloggerCount: 45 },
  { id: 2, name: 'Красота', slug: 'beauty', image: '/categories/beauty.jpg', bloggerCount: 63 },
  { id: 3, name: 'Путешествия', slug: 'travel', image: '/categories/travel.jpg', bloggerCount: 38 },
  { id: 4, name: 'Еда', slug: 'food', image: '/categories/food.jpg', bloggerCount: 52 },
  { id: 5, name: 'Фитнесс', slug: 'fitness', image: '/categories/fitness.jpg', bloggerCount: 41 },
  { id: 6, name: 'Технологии', slug: 'tech', image: '/categories/tech.jpg', bloggerCount: 35 },
  { id: 7, name: 'Музыка', slug: 'music', image: '/categories/music.jpg', bloggerCount: 28 },
  { id: 8, name: 'Юмор', slug: 'humor', image: '/categories/humor.jpg', bloggerCount: 47 },
];

export const bloggers = [
  {
    id: 1,
    name: 'Ruxsora Mirjalilova',
    nickname: '@ruxsora_m',
    category: 'beauty',
    categoryName: 'Красота',
    description: 'Beauty блогер и визажист. Делюсь секретами красоты и макияжа с подписчиками. Люблю эксперименты с образами.',
    votes: 15678,
    rank: 1,
    country: 'UZ',
    avatar: '/bloggers/real1.png',
    socials: {
      instagram: 'https://instagram.com/ruxsora_m',
      youtube: 'https://youtube.com/@ruxsora',
      tiktok: 'https://tiktok.com/@ruxsora_m',
      telegram: 'https://t.me/ruxsora_m',
    }
  },
  {
    id: 2,
    name: 'Lil Khurammov',
    nickname: '@lil_khurammov',
    category: 'lifestyle',
    categoryName: 'Лайфстайл',
    description: 'Lifestyle блогер. Показываю свою жизнь и вдохновляю других на перемены. Контент о моде и стиле жизни.',
    votes: 12534,
    rank: 2,
    country: 'UZ',
    avatar: '/bloggers/real2.png',
    socials: {
      instagram: 'https://instagram.com/lil_khurammov',
      youtube: 'https://youtube.com/@lilkhurammov',
      tiktok: 'https://tiktok.com/@lil_khurammov',
      telegram: 'https://t.me/lil_khurammov',
    }
  },
  {
    id: 3,
    name: 'Diana Sultanova',
    nickname: '@diana_s',
    category: 'travel',
    categoryName: 'Путешествия',
    description: 'Travel блогер. Путешествую по миру и делюсь самыми красивыми местами. Советы для путешественников.',
    votes: 11245,
    rank: 3,
    country: 'UZ',
    avatar: '/bloggers/real3.png',
    socials: {
      instagram: 'https://instagram.com/diana_s',
      youtube: 'https://youtube.com/@diana_sultanova',
      tiktok: 'https://tiktok.com/@diana_s',
      telegram: 'https://t.me/diana_sultanova',
    }
  },
  {
    id: 4,
    name: 'Sardor Rahimov',
    nickname: '@sardor_tech',
    category: 'tech',
    categoryName: 'Технологии',
    description: 'Tech блогер и обзорщик гаджетов. Делаю обзоры на новинки технологий. Советы по выбору техники.',
    votes: 9876,
    rank: 4,
    country: 'UZ',
    avatar: '/bloggers/real4.png',
    socials: {
      instagram: 'https://instagram.com/sardor_tech',
      youtube: 'https://youtube.com/@sardor_tech',
      tiktok: 'https://tiktok.com/@sardor_tech',
      telegram: 'https://t.me/sardor_tech',
    }
  },
  {
    id: 5,
    name: 'Nigora Karimova',
    nickname: '@nigora_fit',
    category: 'fitness',
    categoryName: 'Фитнесс',
    description: 'Фитнес тренер и блогер. Тренировки, питание и мотивация. Помогу вам достичь ваших целей!',
    votes: 8654,
    rank: 5,
    country: 'UZ',
    avatar: '/bloggers/real5.png',
    socials: {
      instagram: 'https://instagram.com/nigora_fit',
      youtube: 'https://youtube.com/@nigora_fitness',
      tiktok: 'https://tiktok.com/@nigora_fit',
      telegram: 'https://t.me/nigora_fit',
    }
  },
  {
    id: 6,
    name: 'Timur Aliyev',
    nickname: '@timur_food',
    category: 'food',
    categoryName: 'Еда',
    description: 'Food блогер и шеф-повар. Рецепты национальной и мировой кухни. Готовлю просто и вкусно!',
    votes: 7832,
    rank: 6,
    country: 'UZ',
    avatar: '/bloggers/real6.png',
    socials: {
      instagram: 'https://instagram.com/timur_food',
      youtube: 'https://youtube.com/@timur_kitchen',
      tiktok: 'https://tiktok.com/@timur_food',
      telegram: 'https://t.me/timur_food',
    }
  },
  {
    id: 7,
    name: 'Aziza Murodova',
    nickname: '@aziza_beauty',
    category: 'beauty',
    categoryName: 'Красота',
    description: 'Бьюти блогер. Обзоры косметики, уходовые средства и секреты красоты для каждой.',
    votes: 6543,
    rank: 7,
    country: 'UZ',
    avatar: '/bloggers/blogger7.jpg',
    socials: {
      instagram: 'https://instagram.com/aziza_beauty',
      youtube: 'https://youtube.com/@aziza_beauty',
      tiktok: 'https://tiktok.com/@aziza_beauty',
      telegram: 'https://t.me/aziza_beauty',
    }
  },
  {
    id: 8,
    name: 'Bekzod Mirzaev',
    nickname: '@bekzod_humor',
    category: 'humor',
    categoryName: 'Юмор',
    description: 'Юмористический блогер. Скетчи, пародии и позитивный контент каждый день!',
    votes: 5234,
    rank: 8,
    country: 'UZ',
    avatar: '/bloggers/blogger8.jpg',
    socials: {
      instagram: 'https://instagram.com/bekzod_humor',
      youtube: 'https://youtube.com/@bekzod_humor',
      tiktok: 'https://tiktok.com/@bekzod_humor',
      telegram: 'https://t.me/bekzod_humor',
    }
  },
  {
    id: 9,
    name: 'Malika Abdullayeva',
    nickname: '@malika_music',
    category: 'music',
    categoryName: 'Музыка',
    description: 'Музыкальный блогер и исполнительница. Каверы, оригинальные песни и закулисье музыкальной индустрии.',
    votes: 4987,
    rank: 9,
    country: 'UZ',
    avatar: '/bloggers/blogger9.jpg',
    socials: {
      instagram: 'https://instagram.com/malika_music',
      youtube: 'https://youtube.com/@malika_music',
      tiktok: 'https://tiktok.com/@malika_music',
      telegram: 'https://t.me/malika_music',
    }
  },
];

export const sponsors = [
  { id: 1, name: 'TechCorp', logo: '/sponsors/sponsor1.svg' },
  { id: 2, name: 'MediaGroup', logo: '/sponsors/sponsor2.svg' },
  { id: 3, name: 'DigitalWave', logo: '/sponsors/sponsor3.svg' },
  { id: 4, name: 'CreativeHub', logo: '/sponsors/sponsor4.svg' },
  { id: 5, name: 'GlobalMedia', logo: '/sponsors/sponsor5.svg' },
  { id: 6, name: 'InnovateTech', logo: '/sponsors/sponsor6.svg' },
];

export const countries = [
  { code: 'UZ', name: 'Узбекистан', flag: '🇺🇿' },
  { code: 'KZ', name: 'Казахстан', flag: '🇰🇿' },
  { code: 'RU', name: 'Россия', flag: '🇷🇺' },
  { code: 'KG', name: 'Кыргызстан', flag: '🇰🇬' },
  { code: 'TJ', name: 'Таджикистан', flag: '🇹🇯' },
  { code: 'TM', name: 'Туркменистан', flag: '🇹🇲' },
];

export const contestInfo = {
  name: 'Blogger Association Voting Platform',
  startDate: '2026-03-01T00:00:00',
  endDate: '2026-04-15T00:00:00',
  totalVotes: 156789,
  totalBloggers: 312,
  totalUsers: 45678,
  isActive: true,
};

export const voteOptions = [
  {
    type: 'free',
    name: 'Бесплатный голос',
    price: 0,
    label: 'FREE',
    description: 'Голосуйте 1 раз в день бесплатно',
    color: 'red',
    icon: '❤️',
  },
  {
    type: 'vip',
    name: 'VIP голос',
    price: 10000,
    label: '10,000 сум',
    description: 'Поддержите блогера VIP голосом',
    color: 'gold',
    icon: '⭐',
  },
];
