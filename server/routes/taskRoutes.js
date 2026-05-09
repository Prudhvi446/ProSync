const express = require('express');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceMember } = require('../middleware/workspaceMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', verifyWorkspaceMember, getTasks);
router.post('/', verifyWorkspaceMember, createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
