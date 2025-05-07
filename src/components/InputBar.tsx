import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

type InputBarProps = {
  onSubmit: (content: string) => void;
  disabled?: boolean;
};

const InputBar = ({ onSubmit, disabled = false }: InputBarProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // コンポーネントがマウントされたときに入力フィールドにフォーカス
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSubmit(trimmedInput);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      left: 0, 
      right: 0, 
      display: 'flex', 
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: { xs: 'calc(100% - 32px)', sm: '600px', md: '700px' },
          maxWidth: 'calc(100% - 32px)',
          boxShadow: 3,
        }}
        elevation={3}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <InputBase
          inputRef={inputRef}
          sx={{ ml: 1, flex: 1 }}
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          multiline
          maxRows={4}
        />
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          aria-label="送信"
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default InputBar;