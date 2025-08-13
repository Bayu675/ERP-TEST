// File: models/index.js
// File ini bertanggung jawab untuk menginisialisasi Sequelize
// dan memuat semua model dalam aplikasi.

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// Meskipun kita pakai .env, Sequelize-CLI mungkin butuh file config.json
// Kita akan atur secara manual untuk menghindari kebingungan.
require('dotenv').config(); 

const db = {};

// Inisialisasi koneksi Sequelize secara eksplisit dari .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Set ke `true` atau `console.log` untuk debug query
  }
);

// Membaca semua file model di dalam direktori ini
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Impor setiap model dan inisialisasi dengan sequelize
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    // Simpan model ke objek db dengan nama modelnya (misal: db.User)
    db[model.name] = model;
  });

// Menjalankan fungsi 'associate' jika ada untuk membuat relasi antar tabel
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Melampirkan instance sequelize dan constructor Sequelize ke objek db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Mengganti nama db.User menjadi db.users agar konsisten dengan kode Anda
if (db.User) {
    db.users = db.User;
    // delete db.User; // Opsional: hapus properti lama
}

module.exports = db;
