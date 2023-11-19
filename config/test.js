module.exports = {
  log: {
    level: "silly",
    disabled: false, //op true zetten
  },
  cors: {
    origins: ['http://localhost:5173'],
    maxAge: 3 * 60 * 60,
  },
  database: {
    client: "mysql2",
    host: "localhost",
    port: 3306,
    name: "AppointmentApp_test",
    username: "root",
    password: "",
  },
  migrations: {
    directory: '../src/data/migrations', 
  },
  seeds: {
    directory: './seeds',
  },
};
