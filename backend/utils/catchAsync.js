// File: utils/catchAsync.js
// Fungsi ini menerima fungsi lain dan menangkap setiap error yang terjadi,
// lalu mengirimkannya ke middleware error global dengan 'next(err)'.

module.exports = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
  