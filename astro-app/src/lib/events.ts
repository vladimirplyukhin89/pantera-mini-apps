export interface EventMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

export interface ClubEvent {
  id: string;
  emoji: string;
  title: string;
  teaser: string;
  date: string;
  status: 'planned' | 'past';
  body: string;
  media: EventMedia[];
  accentIndex: number;
}

export const events: ClubEvent[] = [
  {
    id: 'open-training-2025',
    emoji: '🏋️',
    title: 'Открытая тренировка',
    teaser: 'Первая открытая тренировка Pantera. Пришли все — от новичков до профи.',
    date: 'Декабрь 2025',
    status: 'past',
    body: `Первая открытая тренировка клуба Pantera прошла на ура. Мы пригласили всех желающих попробовать себя в боксе — от полных новичков до опытных бойцов.\n\nТренировка длилась 2 часа: разминка, работа на мешках, спарринги в лёгком режиме. Каждый получил обратную связь от тренера.\n\nГлавное открытие — не бояться первого шага. Все, кто пришёл в тот день, остались в зале.`,
    media: [
      { type: 'image', src: '/images/jpg/03.jpg', alt: 'Тренировка' },
      { type: 'image', src: '/images/jpg/04.jpg', alt: 'В зале' },
      { type: 'image', src: '/images/jpg/08.jpg', alt: 'Техника' },
      { type: 'image', src: '/images/jpg/09.jpg', alt: 'Работа' },
    ],
    accentIndex: 0,
  },
  {
    id: 'sparring-day-2026',
    emoji: '🥊',
    title: 'Первый спарринг-день',
    teaser: 'День, когда зал превратился в ринг. Честные бои, честные эмоции.',
    date: 'Февраль 2026',
    status: 'past',
    body: `Спарринг-день — это не турнир. Это день, когда каждый может выйти на ринг и проверить себя.\n\nУчаствовали 12 бойцов. Судейство условное, но бои — настоящие. Без злости, без понтов. Чистый бокс и уважение к сопернику.\n\nПосле боёв — разбор с тренером и совместный ужин. Традиция, которая останется с нами.`,
    media: [
      { type: 'image', src: '/images/jpg/06.jpg', alt: 'Спарринг' },
      { type: 'image', src: '/images/jpg/11.jpg', alt: 'Бокс' },
      { type: 'image', src: '/images/jpg/12.jpg', alt: 'На ринге' },
      { type: 'image', src: '/images/jpg/21.jpg', alt: 'Бойцы' },
      { type: 'image', src: '/images/jpg/27.jpg', alt: 'Характер' },
    ],
    accentIndex: 1,
  },
  {
    id: 'pantera-cup',
    emoji: '🥊',
    title: 'Турнир Pantera Cup',
    teaser: 'Первый открытый турнир клуба. Категории от новичков до профи.',
    date: 'Скоро',
    status: 'planned',
    body: `Готовим масштабное событие — первый открытый турнир Pantera Cup. Три весовые категории, судейство по всем правилам, трансляция для тех, кто не сможет быть в зале.\n\nЭто не просто соревнование — это возможность показать, чему научился. Независимо от уровня подготовки. Следи за обновлениями, регистрация откроется совсем скоро.`,
    media: [],
    accentIndex: 0,
  },
  {
    id: 'kids-section',
    emoji: '🐾',
    title: 'Детская секция',
    teaser: 'Запускаем тренировки для самых маленьких пантер. От 7 лет.',
    date: 'В разработке',
    status: 'planned',
    body: `Бокс — это не только про удары. Это про дисциплину, уверенность и умение держать удар (в переносном смысле тоже).\n\nМы готовим программу для детей от 7 лет: безопасные спарринги, работа на координацию, общая физическая подготовка. И, конечно, мерч для маленьких бойцов.`,
    media: [],
    accentIndex: 1,
  },
  {
    id: 'training-camp',
    emoji: '⛺',
    title: 'Выездные сборы',
    teaser: 'Тренировочный лагерь за городом. Природа, спарринги, командный дух.',
    date: 'Лето 2026',
    status: 'planned',
    body: `Представь: утро, свежий воздух, разминка на поляне, а потом спарринги до обеда. После — баня, разбор техники и вечерние посиделки с командой.\n\nВыездные сборы — это про то, чтобы выйти из зоны комфорта и вернуться другим человеком. Детали маршрута и формат прорабатываем.`,
    media: [],
    accentIndex: 2,
  },
  {
    id: 'merch-collection',
    emoji: '🔥',
    title: 'Мерч коллекция',
    teaser: 'Новая линейка одежды Pantera. Не просто мерч, а стиль жизни.',
    date: 'Осень 2026',
    status: 'planned',
    body: `Мы не делаем «просто футболки с логотипом». Каждая вещь — это часть философии клуба. Дизайн, который хочется носить не только в зале.\n\nВ новой коллекции: худи, шорты для тренировок, аксессуары. Всё в фирменных цветах Pantera. Лимитированный тираж — кто успел, тот оделся.`,
    media: [],
    accentIndex: 3,
  },
];

export function getEventById(id: string): ClubEvent | undefined {
  return events.find((e) => e.id === id);
}

export function getPlannedEvents(): ClubEvent[] {
  return events.filter((e) => e.status === 'planned');
}

export function getPastEvents(): ClubEvent[] {
  return events.filter((e) => e.status === 'past');
}
