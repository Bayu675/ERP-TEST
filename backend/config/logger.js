// File: config/logger.js
// Konfigurasi untuk library logging Winston.

const winston = require('winston');

// Menentukan level-level log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Menentukan level log berdasarkan environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Menentukan warna untuk setiap level log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Format log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Menggunakan colorize hanya untuk development
  process.env.NODE_ENV === 'development' ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// "Transports" adalah tujuan output log (misal: console, file)
const transports = [
  // Selalu tampilkan log di console
  new winston.transports.Console(),
  // Simpan log error ke dalam file error.log
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Simpan semua jenis log ke dalam file all.log
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Membuat instance logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger;
