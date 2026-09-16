const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/document.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

// Every route here is the admin/staff document management view —
// listing ALL residents' requests. A resident's own requests are
// served separately via /api/resident-accounts/me, so nothing here
// should be reachable with a resident-role token.
router.get('/',       verifyToken, isStaffOrAdmin, getAll);
router.get('/:id',    verifyToken, isStaffOrAdmin, getOne);
router.post('/',      verifyToken, isStaffOrAdmin, create);
router.put('/:id',    verifyToken, isStaffOrAdmin, update);
router.delete('/:id', verifyToken, isStaffOrAdmin, remove);

module.exports = router;
