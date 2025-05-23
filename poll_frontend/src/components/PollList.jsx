import React, { useState, useEffect } from 'react';
import { Box, Typography, List, Card, CardContent } from '@mui/material';
import PollVote from './PollVote';
import socket from '../socket';

const PollList = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    // Initial load
    socket.emit('request_polls', (response) => {
      if (response.success) setPolls(response.polls);
    });

    // Real-time updates
    const handleNewPoll = (newPoll) => {
      setPolls(prev => [...prev, newPoll]);
    };

    socket.on('new_poll', handleNewPoll);
    return () => socket.off('new_poll', handleNewPoll);
  }, []);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5">Active Polls</Typography>
      <List>
        {polls.map(poll => (
          <PollVote
            key={poll.id}
            poll={poll}
            isCreator={poll.creatorId === socket.auth.userId}
          />
        ))}
      </List>
    </Box>
  );
};

export default PollList;
