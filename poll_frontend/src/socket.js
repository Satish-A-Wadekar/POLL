import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    userId: localStorage.getItem('userId') || crypto.randomUUID()
  },
  withCredentials: true,
  autoConnect: true
});

// Store userId on first connection
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', socket.auth.userId);
  socket.auth.userId = localStorage.getItem('userId');
}

socket.emitWithAck = async (event, data) => {
  return new Promise((resolve) => {
    socket.emit(event, {
      ...data,
      userId: localStorage.getItem('userId') // Always send userId
    }, resolve);
  });
};

// Ensure proper connection and error handling
socket.on('connect_error', (err) => {
  console.log('Connection Error:', err);
});

socket.on('connect', () => {
  console.log('Connected to server');
});

export default socket;
