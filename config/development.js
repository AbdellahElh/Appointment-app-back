module.exports = {
  port: 9000,
  log: {
    level: "silly",
    disabled: false,
  },
  cors: {
    origins: ["http://localhost:5173"],
    maxAge: 3 * 60 * 60,
  },
  database: {
    client: "mysql2",
    host: "localhost",
    port: 3306,
    name: "AppointmentApp",
    username: "root",
    password: "",
  },
  migrations: {
    directory: "../src/data/migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};
