import React, { useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { useTaskStore } from '../store/taskStore';
import { updateTaskApi, deleteTaskApi } from '../api/taskApi';
import toast from 'react-hot-toast';

const columns = ['todo', 'in-progress', 'done'];

const KanbanBoard = React.memo(({ tasks }) => {
  const { updateTask, removeTask } = useTaskStore();

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const handleDragEnd = useCallback(
    async (result) => {
      const { draggableId, destination, source } = result;

      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId;
      const task = tasks.find((t) => t._id === draggableId);
      if (!task) return;

      const optimisticTask = { ...task, status: newStatus };
      if (newStatus === 'done' && !task.completedAt) {
        optimisticTask.completedAt = new Date().toISOString();
      } else if (newStatus !== 'done') {
        optimisticTask.completedAt = null;
      }
      updateTask(optimisticTask);

      try {
        const result = await updateTaskApi(draggableId, { status: newStatus });
        updateTask(result.data.task);
      } catch (error) {
        updateTask(task);
        toast.error('Failed to update task status');
      }
    },
    [tasks, updateTask]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      const task = tasks.find((t) => t._id === taskId);
      removeTask(taskId);

      try {
        await deleteTaskApi(taskId);
        toast.success('Task deleted');
      } catch (error) {
        if (task) {
          useTaskStore.getState().addTask(task);
        }
        toast.error('Failed to delete task');
      }
    },
    [tasks, removeTask]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;
