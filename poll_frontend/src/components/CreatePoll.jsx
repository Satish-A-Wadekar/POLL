import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import socket from '../socket';
import axios from 'axios';

const CreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await new Promise(resolve => {
      socket.emit('create_poll', {
        question,
        options: options.filter(opt => opt.trim() !== ''),
        expiryDate: new Date(expiryDate).toISOString()
      }, resolve);
    });

    if (response.success) {
      setQuestion('');
      setOptions(['']);
      setExpiryDate('');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Poll
      </Typography>
      <TextField
        label="Question"
        fullWidth
        required
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle1" gutterBottom>
        Options
      </Typography>
      {options.map((option, index) => (
        <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }}>
          <TextField
            fullWidth
            required
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
          {options.length > 1 && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => removeOption(index)}
            >
              Remove
            </Button>
          )}
        </Stack>
      ))}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addOption}
        sx={{ mb: 2 }}
      >
        Add Option
      </Button>

      <TextField
        label="Expiry Date"
        type="datetime-local"
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" fullWidth>
        Create Poll
      </Button>
    </Box>
  );
};

export default CreatePoll;
