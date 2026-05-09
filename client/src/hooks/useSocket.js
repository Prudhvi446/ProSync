import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';

export const useSocket = (workspaceId) => {
  const { addTask, updateTask, removeTask } = useTaskStore();
  const workspaceIdRef = useRef(workspaceId);

  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;

    const socket = connectSocket(workspaceId);
    if (!socket) return;

    const handleTaskCreated = (payload) => {
      if (payload.workspaceId === workspaceIdRef.current) {
        addTask(payload.task);
      }
    };

    const handleTaskUpdated = (payload) => {
      if (payload.workspaceId === workspaceIdRef.current) {
        updateTask(payload.task);
      }
    };

    const handleTaskDeleted = (payload) => {
      if (payload.workspaceId === workspaceIdRef.current) {
        removeTask(payload.task._id);
      }
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [workspaceId, addTask, updateTask, removeTask]);

  return { socket: getSocket() };
};
