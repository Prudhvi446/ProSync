const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { cacheGet, cacheSet } = require('../utils/cacheHelpers');

let genAI = null;

const getGeminiClient = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Generate a basic summary without AI as a fallback
 */
const generateFallbackSummary = (completedTasks) => {
  const count = completedTasks.length;
  const highPriority = completedTasks.filter((t) => t.priority === 'high').length;
  const medPriority = completedTasks.filter((t) => t.priority === 'medium').length;
  const lowPriority = completedTasks.filter((t) => t.priority === 'low').length;

  const assignees = [...new Set(completedTasks.map((t) => t.assignee?.name).filter(Boolean))];
  const taskNames = completedTasks.slice(0, 3).map((t) => `"${t.title}"`).join(', ');

  let summary = `Today the team completed ${count} task${count !== 1 ? 's' : ''}`;
  if (taskNames) {
    summary += `, including ${taskNames}${count > 3 ? ` and ${count - 3} more` : ''}`;
  }
  summary += '.';

  if (highPriority > 0) {
    summary += ` ${highPriority} high-priority task${highPriority !== 1 ? 's were' : ' was'} finished.`;
  }
  if (assignees.length > 0) {
    summary += ` Contributors: ${assignees.join(', ')}.`;
  }
  summary += ' Great progress — keep up the momentum!';

  return summary;
};

const getSummary = asyncHandler(async (req, res) => {
  const { workspaceId, forceRefresh } = req.body;

  if (!workspaceId) {
    res.status(400);
    return res.json({
      success: false,
      message: 'workspaceId is required',
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `ai:summary:${workspaceId}:${today}`;

  if (!forceRefresh) {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: { summary: cached.summary, cached: true },
      });
    }
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const completedTasks = await Task.find({
    workspace: new mongoose.Types.ObjectId(workspaceId),
    status: 'done',
    completedAt: { $gte: todayStart, $lt: todayEnd },
    deletedAt: null,
  })
    .populate('assignee', 'name')
    .lean();

  if (completedTasks.length === 0) {
    const noTaskSummary = 'No tasks were completed today yet. Keep pushing — great things take time!';
    return res.status(200).json({
      success: true,
      data: { summary: noTaskSummary, cached: false },
    });
  }

  const taskList = completedTasks
    .map((t) => {
      const assigneeName = t.assignee?.name || 'Unassigned';
      return `- "${t.title}" (Priority: ${t.priority}, Assigned to: ${assigneeName})`;
    })
    .join('\n');

  const prompt = `You are a productivity assistant. Summarize what this team accomplished today in 3-4 sentences. Be specific about task names and priorities. Tasks completed today:\n${taskList}`;

  let summary;
  const client = getGeminiClient();

  if (!client) {
    console.warn('Gemini API key not configured. Using fallback summary.');
    summary = generateFallbackSummary(completedTasks);
  } else {
    try {
      const model = client.getGenerativeModel({ model: 'gemini-flash-latest' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      summary = response.text()?.trim() || 'Unable to generate summary.';
    } catch (aiError) {
      console.error('Gemini API error:', aiError.message);
      summary = generateFallbackSummary(completedTasks);
    }
  }

  await cacheSet(cacheKey, { summary }, 3600); // Cache for 1 hour

  res.status(200).json({
    success: true,
    data: { summary, cached: false },
  });
});

module.exports = { getSummary };
