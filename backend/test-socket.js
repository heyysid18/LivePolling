const { io } = require('socket.io-client');
console.log("Starting client...");
const socket = io('http://localhost:4000', { transports: ['websocket'] });

socket.on('connect', () => {
    console.log(`Connected! Waiting 500ms before emitting...`);
    setTimeout(() => {
        socket.emit('join_poll', { studentId: 'test-123', studentName: 'Real Test Student', role: 'student' });
        console.log('Emitted!');
    }, 500);
});

socket.on('student_list_updated', (students) => {
    console.log('CRITICAL: Got updated list:', students);
    process.exit(0);
});

socket.on('error_message', (msg) => {
    console.log('CRITICAL ERROR MESSAGE:', msg);
    process.exit(1);
});

socket.on('poll_started', (poll) => {
    console.log('Poll started:', poll._id);
});

socket.on('timer_sync', (time) => {
    console.log('Timer:', time);
});
