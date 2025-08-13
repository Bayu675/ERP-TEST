// File: routes/auth.routes.js
// Mendefinisikan rute-rute yang berhubungan dengan otentikasi.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginRules } = require('../validators/auth.validator');
const validate = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/auth/login:
 * post:
 * tags:
 * - Authentication
 * summary: Login pengguna untuk mendapatkan token JWT
 * description: Mengotentikasi pengguna dengan username dan password, dan mengembalikan token JWT jika berhasil.
 * requestBody:
 * description: Kredensial pengguna untuk login.
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - password
 * properties:
 * username:
 * type: string
 * example: admin
 * password:
 * type: string
 * example: password123
 * responses:
 * '200':
 * description: Login berhasil dan token JWT dikembalikan.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * example: success
 * message:
 * type: string
 * example: Login berhasil.
 * token:
 * type: string
 * '401':
 * description: Gagal otentikasi, username atau password salah.
 * '422':
 * description: Gagal validasi, data input tidak lengkap atau tidak valid.
 *
 * tags:
 * - name: Authentication
 * description: Rute untuk otentikasi pengguna dan manajemen token.
 */
router.post('/login', loginRules, validate, authController.login);

module.exports = router;
