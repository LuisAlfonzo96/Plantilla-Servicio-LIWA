"use strict";
const express = require("express");
const mysql = require("promise-mysql");
require('dotenv').config();
const app = express();

// app.use(express.urlencoded({extended: false}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
  res.set("Content-Type", "text/html");
  next();
});
// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool;
const createPoolAndEnsureSchema = async () =>
  await createPool()
    .then(async (pool) => {
      //await ensureSchema(pool);
      return pool;
    })
    .catch((err) => {
      throw err;
    });

    const {
      DB_USER, DB_PASSWORD, DB_HOST, DB_NAME
    } = process.env;

const createUnixSocketPool = async (config) => {
  // Establish a connection to the database
  return await mysql.createPool({
    user: DB_USER, //'PHP', // e.g. 'my-db-user'
    password:DB_PASSWORD, //'DesarrolloPHP', // e.g. 'my-db-password'
    host:DB_HOST ,
    database:DB_NAME,
  });
};

const createPool = async () => {
  const config = {
    // 'connectionLimit' is the maximum number of connections the pool is allowed
    // to keep at once.
    connectionLimit: 5,
    // [START cloud_sql_mysql_mysql_timeout]
    // 'connectTimeout' is the maximum number of milliseconds before a timeout
    // occurs during the initial connection to the database.
    connectTimeout: 10000, // 10 seconds
    // 'acquireTimeout' is the maximum number of milliseconds to wait when
    // checking out a connection from the pool before a timeout error occurs.
    acquireTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0

  };
    return await createUnixSocketPool(config);
};
app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await createPoolAndEnsureSchema();
    next();
  } catch (err) {
    return next(err);
  }
});

app.post("/", async (req, res) => {
  const { option } = req.body;
  switch (option) {
    case "prueba":
      pool.query(
        `SELECT * FROM db_liwa.Maintenance;`,
        async (error, results) => {
          if (error) {
            res.status(403).json(error).end();
          }
          console.log("Respuesta Exitosa", results);
          res.status(200).json(results).end();
        }
      );
      break;

    default:
      console.log("es es valida la peticion");
      break;
  }
  pool = pool || (await createPoolAndEnsureSchema());

});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`estamos en el ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(err);
  throw err;
});
