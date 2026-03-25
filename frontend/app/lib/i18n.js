// Internationalization (i18n) system for Blogger Awards
// Supports: ru (Russian), uz (Uzbek), en (English)

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿', short: 'UZ' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
];

const translations = {
  // ===== NAVIGATION =====
  nav_home:        { ru: 'Главная',          uz: 'Bosh sahifa',       en: 'Home' },
  nav_categories:  { ru: 'Категории',        uz: 'Kategoriyalar',     en: 'Categories' },
  nav_leaderboard: { ru: 'Лидерборд',        uz: 'Reyting',           en: 'Leaderboard' },
  nav_register:    { ru: 'Стать участником',  uz: "Ishtirokchi bo'lish", en: 'Become a Participant' },
  nav_profile:     { ru: 'Мой профиль',       uz: 'Mening profilim',   en: 'My Profile' },
  nav_login:       { ru: 'Войти',             uz: 'Kirish',            en: 'Sign In' },

  // ===== HOME PAGE =====
  home_hero_title:     { ru: 'Голосуй за лучших блогеров!',     uz: "Eng yaxshi blogerlarga ovoz bering!", en: 'Vote for the Best Bloggers!' },
  home_hero_subtitle:  { ru: 'Поддержи своего фаворита бесплатно или VIP голосом', uz: "Sevimli blogeringizni bepul yoki VIP ovoz bilan qo'llab-quvvatlang", en: 'Support your favorite blogger with a free or VIP vote' },
  home_vote_now:       { ru: 'Голосовать',           uz: 'Ovoz berish',       en: 'Vote Now' },
  home_all_bloggers:   { ru: 'Все блогеры',          uz: 'Barcha blogerlar',  en: 'All Bloggers' },
  home_top_bloggers:   { ru: 'ТОП блогеры',          uz: 'TOP blogerlar',     en: 'TOP Bloggers' },
  home_categories:     { ru: 'Категории',            uz: 'Kategoriyalar',     en: 'Categories' },
  home_sponsors:       { ru: 'Наши спонсоры',        uz: 'Bizning homiylar',  en: 'Our Sponsors' },
  home_contest_ends:   { ru: 'До конца конкурса',    uz: 'Tanlov tugashiga',  en: 'Contest Ends In' },
  home_view_all:       { ru: 'Смотреть все',         uz: 'Hammasini ko\'rish', en: 'View All' },
  home_ready_title:    { ru: 'Готовы сделать свой выбор?', uz: 'Tanlovingizni qilishga tayyormisiz?', en: 'Ready to Make Your Choice?' },
  home_ready_subtitle: { ru: 'Поддержите своих любимых блогеров прямо сейчас', uz: 'Sevimli blogerlaringizni hoziroq qo\'llab-quvvatlang', en: 'Support your favorite bloggers right now' },
  home_start_voting:   { ru: 'Начать голосование',   uz: 'Ovoz berishni boshlash', en: 'Start Voting' },

  // ===== STATS =====
  stats_bloggers:       { ru: 'Блогеров',      uz: 'Blogerlar',      en: 'Bloggers' },
  stats_votes:          { ru: 'Голосов',        uz: 'Ovozlar',        en: 'Votes' },
  stats_categories:     { ru: 'Категорий',      uz: 'Kategoriyalar',  en: 'Categories' },
  stats_voting:         { ru: 'Голосование',    uz: 'Ovoz berish',    en: 'Voting' },
  stats_24_7:           { ru: '24/7',           uz: '24/7',           en: '24/7' },

  // ===== COUNTDOWN =====
  countdown_days:    { ru: 'дней',   uz: 'kun',   en: 'days' },
  countdown_hours:   { ru: 'часов',  uz: 'soat',  en: 'hours' },
  countdown_minutes: { ru: 'минут',  uz: 'daqiqa', en: 'minutes' },
  countdown_seconds: { ru: 'секунд', uz: 'soniya', en: 'seconds' },

  // ===== LEADERBOARD =====
  leaderboard_title:    { ru: 'Лидерборд',          uz: 'Reyting',            en: 'Leaderboard' },
  leaderboard_subtitle: { ru: 'Рейтинг блогеров',   uz: 'Blogerlar reytingi', en: 'Blogger Rankings' },
  leaderboard_all:      { ru: 'Все',                 uz: 'Hammasi',            en: 'All' },
  leaderboard_votes:    { ru: 'голосов',             uz: 'ovoz',               en: 'votes' },
  leaderboard_rank:     { ru: 'Место',               uz: "O'rin",              en: 'Rank' },

  // ===== BLOGGER PROFILE =====
  blogger_vote:          { ru: 'Голосовать',       uz: 'Ovoz berish',        en: 'Vote' },
  blogger_votes:         { ru: 'голосов',          uz: 'ovoz',               en: 'votes' },
  blogger_rank:          { ru: 'место в рейтинге', uz: 'reytingda o\'rin',   en: 'ranking position' },
  blogger_share:         { ru: 'Поделиться',       uz: 'Ulashish',           en: 'Share' },
  blogger_description:   { ru: 'О блогере',        uz: 'Bloger haqida',      en: 'About Blogger' },
  blogger_social:        { ru: 'Соцсети',          uz: 'Ijtimoiy tarmoqlar', en: 'Social Media' },

  // ===== VOTE MODAL =====
  vote_choose_type:     { ru: 'Выберите тип голоса',          uz: 'Ovoz turini tanlang',            en: 'Choose Vote Type' },
  vote_free:            { ru: 'Бесплатный голос',             uz: 'Bepul ovoz',                     en: 'Free Vote' },
  vote_free_desc:       { ru: '1 голос в день',               uz: 'Kuniga 1 ta ovoz',               en: '1 vote per day' },
  vote_free_btn:        { ru: 'Голосовать бесплатно',         uz: 'Bepul ovoz berish',              en: 'Vote for Free' },
  vote_vip:             { ru: 'VIP голоса',                   uz: 'VIP ovozlar',                    en: 'VIP Votes' },
  vote_vip_desc:        { ru: 'Неограниченно, с оплатой',     uz: "Cheksiz, to'lov bilan",          en: 'Unlimited, with payment' },
  vote_promo:           { ru: 'Промокод от спонсора',         uz: 'Homiy promokodi',                en: 'Sponsor Promo Code' },
  vote_promo_desc:      { ru: 'Бесплатный голос по промокоду', uz: 'Promokod bilan bepul ovoz',     en: 'Free vote with promo code' },
  vote_promo_input:     { ru: 'Введите промокод',             uz: 'Promokodni kiriting',            en: 'Enter promo code' },
  vote_success:         { ru: 'Голос принят!',                uz: 'Ovoz qabul qilindi!',            en: 'Vote accepted!' },
  vote_error:           { ru: 'Ошибка голосования',           uz: 'Ovoz berishda xatolik',          en: 'Voting error' },
  vote_payment_via:     { ru: 'Оплата через:',               uz: "To'lov usuli:",                  en: 'Payment via:' },

  // ===== CATEGORIES PAGE =====
  categories_title:       { ru: 'Категории блогеров',        uz: 'Bloger kategoriyalari',   en: 'Blogger Categories' },
  categories_subtitle:    { ru: 'Выберите категорию',        uz: 'Kategoriyani tanlang',    en: 'Choose a Category' },
  categories_bloggers:    { ru: 'блогеров',                  uz: 'blogerlar',               en: 'bloggers' },

  // ===== AUTH =====
  auth_login_title:    { ru: 'Вход в аккаунт',      uz: 'Akkauntga kirish',      en: 'Sign In' },
  auth_phone:          { ru: 'Номер телефона',       uz: 'Telefon raqami',        en: 'Phone Number' },
  auth_send_code:      { ru: 'Получить код',         uz: 'Kod olish',             en: 'Get Code' },
  auth_enter_code:     { ru: 'Введите код из SMS',   uz: 'SMS dagi kodni kiriting', en: 'Enter SMS code' },
  auth_verify:         { ru: 'Подтвердить',          uz: 'Tasdiqlash',            en: 'Verify' },
  auth_resend:         { ru: 'Отправить повторно',   uz: 'Qayta yuborish',        en: 'Resend' },
  auth_no_account:     { ru: 'Нет аккаунта?',        uz: "Akkauntingiz yo'qmi?",  en: 'No account?' },

  // ===== REGISTER =====
  register_title:      { ru: 'Стать участником',     uz: "Ishtirokchi bo'lish",   en: 'Become a Participant' },
  register_subtitle:   { ru: 'Заполните анкету',     uz: "Anketani to'ldiring",   en: 'Fill in the form' },
  register_fullname:   { ru: 'Полное имя',           uz: "To'liq ism",            en: 'Full Name' },
  register_nickname:   { ru: 'Никнейм',              uz: 'Nikneym',               en: 'Nickname' },
  register_phone:      { ru: 'Телефон',              uz: 'Telefon',               en: 'Phone' },
  register_country:    { ru: 'Страна',               uz: 'Davlat',                en: 'Country' },
  register_category:   { ru: 'Категория',            uz: 'Kategoriya',            en: 'Category' },
  register_desc:       { ru: 'Описание',             uz: 'Tavsif',                en: 'Description' },
  register_avatar:     { ru: 'Аватарка',             uz: 'Avatar',                en: 'Avatar' },
  register_submit:     { ru: 'Отправить заявку',     uz: "Ariza yuborish",        en: 'Submit Application' },
  register_success:    { ru: 'Заявка отправлена!',   uz: 'Ariza yuborildi!',      en: 'Application submitted!' },

  // ===== PROFILE =====
  profile_title:       { ru: 'Мой профиль',         uz: 'Mening profilim',       en: 'My Profile' },
  profile_votes:       { ru: 'Всего голосов',        uz: 'Jami ovozlar',          en: 'Total Votes' },
  profile_free_votes:  { ru: 'Бесплатных',           uz: 'Bepul',                 en: 'Free' },
  profile_paid_votes:  { ru: 'Платных',              uz: "To'lovli",              en: 'Paid' },
  profile_history:     { ru: 'История голосов',      uz: 'Ovozlar tarixi',        en: 'Vote History' },
  profile_paid_tab:    { ru: 'Платные голоса',        uz: "To'lovli ovozlar",      en: 'Paid Votes' },
  profile_application: { ru: 'Заявка блогера',       uz: 'Bloger arizasi',        en: 'Blogger Application' },
  profile_logout:      { ru: 'Выйти',               uz: 'Chiqish',               en: 'Log Out' },
  profile_no_votes:    { ru: 'Вы ещё не голосовали', uz: "Siz hali ovoz bermadingiz", en: "You haven't voted yet" },
  profile_start_vote:  { ru: 'Начать голосование →', uz: 'Ovoz berishni boshlash →', en: 'Start Voting →' },

  // ===== COMMON =====
  loading:       { ru: 'Загрузка...',     uz: 'Yuklanmoqda...',    en: 'Loading...' },
  error:         { ru: 'Ошибка',          uz: 'Xatolik',           en: 'Error' },
  save:          { ru: 'Сохранить',       uz: 'Saqlash',           en: 'Save' },
  cancel:        { ru: 'Отмена',          uz: 'Bekor qilish',      en: 'Cancel' },
  delete:        { ru: 'Удалить',         uz: "O'chirish",         en: 'Delete' },
  edit:          { ru: 'Редактировать',   uz: 'Tahrirlash',        en: 'Edit' },
  close:         { ru: 'Закрыть',         uz: 'Yopish',            en: 'Close' },
  search:        { ru: 'Поиск...',        uz: 'Qidirish...',       en: 'Search...' },
  no_results:    { ru: 'Ничего не найдено', uz: "Hech narsa topilmadi", en: 'Nothing found' },
  back:          { ru: 'Назад',           uz: 'Orqaga',            en: 'Back' },
  next:          { ru: 'Далее',           uz: 'Keyingi',           en: 'Next' },
  submit:        { ru: 'Отправить',       uz: 'Yuborish',          en: 'Submit' },
  votes_count:   { ru: 'голос',           uz: 'ovoz',              en: 'vote' },

  // ===== FOOTER =====
  footer_about:     { ru: 'Платформа для голосования за лучших блогеров', uz: "Eng yaxshi blogerlar uchun ovoz berish platformasi", en: 'Platform for voting for the best bloggers' },
  footer_nav:       { ru: 'Навигация',       uz: 'Navigatsiya',      en: 'Navigation' },
  footer_contact:   { ru: 'Контакты',        uz: 'Kontaktlar',       en: 'Contacts' },
  footer_rights:    { ru: 'Все права защищены', uz: "Barcha huquqlar himoyalangan", en: 'All rights reserved' },

  // ===== ADMIN =====
  admin_dashboard:   { ru: 'Дашборд',          uz: 'Boshqaruv paneli',  en: 'Dashboard' },
  admin_bloggers:    { ru: 'Блогеры',           uz: 'Blogerlar',         en: 'Bloggers' },
  admin_users:       { ru: 'Пользователи',      uz: 'Foydalanuvchilar',  en: 'Users' },
  admin_votes:       { ru: 'Голоса',            uz: 'Ovozlar',           en: 'Votes' },
  admin_payments:    { ru: 'Платежи',           uz: "To'lovlar",         en: 'Payments' },
  admin_categories:  { ru: 'Категории',         uz: 'Kategoriyalar',     en: 'Categories' },
  admin_sponsors:    { ru: 'Спонсоры',          uz: 'Homiylar',          en: 'Sponsors' },
  admin_settings:    { ru: 'Настройки',         uz: 'Sozlamalar',        en: 'Settings' },
  admin_logs:        { ru: 'Логи',              uz: 'Loglar',            en: 'Logs' },
};

/**
 * Get translation for a key in the specified language.
 * Falls back to Russian if key not found for language.
 */
export function t(key, lang = 'ru') {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['ru'] || key;
}

/**
 * Get localized name from an object that has name, name_uz, name_en fields.
 * Used for dynamic data from the API (categories, sponsors, etc.)
 */
export function localizedName(obj, lang = 'ru') {
  if (!obj) return '';
  if (lang === 'uz') return obj.name_uz || obj.name || '';
  if (lang === 'en') return obj.name_en || obj.name || '';
  return obj.name || '';
}

/**
 * Get localized description from an object that has description, description_uz, description_en fields.
 */
export function localizedDesc(obj, lang = 'ru') {
  if (!obj) return '';
  if (lang === 'uz') return obj.description_uz || obj.description || '';
  if (lang === 'en') return obj.description_en || obj.description || '';
  return obj.description || '';
}

export default translations;
