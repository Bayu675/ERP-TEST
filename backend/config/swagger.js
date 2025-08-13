// File: config/swagger.js
// Konfigurasi untuk swagger-jsdoc.

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Dokumentasi API untuk ERP Custom Made',
    version: '1.0.0',
    description: 'Ini adalah dokumentasi API interaktif yang dibuat secara otomatis. Gunakan endpoint `/api/auth/login` untuk mendapatkan token JWT, lalu klik tombol "Authorize" di kanan atas dan masukkan token Anda dengan format `Bearer <token>` untuk mengakses endpoint yang dilindungi.',
    contact: {
      name: 'Developer',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development Server',
    },
  ],
  // Menambahkan definisi keamanan untuk JWT
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  // Menerapkan keamanan secara global ke semua endpoint
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Path ke file API yang ingin didokumentasikan.
  // Ini akan memindai semua file .js di dalam folder routes.
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
