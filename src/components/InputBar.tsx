import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Tooltip,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import { ChatSpace } from "../types";

type InputBarProps = {
  onSubmit: (content: string, targetSpaceId?: string) => void;
  disabled?: boolean;
  loading?: boolean;
  chatSpaces: ChatSpace[];
  selectedChatId?: string;
  onSelectChat?: (chatId: string | null) => void;
};

const InputBar = ({
  onSubmit,
  disabled = false,
  loading = false,
  chatSpaces,
  selectedChatId,
  onSelectChat,
}: InputBarProps) => {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(
    selectedChatId || null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && isExpanded) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      // 個別チャットが選択されている場合は、そのチャットにのみ送信
      onSubmit(trimmedInput, selectedSpace || undefined);
      setInput("");
      if (selectedSpace) {
        // 個別チャット送信後は選択状態を解除
        setSelectedSpace(null);
        if (onSelectChat) onSelectChat(null);
        setIsExpanded(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSpaceSelect = (event: SelectChangeEvent) => {
    const spaceId = event.target.value;
    setSelectedSpace(spaceId === "all" ? null : spaceId);
    if (onSelectChat) onSelectChat(spaceId === "all" ? null : spaceId);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onSelectChat) {
      onSelectChat(null);
      setSelectedSpace(null);
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
        flexDirection: "column",
        alignItems: "center",
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
        {/* 個別チャット選択ボタン */}
        <Tooltip title={isExpanded ? "全体送信に戻す" : "個別チャットを選択"}>
          <IconButton
            onClick={toggleExpanded}
            sx={{
              color: isExpanded ? "#1976d2" : "#666666",
              "&:hover": { color: isExpanded ? "#1565c0" : "#333333" },
            }}
          >
            <ChatIcon />
          </IconButton>
        </Tooltip>

        {/* チャット選択ドロップダウン */}
        <Collapse in={isExpanded} sx={{ mr: 1, minWidth: 120 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="chat-select-label">送信先</InputLabel>
            <Select
              labelId="chat-select-label"
              value={selectedSpace || "all"}
              label="送信先"
              onChange={handleSpaceSelect}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">全てのチャット</MenuItem>
              {chatSpaces.map((space) => (
                <MenuItem key={space.id} value={space.id}>
                  {space.messages.length > 0
                    ? `${space.messages[0].content.substring(0, 15)}...`
                    : `チャット ${space.id.substring(0, 4)}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Collapse>

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
            loading
              ? "応答を待っています..."
              : selectedSpace
              ? "個別メッセージを入力..."
              : "メッセージを入力..."
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
