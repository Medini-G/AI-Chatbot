/* ============================================================
   data.js — the "backend". All state lives in localStorage.
   Every page includes this file first.
   ============================================================ */

const DB = {
  EVENTS: 'em_events',
  USERS: 'em_users',
  BOOKINGS: 'em_bookings',
  FEEDBACK: 'em_feedback',
  MESSAGES: 'em_messages',
  SESSION: 'em_session',
  THEME: 'em_theme',
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------- generic read/write ---------- */
function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}
function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

/* ---------- seed data (first run only) ---------- */
function seedIfEmpty() {
  if (!localStorage.getItem(DB.EVENTS)) {
    const today = new Date();
    const inDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0, 10);
    };

    writeList(DB.EVENTS, [
      {
        id: uid(), title: 'Midnight Jazz Sessions', category: 'Music',
        description: 'An intimate late-night jazz set featuring a rotating lineup of local quartets in a converted warehouse space.',
        date: inDays(6), time: '21:00', location: 'The Warehouse, Sector 12',
        price: 450, seatsTotal: 80, seatsAvailable: 32,
        image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=60',
      },
      {
        id: uid(), title: 'Frontend Builders Meetup', category: 'Tech',
        description: 'A hands-on evening of lightning talks covering performance, accessibility, and design systems, with networking after.',
        date: inDays(3), time: '18:30', location: 'Codeworks Hub, Level 3',
        price: 0, seatsTotal: 120, seatsAvailable: 45,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=60',
      },
      {
        id: uid(), title: 'Street Food Carnival', category: 'Food',
        description: 'Forty stalls, one weekend. The city\'s best street food vendors gather for a two-day tasting marathon.',
        date: inDays(14), time: '12:00', location: 'Riverside Grounds',
        price: 150, seatsTotal: 500, seatsAvailable: 210,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=60',
      },
      {
        id: uid(), title: 'Watercolor for Beginners', category: 'Art',
        description: 'A relaxed three-hour workshop covering wet-on-wet technique, color mixing, and simple composition.',
        date: inDays(9), time: '10:00', location: 'Studio 4B, Arts District',
        price: 600, seatsTotal: 20, seatsAvailable: 6,
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=60',
      },
      {
        id: uid(), title: 'Marathon City 10K', category: 'Sports',
        description: 'A scenic 10K through the old town and along the harbor, finishing with a community breakfast.',
        date: inDays(21), time: '06:30', location: 'City Hall Steps',
        price: 300, seatsTotal: 1000, seatsAvailable: 640,
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=60',
      },
      {
        id: uid(), title: 'Late Night Comedy Open Mic', category: 'Comedy',
        description: 'Ten minutes each, no filter. New and returning comics test fresh material in front of a live crowd.',
        date: inDays(2), time: '20:00', location: 'The Cellar Bar',
        price: 100, seatsTotal: 60, seatsAvailable: 3,
        image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=60',
      },
    ]);
  }

  if (!localStorage.getItem(DB.USERS)) {
    writeList(DB.USERS, [
      { id: uid(), name: 'Admin', email: 'admin@events.com', password: 'admin123', role: 'admin' },
    ]);
  }

  if (!localStorage.getItem(DB.BOOKINGS)) writeList(DB.BOOKINGS, []);
  if (!localStorage.getItem(DB.FEEDBACK)) writeList(DB.FEEDBACK, []);
  if (!localStorage.getItem(DB.MESSAGES)) writeList(DB.MESSAGES, []);
}
seedIfEmpty();

/* ---------- events ---------- */
const Events = {
  all: () => readList(DB.EVENTS),
  byId: (id) => readList(DB.EVENTS).find((e) => e.id === id),
  save: (list) => writeList(DB.EVENTS, list),
  add: (event) => {
    const list = readList(DB.EVENTS);
    list.push({ id: uid(), seatsAvailable: Number(event.seatsTotal), ...event });
    writeList(DB.EVENTS, list);
  },
  update: (id, changes) => {
    const list = readList(DB.EVENTS).map((e) => (e.id === id ? { ...e, ...changes } : e));
    writeList(DB.EVENTS, list);
  },
  remove: (id) => {
    writeList(DB.EVENTS, readList(DB.EVENTS).filter((e) => e.id !== id));
  },
};

/* ---------- users / session ---------- */
const Users = {
  all: () => readList(DB.USERS),
  byEmail: (email) => readList(DB.USERS).find((u) => u.email.toLowerCase() === email.toLowerCase()),
  register: (user) => {
    const list = readList(DB.USERS);
    list.push({ id: uid(), role: 'user', ...user });
    writeList(DB.USERS, list);
  },
};

const Session = {
  current: () => {
    try {
      return JSON.parse(localStorage.getItem(DB.SESSION));
    } catch {
      return null;
    }
  },
  login: (user) => localStorage.setItem(DB.SESSION, JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role })),
  logout: () => localStorage.removeItem(DB.SESSION),
};

/* ---------- bookings ---------- */
const Bookings = {
  all: () => readList(DB.BOOKINGS),
  forUser: (userId) => readList(DB.BOOKINGS).filter((b) => b.userId === userId),
  add: (booking) => {
    const list = readList(DB.BOOKINGS);
    list.push({ id: uid(), bookedAt: new Date().toISOString(), ...booking });
    writeList(DB.BOOKINGS, list);
  },
  remove: (id) => {
    writeList(DB.BOOKINGS, readList(DB.BOOKINGS).filter((b) => b.id !== id));
  },
};

/* ---------- feedback ---------- */
const Feedback = {
  all: () => readList(DB.FEEDBACK),
  add: (entry) => {
    const list = readList(DB.FEEDBACK);
    list.unshift({ id: uid(), date: new Date().toISOString(), ...entry });
    writeList(DB.FEEDBACK, list);
  },
};

/* ---------- contact messages ---------- */
const Messages = {
  all: () => readList(DB.MESSAGES),
  add: (entry) => {
    const list = readList(DB.MESSAGES);
    list.unshift({ id: uid(), date: new Date().toISOString(), ...entry });
    writeList(DB.MESSAGES, list);
  },
};

/* ---------- helpers ---------- */
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatPrice(n) {
  return Number(n) === 0 ? 'Free' : `₹${Number(n).toLocaleString('en-IN')}`;
}
function isPastEvent(iso) {
  return new Date(iso + 'T23:59:59') < new Date();
}
