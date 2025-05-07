import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Paper, InputBase, IconButton, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type InputBarProps = {
  onSubmit: (content: string) => void;
  disabled?: boolean;
};

const InputBar = ({ onSubmit, disabled = false }: InputBarProps) => {
  const [input, setInput] = useState("");
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
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <Paper
        component="form"
        sx={{
          p: "4px 8px",
          display: "flex",
          alignItems: "center",
          width: { xs: "calc(100% - 40px)", sm: "580px", md: "680px" },
          maxWidth: "calc(100% - 40px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.05)",
          bgcolor: "#ffffff",
        }}
        elevation={0}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <InputBase
          inputRef={inputRef}
          sx={{
            ml: 1.5,
            flex: 1,
            fontSize: "0.95rem",
            "& .MuiInputBase-input": {
              py: 1,
            },
          }}
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
          sx={{
            p: "10px",
            color: input.trim() && !disabled ? "#333333" : "#bdbdbd",
            transition: "color 0.2s",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.03)",
            },
          }}
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
