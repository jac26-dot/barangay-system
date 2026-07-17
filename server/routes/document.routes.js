const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/document.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/',       verifyToken, getAll);
router.get('/:id',    verifyToken, getOne);
router.post('/',      verifyToken, isStaffOrAdmin, create);
router.put('/:id',    verifyToken, isStaffOrAdmin, update);
router.delete('/:id', verifyToken, isStaffOrAdmin, remove);

module.exports = router;
