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
          backgroundColor: isUser ? "#1976d2" : "#f5f5f5",
          color: isUser ? "white" : "black",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          "& a": {
            color: isUser ? "lightblue" : "#0066cc",
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
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          maxWidth: "100%",
          minWidth: { xs: "100%", sm: "350px" },
          width: { xs: "100%", sm: "45%", md: "30%" },
          position: "relative",
          display: "flex",
          flexDirection: "column",
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
            >
              <ClearAllIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onRemove(space.id)}
              title="チャットスペースを削除"
              disabled={space.loading}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            height: "300px",
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
                opacity: 0.6,
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
              <CircularProgress size={24} />
            </Box>
          )}

          {space.error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
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
