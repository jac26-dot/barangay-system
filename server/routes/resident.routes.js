const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/resident.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

// All resident-record routes are admin/staff only. A Resident
// Portal account (role: 'resident') must never reach the full
// resident registry here — their own data is served separately
// via /api/resident-accounts/me.
router.get('/',     verifyToken, isStaffOrAdmin, getAll);
router.get('/:id',  verifyToken, isStaffOrAdmin, getOne);
router.post('/',    verifyToken, isStaffOrAdmin, create);
router.put('/:id',  verifyToken, isStaffOrAdmin, update);
router.delete('/:id', verifyToken, isStaffOrAdmin, remove);

module.exports = router;
