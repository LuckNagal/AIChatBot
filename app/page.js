'use client'
import { Box, Stack, TextField, Button } from '@mui/material';
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi I'm the Headstarter Support Agent, how can I assist you today?"
  }]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Prevent sending empty messages
  
    // Update local messages immediately with the user's message
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: trimmedMessage }]);
    
    // Clear the input field
    setMessage('');
  
    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ role: 'user', content: trimmedMessage }]),
      });
  
      // Stream handling for continuous responses
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
  
        function processText({ done, value }) {
          if (done) {
            console.log('Stream finished.');
            return;
          }
          const text = decoder.decode(value, { stream: true });
          console.log('Received:', text);
  
          // Update messages state with new text from the assistant
          setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: text }]);
  
          // Read the next chunk of data
          reader.read().then(processText);
        }
  
        reader.read().then(processText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally handle the error in UI, e.g., show an error message
    }
  }
  

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display='flex'
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack 
          direction="row"
          spacing={2}
        >
          <TextField
            label="Type your message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>Submit</Button>
        </Stack>
      </Stack>
    </Box>
  );  
}