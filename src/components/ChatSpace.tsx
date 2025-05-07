import React, { memo } from "react";
import {
  Paper,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import {
  ChatSpace as ChatSpaceType,
  ChatMessage,
  OpenRouterModel,
} from "../types";
import ReactMarkdown from "react-markdown";

type ChatSpaceProps = {
  space: ChatSpaceType;
  onRemove: (id: string) => void;
  onClear: (id: string) => void;
  onModelChange: (id: string, modelId: string) => void;
  availableModels: OpenRouterModel[];
};

type MessageBubbleProps = {
  message: ChatMessage;
};

const MessageBubble = memo(({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        mb: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          maxWidth: "90%",
          backgroundColor: isUser ? "#333333" : "#f5f5f5",
          color: isUser ? "white" : "#333333",
          p: 2,
          borderRadius: 1.5,
          boxShadow: 1,
          "& a": {
            color: isUser ? "#e0e0e0" : "#555555",
            textDecoration: "underline",
          },
          "& pre": {
            backgroundColor: isUser ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
            borderRadius: 1,
            padding: 1,
            overflow: "auto",
          },
          "& code": {
            backgroundColor: isUser ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
            padding: "0.1rem 0.3rem",
            borderRadius: 0.5,
            fontFamily: "monospace",
          },
        }}
        className="markdown-content"
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
        {message.model && (
          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", opacity: 0.7 }}
          >
            {message.model}
          </Typography>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Typography>
    </Box>
  );
});

MessageBubble.displayName = "MessageBubble";

const ChatSpace = memo(
  ({
    space,
    onRemove,
    onClear,
    onModelChange,
    availableModels,
  }: ChatSpaceProps) => {
    const handleModelChange = (event: SelectChangeEvent) => {
      onModelChange(space.id, event.target.value);
    };

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          maxWidth: "100%",
          minWidth: { xs: "100%", sm: "330px" },
          width: { xs: "100%", sm: "47%", md: "30%", lg: "22%" },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e0e0e0",
          backgroundColor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120, flexGrow: 1, mr: 1 }}>
            <InputLabel id={`model-select-label-${space.id}`}>
              モデル
            </InputLabel>
            <Select
              labelId={`model-select-label-${space.id}`}
              value={space.selectedModel}
              label="モデル"
              onChange={handleModelChange}
              disabled={space.loading || space.messages.length > 0}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d0d0d0",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#555555",
                },
              }}
            >
              {availableModels.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box>
            <IconButton
              size="small"
              onClick={() => onClear(space.id)}
              title="会話をクリア"
              disabled={space.loading}
              sx={{ color: "#666666", "&:hover": { color: "#333333" } }}
            >
              <ClearAllIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onRemove(space.id)}
              title="チャットスペースを削除"
              disabled={space.loading}
              sx={{ color: "#666666", "&:hover": { color: "#333333" } }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            height: "320px",
            overflowY: "auto",
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {space.messages.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                my: 4,
                opacity: 0.5,
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2">メッセージがありません</Typography>
            </Box>
          ) : (
            space.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {space.loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} sx={{ color: "#555555" }} />
            </Box>
          )}

          {space.error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mt: 1, color: "#aa0000" }}
            >
              Error: {space.error}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }
);

ChatSpace.displayName = "ChatSpace";

export default ChatSpace;
