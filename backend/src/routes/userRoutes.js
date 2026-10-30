const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  listUsers,
  listRoles,
  createRole,
  updateUserAccess,
  updateRole,
} = require('../controllers/userController');

router.use(protect, authorize('super_admin', 'hospital_admin'));
router.get('/', listUsers);
router.get('/roles', listRoles);
router.post('/roles', createRole);
router.put('/roles/:slug', updateRole);
router.patch('/:id/access', updateUserAccess);

module.exports = router;
