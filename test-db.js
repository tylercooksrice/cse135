const mysql = require('mysql2/promise');

(async () => {
  try {
    const db = await mysql.createPool({
      host: "localhost",
      user: "analytics_user",
      password: "CSE135powell$",
      database: "analytics"
    });

    const [rows] = await db.query("SELECT NOW() AS now");
    console.log("Connection successful, MySQL time:", rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error("MySQL connection failed:", err);
    process.exit(1);
  }
})();
