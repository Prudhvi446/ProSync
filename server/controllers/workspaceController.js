const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const asyncHandler = require('../utils/asyncHandler');

const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Workspace name is required',
    });
  }

  const slug = Workspace.generateSlug(name);

  const workspace = await Workspace.create({
    name,
    slug,
    owner: req.user._id,
    members: [
      {
        user: req.user._id,
        role: 'admin',
      },
    ],
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { workspaces: workspace._id },
  });

  const populated = await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .lean();

  res.status(201).json({
    success: true,
    data: { workspace: populated },
  });
});

const getMyWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({
    'members.user': req.user._id,
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: { workspaces },
  });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .lean();

  if (!workspace) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Workspace not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { workspace },
  });
});

const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('members.user', 'name email avatar')
    .lean();

  if (!workspace) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Workspace not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { members: workspace.members },
  });
});

const inviteMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const workspaceId = req.params.id;

  if (!email) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Email is required to invite a member',
    });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Workspace not found',
    });
  }

  const requestingMember = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!requestingMember || requestingMember.role !== 'admin') {
    res.status(403);
    return res.json({
      success: false,
      message: 'Only workspace admins can invite members',
    });
  }

  const normalizedEmail = email.toLowerCase();

  const userToInvite = await User.findOne({ email: normalizedEmail }).lean();
  if (!userToInvite) {
    res.status(404);
    return res.json({
      success: false,
      message: 'No user found with this email. They must register first.',
    });
  }

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === userToInvite._id.toString()
  );
  if (alreadyMember) {
    res.status(400);
    return res.json({
      success: false,
      message: 'This user is already a member of this workspace',
    });
  }

  const existingInvite = await Invitation.findOne({
    workspace: workspaceId,
    invitedEmail: normalizedEmail,
    status: 'pending',
  });
  if (existingInvite) {
    res.status(400);
    return res.json({
      success: false,
      message: 'An invitation is already pending for this user',
    });
  }

  await Invitation.create({
    workspace: workspaceId,
    invitedBy: req.user._id,
    invitedEmail: normalizedEmail,
    invitedUser: userToInvite._id,
    status: 'pending',
  });

  res.status(200).json({
    success: true,
    message: `Invitation sent to ${userToInvite.name} (${normalizedEmail})`,
  });
});

const getMyInvitations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    invitedUser: req.user._id,
    status: 'pending',
  })
    .populate('workspace', 'name slug')
    .populate('invitedBy', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: { invitations },
  });
});

const respondToInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!action || !['accept', 'reject'].includes(action)) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Action must be "accept" or "reject"',
    });
  }

  const invitation = await Invitation.findById(id);
  if (!invitation) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Invitation not found',
    });
  }

  if (invitation.invitedUser.toString() !== req.user._id.toString()) {
    res.status(403);
    return res.json({
      success: false,
      message: 'This invitation is not for you',
    });
  }

  if (invitation.status !== 'pending') {
    res.status(400);
    return res.json({
      success: false,
      message: `This invitation has already been ${invitation.status}`,
    });
  }

  if (action === 'reject') {
    invitation.status = 'rejected';
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation rejected',
    });
  }

  const workspace = await Workspace.findById(invitation.workspace);
  if (!workspace) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Workspace no longer exists',
    });
  }

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!alreadyMember) {
    workspace.members.push({
      user: req.user._id,
      role: 'member',
    });
    await workspace.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { workspaces: workspace._id },
    });
  }

  invitation.status = 'accepted';
  await invitation.save();

  const populated = await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .lean();

  res.status(200).json({
    success: true,
    message: 'Invitation accepted! You are now a member.',
    data: { workspace: populated },
  });
});

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
  inviteMember,
  getMyInvitations,
  respondToInvitation,
};
