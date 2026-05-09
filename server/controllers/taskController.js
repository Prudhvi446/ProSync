const mongoose = require('mongoose');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { cacheDelete } = require('../utils/cacheHelpers');

const getTasks = asyncHandler(async (req, res) => {
  const { workspaceId, status, assignee, search } = req.query;

  if (!workspaceId) {
    res.status(400);
    return res.json({
      success: false,
      message: 'workspaceId query parameter is required',
    });
  }

  const matchStage = {
    workspace: new mongoose.Types.ObjectId(workspaceId),
    deletedAt: null,
  };

  if (status) {
    matchStage.status = status;
  }

  if (assignee) {
    matchStage.assignee = new mongoose.Types.ObjectId(assignee);
  }

  if (search) {
    matchStage.title = { $regex: search, $options: 'i' };
  }

  const tasks = await Task.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'assignee',
        foreignField: '_id',
        as: 'assigneeInfo',
        pipeline: [
          { $project: { name: 1, email: 1, avatar: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'creatorInfo',
        pipeline: [
          { $project: { name: 1, email: 1, avatar: 1 } },
        ],
      },
    },
    {
      $addFields: {
        assignee: { $arrayElemAt: ['$assigneeInfo', 0] },
        createdBy: { $arrayElemAt: ['$creatorInfo', 0] },
      },
    },
    {
      $project: {
        assigneeInfo: 0,
        creatorInfo: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: { tasks, count: tasks.length },
  });
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignee, workspaceId, dueDate } = req.body;

  if (!title || !workspaceId) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Title and workspaceId are required',
    });
  }

  const task = await Task.create({
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    assignee: assignee || null,
    workspace: workspaceId,
    createdBy: req.user._id,
    dueDate: dueDate || null,
  });

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .lean();

  await cacheDelete(`analytics:${workspaceId}`);

  const io = req.app.get('io');
  if (io) {
    io.to(workspaceId).emit('task:created', {
      task: populated,
      workspaceId,
      updatedBy: req.user,
    });
  }

  res.status(201).json({
    success: true,
    data: { task: populated },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const task = await Task.findOne({ _id: id, deletedAt: null });
  if (!task) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Task not found',
    });
  }

  const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      task[field] = updates[field];
    }
  });

  if (updates.status === 'done' && !task.completedAt) {
    task.completedAt = new Date();
  } else if (updates.status && updates.status !== 'done') {
    task.completedAt = null;
  }

  await task.save();

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .lean();

  const workspaceId = task.workspace.toString();
  await cacheDelete(`analytics:${workspaceId}`);

  const io = req.app.get('io');
  if (io) {
    io.to(workspaceId).emit('task:updated', {
      task: populated,
      workspaceId,
      updatedBy: req.user,
    });
  }

  res.status(200).json({
    success: true,
    data: { task: populated },
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, deletedAt: null });
  if (!task) {
    res.status(404);
    return res.json({
      success: false,
      message: 'Task not found',
    });
  }

  task.deletedAt = new Date();
  await task.save();

  const workspaceId = task.workspace.toString();
  await cacheDelete(`analytics:${workspaceId}`);

  const io = req.app.get('io');
  if (io) {
    io.to(workspaceId).emit('task:deleted', {
      task: { _id: task._id },
      workspaceId,
      updatedBy: req.user,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = { getTasks, createTask, updateTask, deleteTask };
