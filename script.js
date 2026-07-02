/**
 * Календар «Книга Українських Свят»
 * Дані свят зберігаються локально, без API.
 */

// --- Дані державних свят України ---
// fixed: true — щорічна фіксована дата; fixed: false — дата прив'язана до року (Великдень)
const HOLIDAYS = [
  {
    name: 'Новий рік',
    month: 1,
    day: 1,
    fixed: true,
    description: 'Перший день нового календарного року. В Україні його зустрічають родиною, з ялинкою, вогниками та взаємними побажаннями щастя.',
  },
  {
    name: 'Різдво Христове (православне)',
    month: 1,
    day: 7,
    fixed: true,
    description: 'Одне з найважливіших християнських свят — народження Ісуса Христа за юліанським календарем. Традиції: святвечір, колядки, богослужіння.',
  },
  {
    name: 'Міжнародний жіночий день',
    month: 3,
    day: 8,
    fixed: true,
    description: 'День вшанування жінок — матерів, доньок, подруг. В Україні це офіційне свято та вихідний день.',
  },
  {
    name: 'Великдень (Пасха)',
    month: 4,
    day: 20,
    fixed: false,
  },
  {
    name: 'День праці',
    month: 5,
    day: 1,
    fixed: true,
    description: 'Міжнародний день солідарності працівників. В Україні — офіційне державне свято та вихідний.',
  },
  {
    name: 'День перемоги над нацизмом у Другій світовій війні',
    month: 5,
    day: 9,
    fixed: true,
    description: 'День пам\'яті та перемоги. Україна вшановує всіх, хто боровся та загинув у боротьбі з нацизмом.',
  },
  {
    name: 'Трійця',
    month: 6,
    day: 8,
    fixed: false,
  },
  {
    name: 'День Конституції України',
    month: 6,
    day: 28,
    fixed: true,
    description: 'Річниця прийняття Основного Закону України у 1996 році. Символ державності, прав і свобод громадян.',
  },
  {
    name: 'День Незалежності України',
    month: 8,
    day: 24,
    fixed: true,
    description: 'Головне національне свято — проголошення незалежності України у 1991 році. Паради, концерти, синьо-жовті прапори.',
  },
  {
    name: 'День захисників і захисниць України',
    month: 10,
    day: 1,
    fixed: true,
    description: 'День вшанування воїнів, волонтерів та всіх, хто захищає Україну. Встановлено на честь Покрови Пресвятої Богородиці.',
  },
  {
    name: 'Різдво Христове (католицьке)',
    month: 12,
    day: 25,
    fixed: true,
    description: 'Святкування Різдва за григоріанським календарем. В Україні — офіційне державне свято з 2017 року.',
  },
];

// Дати Великодня та Трійці для років, коли вони відрізняються від базових у масиві
const MOVABLE_HOLIDAYS = {
  2025: { easter: { month: 4, day: 20 }, trinity: { month: 6, day: 8 } },
  2026: { easter: { month: 4, day: 12 }, trinity: { month: 5, day: 31 } },
  2027: { easter: { month: 5, day: 2 }, trinity: { month: 6, day: 20 } },
  2028: { easter: { month: 4, day: 16 }, trinity: { month: 6, day: 4 } },
};

const EASTER_DESCRIPTION =
  'Воскресіння Христа — головне християнське свято. В Україні: освячення паски, богослужіння, родинні зустрічі та весняні обряди.';

const TRINITY_DESCRIPTION =
  'Свята Трійця (П\'ятдесятниця) — день зіслання Святого Духа. Традиції: зелені гілки, богослужіння, весняне оновлення.';

const WEEKDAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const MONTHS_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

// --- DOM-елементи ---
const todayDateEl = document.getElementById('todayDate');
const monthLabelEl = document.getElementById('monthLabel');
const weekdaysEl = document.getElementById('weekdays');
const calendarDaysEl = document.getElementById('calendarDays');
const nearestHolidayNameEl = document.getElementById('nearestHolidayName');
const nearestHolidayDateEl = document.getElementById('nearestHolidayDate');
const daysLeftEl = document.getElementById('daysLeft');
const daysLeftLabelEl = document.getElementById('daysLeftLabel');
const holidayModal = document.getElementById('holidayModal');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalDesc = document.getElementById('modalDesc');

// Поточний відображуваний місяць (не обов'язково сьогоднішній)
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

// --- Допоміжні функції ---

/** Повертає дату свята для конкретного року */
function getHolidayDate(holiday, year) {
  if (holiday.fixed) {
    return new Date(year, holiday.month - 1, holiday.day);
  }

  const movable = MOVABLE_HOLIDAYS[year];
  if (!movable) return null;

  if (holiday.name.includes('Великдень')) {
    const { month, day } = movable.easter;
    return new Date(year, month - 1, day);
  }

  if (holiday.name.includes('Трійця')) {
    const { month, day } = movable.trinity;
    return new Date(year, month - 1, day);
  }

  return null;
}

/** Опис свята з урахуванням типу */
function getHolidayDescription(holiday) {
  if (holiday.description) return holiday.description;
  if (holiday.name.includes('Великдень')) return EASTER_DESCRIPTION;
  if (holiday.name.includes('Трійця')) return TRINITY_DESCRIPTION;
  return '';
}

/** Усі свята року у вигляді масиву { date, holiday } */
function getHolidaysForYear(year) {
  return HOLIDAYS.map((holiday) => {
    const date = getHolidayDate(holiday, year);
    if (!date) return null;
    return { date, holiday };
  }).filter(Boolean);
}

/** Чи збігаються дві дати (без урахування часу) */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Форматування дати українською */
function formatDateLong(date) {
  return date.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Знайти свято на конкретний день */
function findHolidayOnDate(date) {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);
  return holidays.find((item) => isSameDay(item.date, date)) || null;
}

/** Субота або неділя — офіційний вихідний */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Державне свято = вихідний; субота/неділя теж вихідні */
function isDayOff(date) {
  return isWeekend(date) || findHolidayOnDate(date) !== null;
}

// --- Відображення ---

function renderToday() {
  const today = new Date();
  todayDateEl.textContent = formatDateLong(today);
}

function renderWeekdayHeaders() {
  weekdaysEl.innerHTML = WEEKDAYS_UK.map(
    (day) => `<div class="weekday">${day}</div>`
  ).join('');
}

function renderCalendar() {
  monthLabelEl.textContent = `${MONTHS_UK[viewMonth]} ${viewYear}`;

  const firstDay = new Date(viewYear, viewMonth, 1);
  // Понеділок = 0, неділя = 6 (європейський формат)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();
  const cells = [];

  // Порожні клітинки до першого дня місяця
  for (let i = 0; i < startOffset; i++) {
    cells.push('<div class="day day--empty" role="gridcell"></div>');
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day);
    const holidayEntry = findHolidayOnDate(date);
    const classes = ['day'];
    const isToday = isSameDay(date, today);

    if (isWeekend(date)) classes.push('day--weekend');
    if (holidayEntry) classes.push('day--holiday', 'day--clickable');
    if (isToday) classes.push('day--today');

    const symbol = holidayEntry ? '✦' : '';
    const dataAttr = holidayEntry
      ? `data-holiday="${holidayEntry.holiday.name}" data-year="${viewYear}"`
      : '';

    cells.push(`
      <div class="${classes.join(' ')}" role="gridcell" ${dataAttr} tabindex="${holidayEntry ? '0' : '-1'}">
        <span class="day__num">${day}</span>
        ${symbol ? `<span class="day__symbol">${symbol}</span>` : ''}
      </div>
    `);
  }

  calendarDaysEl.innerHTML = cells.join('');

  // Клік по дню зі святом — відкрити модальне вікно
  calendarDaysEl.querySelectorAll('.day--clickable').forEach((cell) => {
    cell.addEventListener('click', () => openHolidayModal(cell));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openHolidayModal(cell);
      }
    });
  });
}

function openHolidayModal(cell) {
  const name = cell.dataset.holiday;
  const year = Number(cell.dataset.year);
  const holiday = HOLIDAYS.find((h) => h.name === name);
  if (!holiday) return;

  const date = getHolidayDate(holiday, year);
  modalTitle.textContent = holiday.name;
  modalDate.textContent = formatDateLong(date);
  modalDesc.textContent = getHolidayDescription(holiday);
  holidayModal.showModal();
}

/** Найближче майбутнє свято від сьогодні */
function renderNearestHoliday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;

  // Збираємо свята поточного та наступного року
  const allHolidays = [
    ...getHolidaysForYear(currentYear),
    ...getHolidaysForYear(nextYear),
  ];

  const upcoming = allHolidays
    .filter((item) => item.date >= today)
    .sort((a, b) => a.date - b.date);

  if (upcoming.length === 0) {
    nearestHolidayNameEl.textContent = '—';
    nearestHolidayDateEl.textContent = '';
    daysLeftEl.textContent = '—';
    daysLeftLabelEl.textContent = '';
    return;
  }

  const nearest = upcoming[0];
  const diffMs = nearest.date - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  nearestHolidayNameEl.textContent = nearest.holiday.name;
  nearestHolidayDateEl.textContent = formatDateLong(nearest.date);
  daysLeftEl.textContent = diffDays === 0 ? 'Сьогодні!' : diffDays;
  daysLeftLabelEl.textContent =
    diffDays === 0
      ? 'Святкуємо цей день'
      : diffDays === 1
        ? 'день до свята'
        : `днів до свята`;
}

// --- Навігація місяцями ---
document.getElementById('prevMonth').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar();
});

// --- Модальне вікно ---
document.getElementById('modalClose').addEventListener('click', () => {
  holidayModal.close();
});

holidayModal.addEventListener('click', (e) => {
  if (e.target === holidayModal) holidayModal.close();
});

// --- Поширити ---
const SHARE_URL = 'https://calendar-ukr-holidays.netlify.app/';
const SHARE_TITLE = 'Календар Українських Свят';
const SHARE_TEXT = 'Інтерактивний календар національних свят та вихідних України';

function showShareFeedback(btn, label) {
  const originalLabel = 'Поширити';
  const originalAria = btn.getAttribute('aria-label');

  label.textContent = 'Посилання скопійовано!';
  btn.classList.add('share-btn--copied');
  btn.setAttribute('aria-label', 'Посилання скопійовано');

  setTimeout(() => {
    label.textContent = originalLabel;
    btn.classList.remove('share-btn--copied');
    btn.setAttribute('aria-label', originalAria || 'Поширити календар');
  }, 2000);
}

/** Копіювання посилання в буфер (Clipboard API + запасний варіант) */
async function copyShareUrl() {
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    return true;
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = SHARE_URL;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
}

function initShare() {
  const btn = document.getElementById('shareBtn');
  const label = btn.querySelector('.share-btn__label');

  btn.addEventListener('click', async () => {
    const copied = await copyShareUrl();

    if (copied) {
      showShareFeedback(btn, label);
    }

    // Додатково — системне вікно «Поділитися», якщо доступне
    if (navigator.share) {
      try {
        await navigator.share({
          title: SHARE_TITLE,
          text: SHARE_TEXT,
          url: SHARE_URL,
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
      return;
    }

    if (!copied) {
      window.open(SHARE_URL, '_blank', 'noopener');
    }
  });
}

// --- Декоративні частинки на фоні ---
function createParticles() {
  const container = document.getElementById('particles');
  const count = 25;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty('--duration', `${4 + Math.random() * 6}s`);
    particle.style.setProperty('--delay', `${Math.random() * 5}s`);
    container.appendChild(particle);
  }
}

// --- Легкий паралакс зірок при русі миші ---
function initParallax() {
  const far = document.querySelector('.stars--far');
  const near = document.querySelector('.stars--near');

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    far.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    near.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
  });
}

// --- Ініціалізація ---
function init() {
  renderToday();
  renderWeekdayHeaders();
  renderCalendar();
  renderNearestHoliday();
  createParticles();
  initParallax();
  initShare();
}

init();
