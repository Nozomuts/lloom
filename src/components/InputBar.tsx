import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type InputBarProps = {
  onSubmit: (content: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

const InputBar = ({
  onSubmit,
  disabled = false,
  loading = false,
}: InputBarProps) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  const isSubmitDisabled = !input.trim() || disabled || loading;

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
          border: loading
            ? "1px solid rgba(25,118,210,0.2)"
            : "1px solid rgba(0,0,0,0.05)",
          bgcolor: "#ffffff",
          transition: "border-color 0.3s ease",
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
              opacity: loading ? 0.7 : 1,
            },
          }}
          placeholder={
            loading ? "応答を待っています..." : "メッセージを入力..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          multiline
          maxRows={4}
        />
        <Box sx={{ position: "relative" }}>
          {loading ? (
            <Tooltip title="応答を待っています">
              <CircularProgress
                size={24}
                sx={{
                  mr: 1,
                  color: "#1976d2",
                  animation: "pulsate 1.5s ease-in-out infinite",
                  "@keyframes pulsate": {
                    "0%": { opacity: 0.6 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.6 },
                  },
                }}
              />
            </Tooltip>
          ) : (
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
              disabled={isSubmitDisabled}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default InputBar;
