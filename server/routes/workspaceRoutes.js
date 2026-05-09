const express = require('express');
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
  inviteMember,
  getMyInvitations,
  respondToInvitation,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceMember } = require('../middleware/workspaceMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createWorkspace);
router.get('/my', getMyWorkspaces);
router.get('/invitations', getMyInvitations);
router.patch('/invitations/:id', respondToInvitation);
router.get('/:id', verifyWorkspaceMember, getWorkspaceById);
router.get('/:id/members', verifyWorkspaceMember, getWorkspaceMembers);
router.post('/:id/invite', verifyWorkspaceMember, inviteMember);

module.exports = router;
