import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Stack, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import socket from '../socket';
import { useRateLimit } from '../hooks/useRateLimit';

const CreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);
  const [expiryDate, setExpiryDate] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { remaining, isLimited, resetTime, recordAction } = useRateLimit(
    'poll_creation',
    5,
    60000 // 1 minute
  );

  const sanitizeInput = (input, maxLength) => {
    return input.replace(/<[^>]*>?/gm, '').substring(0, maxLength);
  };

  const handleQuestionChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value, 500);
    setQuestion(sanitizedValue);
    if (errors.question) {
      setErrors(prev => ({ ...prev, question: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.length === 500) {
      newErrors.question = 'Maximum 500 characters reached';
    }

    if (options.filter(opt => opt.trim() !== '').length < 2) {
      newErrors.options = 'At least 2 non-empty options are required';
    }

    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format time remaining for display
  const formatTimeRemaining = () => {
    if (!resetTime) return 'now';
    const seconds = Math.ceil((resetTime - Date.now()) / 1000);
    return `${seconds}s`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isLimited) {
      toast.error(`Please try again after ${formatTimeRemaining()}, remaining polls (${remaining} )`);
      return;
    }

    recordAction(); // Record the action
    setIsSubmitting(true);

    try {
      const response = await new Promise((resolve) => {
        socket.emit('create_poll', {
          question: question.trim(),
          options: options.filter(opt => opt.trim() !== '').map(opt => opt.trim()),
          expiryDate: new Date(expiryDate).toISOString()
        }, resolve);
      });

      if (response.success) {
        toast.success('Poll created successfully!');
        setQuestion('');
        setOptions(['']);
        setExpiryDate('');
      } else {
        toast.error(response.error?.message || 'Failed to create poll');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while creating the poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const sanitizedValue = sanitizeInput(value, 200);
    const newOptions = [...options];
    newOptions[index] = sanitizedValue;
    setOptions(newOptions);
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: undefined }));
    }
  };

  const addOption = () => {
    if (options.length < 10) { // Limit to 10 options
      setOptions([...options, '']);
    } else {
      toast.warning('Maximum 10 options allowed');
    }
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (newOptions.filter(opt => opt.trim() !== '').length >= 2 && errors.options) {
        setErrors(prev => ({ ...prev, options: undefined }));
      }
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
        onChange={handleQuestionChange}
        error={!!errors.question}
        helperText={errors.question}
        sx={{ mb: 1 }}
      />

      <Typography
        variant="caption"
        display="block"
        gutterBottom
        sx={{
          mb: 2,
          color: question.length === 150 ? 'error.main' : 'text.secondary',
          fontWeight: question.length === 150 ? 'bold' : 'normal'
        }}
      >
        {question.length}/150 characters
      </Typography>

      <Typography variant="caption" sx={{ display: 'block', color: isLimited ? 'error.main' : 'text.secondary' }}>
        {isLimited
          ? `Rate limited (resets in ${formatTimeRemaining()})`
          : `Remaining: ${remaining}/5 (per minute)`
        }
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Options (Max 10)
      </Typography>

      {options.map((option, index) => (
        <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }}>
          <TextField
            fullWidth
            required
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            error={!!errors.options}
            helperText={option.length === 200 && 'Maximum 200 characters'}
          />
          {options.length > 1 && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => removeOption(index)}
              disabled={isSubmitting}
            >
              Remove
            </Button>
          )}
        </Stack>
      ))}

      {errors.options && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.options}
        </Alert>
      )}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addOption}
        sx={{ mb: 2 }}
        disabled={isSubmitting || options.length >= 10}
      >
        Add Option ({options.length}/10)
      </Button>

      <TextField
        label="Expiry Date"
        type="datetime-local"
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        value={expiryDate}
        onChange={(e) => {
          setExpiryDate(e.target.value);
          if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: undefined }));
        }}
        error={!!errors.expiryDate}
        helperText={errors.expiryDate}
        sx={{ mb: 2 }}
        inputProps={{
          min: new Date().toISOString().slice(0, 16)
        }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting || isLimited}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? 'Creating...' : 'Create Poll'}
      </Button>
    </Box>
  );
};

export default CreatePoll;
