const Workspace = require('../models/Workspace');
const asyncHandler = require('../utils/asyncHandler');

const verifyWorkspaceMember = asyncHandler(async (req, res, next) => {
  const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId || req.query.workspaceId;

  if (!workspaceId) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Workspace ID is required',
    });
  }

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Workspace not found',
    });
  }

  const userId = req.user._id.toString();
  const isMember = workspace.members.some(
    (member) => member.user.toString() === userId
  );

  if (!isMember) {
    res.status(403);
    return res.json({
      success: false,
      message: 'Access denied — you are not a member of this workspace',
    });
  }

  const memberEntry = workspace.members.find(
    (member) => member.user.toString() === userId
  );
  req.workspace = workspace;
  req.workspaceRole = memberEntry.role;
  next();
});

module.exports = { verifyWorkspaceMember };
