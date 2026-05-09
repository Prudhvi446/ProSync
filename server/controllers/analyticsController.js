const mongoose = require('mongoose');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { cacheGet, cacheSet } = require('../utils/cacheHelpers');

const getAnalytics = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  if (!workspaceId) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Workspace ID is required',
    });
  }

  const cacheKey = `analytics:${workspaceId}`;
  const cached = await cacheGet(cacheKey);

  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.status(200).json({
      success: true,
      data: cached,
    });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const result = await Task.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        deletedAt: null,
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: 'count' }],
        completedToday: [
          {
            $match: {
              status: 'done',
              completedAt: { $gte: todayStart, $lt: todayEnd },
            },
          },
          { $count: 'count' },
        ],
        overdueCount: [
          {
            $match: {
              status: { $ne: 'done' },
              dueDate: { $lt: now, $ne: null },
            },
          },
          { $count: 'count' },
        ],
        completionRate: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              rate: {
                $cond: [
                  { $eq: ['$total', 0] },
                  0,
                  { $round: [{ $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 1] },
                ],
              },
            },
          },
        ],
        tasksByPriority: [
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              priority: '$_id',
              count: 1,
            },
          },
        ],
        tasksByMember: [
          {
            $match: {
              assignee: { $ne: null },
            },
          },
          {
            $group: {
              _id: '$assignee',
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
              },
              inProgress: {
                $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userInfo',
              pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
            },
          },
          {
            $project: {
              _id: 0,
              user: { $arrayElemAt: ['$userInfo', 0] },
              total: 1,
              completed: 1,
              inProgress: 1,
            },
          },
        ],
      },
    },
  ]);

  const analytics = {
    totalTasks: result[0].totalTasks[0]?.count || 0,
    completedToday: result[0].completedToday[0]?.count || 0,
    overdueCount: result[0].overdueCount[0]?.count || 0,
    completionRate: result[0].completionRate[0]?.rate || 0,
    tasksByPriority: result[0].tasksByPriority,
    tasksByMember: result[0].tasksByMember,
  };

  await cacheSet(cacheKey, analytics, 60);

  res.set('X-Cache', 'MISS');
  res.status(200).json({
    success: true,
    data: analytics,
  });
});

module.exports = { getAnalytics };
