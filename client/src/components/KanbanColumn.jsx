import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-slate-500', textColor: 'text-slate-400' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500', textColor: 'text-blue-400' },
  done: { label: 'Done', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
};

const KanbanColumn = React.memo(({ status, tasks, onDeleteTask }) => {
  const config = statusConfig[status] || statusConfig.todo;

  return (
    <div className="flex-1 min-w-[300px]">
      {/* Column Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
        <h3 className={`text-sm font-semibold ${config.textColor}`}>
          {config.label}
        </h3>
        <span className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] rounded-xl p-3 transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? 'bg-primary-500/5 border-2 border-dashed border-primary-500/30'
                : 'bg-dark-900/30 border-2 border-dashed border-transparent'
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    className={`transition-transform duration-100 ${
                      dragSnapshot.isDragging ? 'rotate-2 scale-105' : ''
                    }`}
                  >
                    <TaskCard
                      task={task}
                      onDelete={onDeleteTask}
                      provided={dragProvided}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8">
                <p className="text-xs text-dark-500">No tasks here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
