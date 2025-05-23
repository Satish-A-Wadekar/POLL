import React from 'react';
import { Container, AppBar, Toolbar, Typography } from '@mui/material';
import CreatePoll from './components/CreatePoll';
import PollList from './components/PollList';

function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Poll Application</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <CreatePoll />
        <PollList />
      </Container>
    </div>
  );
}

export default App;
