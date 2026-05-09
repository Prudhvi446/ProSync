import React from 'react';
import { HiOutlineClock, HiOutlineTrash } from 'react-icons/hi';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/formatDate';

const priorityConfig = {
  low: { class: 'badge-low', label: 'Low' },
  medium: { class: 'badge-medium', label: 'Medium' },
  high: { class: 'badge-high', label: 'High' },
};

const TaskCard = React.memo(({ task, onDelete, provided }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const overdue = task.status !== 'done' && isOverdue(task.dueDate);
  const daysLeft = getDaysUntilDue(task.dueDate);

  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 hover:border-dark-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/10 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white leading-snug flex-1">{task.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task._id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          title="Delete task"
        >
          <HiOutlineTrash className="text-sm" />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-dark-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className={priority.class}>{priority.label}</span>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-xs ${
                overdue ? 'text-red-400' : daysLeft !== null && daysLeft <= 2 ? 'text-amber-400' : 'text-dark-400'
              }`}
            >
              <HiOutlineClock className="text-sm" />
              {overdue ? 'Overdue' : formatDate(task.dueDate)}
            </span>
          )}

          {task.assignee && (
            <div
              className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
              title={task.assignee.name || 'Assigned'}
            >
              {task.assignee.avatar ? (
                <img src={task.assignee.avatar} alt={task.assignee.name} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                task.assignee.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
