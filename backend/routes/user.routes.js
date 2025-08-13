// File: routes/user.routes.js
// Mendefinisikan rute-rute yang berhubungan dengan user, kini dengan dokumentasi lengkap.

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { createUserRules } = require('../validators/user.validator');
const validate = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 * name: Users
 * description: Manajemen pengguna (membutuhkan otentikasi).
 */

/**
 * @swagger
 * /api/users/me:
 * get:
 * summary: Mendapatkan data profil pengguna yang sedang login.
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Berhasil mendapatkan data profil.
 * '401':
 * description: Tidak terotentikasi (token tidak ada atau tidak valid).
 */
router.get('/me', authenticateToken, userController.getMe);

/**
 * @swagger
 * /api/users:
 * get:
 * summary: Mendapatkan daftar semua pengguna (Admin & Staff).
 * description: Mendukung pagination, sorting, dan filtering. Contoh `?role=staff&sort=-createdAt&page=1&limit=10`.
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Berhasil mendapatkan daftar pengguna.
 * '401':
 * description: Tidak terotentikasi.
 * '403':
 * description: Tidak memiliki izin (bukan Admin atau Staff).
 * post:
 * summary: Membuat pengguna baru (Hanya Admin).
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * requestBody:
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
 * example: staffbaru
 * password:
 * type: string
 * example: password123
 * role:
 * type: string
 * enum: [admin, staff, sales]
 * example: staff
 * responses:
 * '201':
 * description: Pengguna berhasil dibuat.
 * '401':
 * description: Tidak terotentikasi.
 * '403':
 * description: Tidak memiliki izin (bukan Admin).
 * '422':
 * description: Data input tidak valid.
 */
router.get('/', authenticateToken, authorize('admin', 'staff'), userController.getAllUsers);
router.post('/', authenticateToken, authorize('admin'), createUserRules, validate, userController.createUser);


// Rute /profile ini sengaja tidak didokumentasikan untuk menghindari duplikasi dengan /me
router.get('/profile', authenticateToken, userController.getProfile);

module.exports = router;
