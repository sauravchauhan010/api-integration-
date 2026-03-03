// In-memory database for WebContainer/StackBlitz compatibility
let userIdCounter = 1;
let bookingIdCounter = 1;

const users: any[] = [];
const bookings: any[] = [];

const db = {
  exec: (_sql: string) => {},
  prepare: (sql: string) => ({
    run: (...params: any[]) => {
      if (sql.includes('INSERT INTO users')) {
        const id = userIdCounter++;
        users.push({
          id, email: params[0], password: params[1],
          name: params[2], company_name: params[3], agent_name: params[4],
          logo_url: null, created_at: new Date().toISOString()
        });
        return { lastInsertRowid: id };
      }
      if (sql.includes('INSERT INTO bookings')) {
        const id = bookingIdCounter++;
        bookings.push({ id, user_id: params[0], rayna_booking_id: params[1], reference_no: params[2], tour_name: params[3], option_name: params[4], tour_id: params[5], booking_date: params[6], travel_date: params[7], total_amount: params[8], status: params[9], pax_details: params[10] });
        return { lastInsertRowid: id };
      }
      if (sql.includes('UPDATE users')) {
        const u = users.find(u => u.id === params[3]);
        if (u) { u.company_name = params[0]; u.agent_name = params[1]; u.logo_url = params[2]; }
        return {};
      }
      if (sql.includes("UPDATE bookings SET status")) {
        const b = bookings.find(b => b.rayna_booking_id === params[0] && b.user_id === params[1]);
        if (b) b.status = 'Cancelled';
        return {};
      }
      return {};
    },
    get: (...params: any[]) => {
      if (sql.includes('SELECT * FROM users WHERE email')) return users.find(u => u.email === params[0]) || null;
      if (sql.includes('SELECT * FROM users WHERE id') || sql.includes('SELECT id, email')) return users.find(u => u.id === params[0]) || null;
      if (sql.includes('COUNT(*) as count FROM users')) return { count: users.length };
      if (sql.includes('COUNT(*) as count FROM bookings')) return { count: bookings.length };
      return null;
    },
    all: (...params: any[]) => {
      if (sql.includes('SELECT * FROM bookings WHERE user_id')) return bookings.filter(b => b.user_id === params[0]);
      return [];
    }
  })
};

export default db;