import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { getOrCreateUserId, hasUserVoted, setVoted, cleanupPollStorage } from '../utils/storage';
import socket from '../socket';

const PollVote = ({ poll: initialPoll }) => {
  // State initialization
  const [poll, setPoll] = useState({
    ...initialPoll,
    options: initialPoll.options || [],
    votedUsers: initialPoll.votedUsers || []
  });

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isExpired = new Date(poll.expiryDate) < new Date();

  // Initialize user and voting status
  useEffect(() => {
    const userId = getOrCreateUserId();
    cleanupPollStorage(poll.id); // Cleanup old entries

    // Check vote status from both localStorage and poll data
    const votedStatus = hasUserVoted(poll.id) || poll.votedUsers.includes(userId);
    setHasVoted(votedStatus);
  }, [poll.id, poll.votedUsers]);

  // Handle real-time updates
  useEffect(() => {
    const handleUpdate = (updatedPoll) => {
      if (updatedPoll.id === poll.id) {
        setPoll(prev => ({
          ...prev,
          ...updatedPoll,
          options: updatedPoll.options || prev.options,
          votedUsers: updatedPoll.votedUsers || prev.votedUsers
        }));
      }
    };

    socket.on('poll_updated', handleUpdate);
    return () => socket.off('poll_updated', handleUpdate);
  }, [poll.id]);

  // Voting handler
  const handleVote = async () => {
    try {
      if (isExpired) {
        setError('This poll has expired and no longer accepts votes');
        return;
      }
      
      setIsLoading(true);
      setError(null);

      const userId = getOrCreateUserId();
      const response = await new Promise((resolve) => {
        socket.emit('vote', {
          pollId: poll.id,
          optionIndex: selectedOption,
          userId
        }, resolve);
      });

      if (response?.success) {
        setVoted(poll.id); // Update localStorage
        setHasVoted(true);
      } else {
        setError(response?.error || 'Voting failed - please try again');
      }
    } catch (err) {
      setError('Network error during voting');
      console.error('Voting error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt?.votes || 0), 0);
  const showVotingForm = !hasVoted && !poll.isExpired;

  return (
    <Box sx={{
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1,
      maxWidth: 600,
      mx: 'auto'
    }}>
      {/* Poll Question */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        {poll.question}
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Voting Form */}
      {showVotingForm && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Select your choice:
          </Typography>

          {poll.options.map((option, index) => (
            <Button
              key={index}
              fullWidth
              variant={selectedOption === index ? 'contained' : 'outlined'}
              onClick={() => setSelectedOption(index)}
              disabled={isLoading}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textTransform: 'none'
              }}
            >
              {option.text}
            </Button>
          ))}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleVote}
            disabled={selectedOption === null || isLoading}
            startIcon={isLoading ? <CircularProgress size={24} /> : null}
            sx={{ mt: 1 }}
          >
            {isLoading ? 'Submitting Vote...' : 'Submit Vote'}
          </Button>
        </Stack>
      )}

      {/* Results Section */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
          {hasVoted ? 'Your Vote Results' : 'Current Results'}
        </Typography>

        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0
            ? Math.round((option.votes / totalVotes) * 100)
            : 0;

          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography>
                  {option.text}
                  {selectedOption === index && ' (Your choice)'}
                </Typography>
                <Typography color="text.secondary">
                  {percentage}% ({option.votes} votes)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: selectedOption === index ? 'success.main' : 'primary.main',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PollVote;
