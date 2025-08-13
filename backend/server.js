// File: server.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Impor paket keamanan
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Impor paket dokumentasi
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// =================================================================
// MIDDLEWARE GLOBAL
// =================================================================
app.use(helmet());

const whitelist = ['http://localhost:5173', 'https://your-production-frontend.com'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Tidak diizinkan oleh CORS'));
    }
  },
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =================================================================
// KONEKSI DATABASE & SEEDING (BAGIAN YANG DIPERBAIKI)
// =================================================================
const db = require('./models');

const syncOptions = {};
if (process.env.NODE_ENV === 'development') {
  syncOptions.force = true; // Ini akan menghapus dan membuat ulang tabel setiap kali server start
}

// Fungsi untuk membuat data awal (seeding) setelah database di-reset
const seedDatabase = async () => {
  if (syncOptions.force) {
    logger.info('Menjalankan proses seeding untuk data awal...');
    try {
      // 1. Buat user admin
      // PERBAIKAN: Menggunakan db.users (lowercase) agar konsisten
      await db.users.findOrCreate({
        where: { username: 'admin' },
        defaults: {
          password: 'admin123', // Password akan di-hash secara otomatis oleh hook model
          role: 'admin',
          status: 'active'
        }
      });
      logger.info('User admin default berhasil dibuat.');
      
       // 5. Buat Grup Mitra Bisnis default
    await db.BusinessPartnerGroup.bulkCreate([
      { name: 'Distributor', defaultDiscount: 50 },
      { name: 'Toko', defaultDiscount: 40 },
      { name: 'End-User', defaultDiscount: 0 },
      { name: 'Supplier' },
  ], { ignoreDuplicates: true });
  logger.info('Grup mitra bisnis default berhasil dibuat.');
    

    } catch (seedError) {
      logger.error('Gagal melakukan seeding data awal:', seedError);
    }
  }
};



db.sequelize.sync(syncOptions)
  .then(async () => { // Jadikan fungsi ini async
    logger.info(`Sinkronisasi database berhasil. Mode force: ${syncOptions.force || false}`);
    
    // Jalankan fungsi seeding setelah sinkronisasi selesai
    await seedDatabase();

    // Jalankan server HANYA setelah database dan seeding siap
    app.listen(PORT, () => {
      logger.info(`Server berjalan di port ${PORT}. Dokumentasi tersedia di http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    logger.error('Gagal sinkronisasi dengan database: ' + err.message);
  });

// =================================================================
// ROUTES & ERROR HANDLING
// =================================================================
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const masterDataRoutes = require('./routes/masterData.routes');
const productRoutes = require('./routes/product.routes');
const attributeRoutes = require('./routes/attribute.routes');
const variantRoutes = require('./routes/variant.routes');
const configurationRoutes = require('./routes/configuration.routes');
const businessPartnerRoutes = require('./routes/businessPartner.routes');
const quotationRoutes = require('./routes/quotation.routes');
const paymentTermRoutes = require('./routes/paymentTerm.routes');
const salesOrderRoutes = require('./routes/salesOrder.routes');
const workOrderRoutes = require('./routes/workOrder.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const businessPartnerGroupRoutes = require('./routes/businessPartnerGroup.routes');
const configuratorRoutes = require('./routes/configurator.routes');
const productLinkRoutes = require('./routes/productLink.routes');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const limitPerWindow = process.env.NODE_ENV === 'development' ? 10000 : 200;
const windowInMinutes = 15;

const limiter = rateLimit({
  max: limitPerWindow,
  windowMs: windowInMinutes * 60 * 1000,
  message: `Terlalu banyak request dari IP ini, silakan coba lagi dalam ${windowInMinutes} menit!`,
  standardHeaders: true, // Mengirim header rate limit di setiap respons
  legacyHeaders: false, // Menonaktifkan header lama
});
app.use('/api', limiter);

const authApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 15 menit.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth', authApiLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api/products', productRoutes);
app.use('/api', attributeRoutes);
app.use('/api', variantRoutes);
app.use('/api', configurationRoutes);
app.use('/api/partners', businessPartnerRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/master/payment-terms', paymentTermRoutes)
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api', workOrderRoutes);
app.use('/api', inventoryRoutes);
app.use('/api/partner-groups', businessPartnerGroupRoutes);
app.use('/api', configuratorRoutes);
app.use('/api', productLinkRoutes);

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Tidak dapat menemukan ${req.originalUrl} di server ini!`, 404));
});

app.use(globalErrorHandler);
