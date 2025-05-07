import React, { memo, useState, KeyboardEvent } from "react";
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
  Menu,
  Tooltip,
  Fade,
  Skeleton,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import {
  ChatSpace as ChatSpaceType,
  ChatMessage,
  OpenRouterModel,
  SpaceSize,
} from "../types";
import ReactMarkdown from "react-markdown";

type ChatSpaceProps = {
  space: ChatSpaceType;
  onRemove: (id: string) => void;
  onClear: (id: string) => void;
  onModelChange: (id: string, modelId: string) => void;
  onSystemPromptChange: (id: string, systemPrompt: string) => void; // 追加
  onCopyHistory: (id: string) => Promise<void>;
  availableModels: OpenRouterModel[];
  spaceSize: SpaceSize;
  onSendMessage: (spaceId: string, content: string) => void;
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

// ローディングスケルトン用のコンポーネント
const LoadingSkeleton = () => (
  <Box sx={{ mb: 2, width: "100%" }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
      <Skeleton variant="text" width={100} height={24} />
    </Box>
    <Skeleton variant="rounded" height={80} width="90%" sx={{ mb: 1 }} />
    <Skeleton variant="text" width={60} height={16} />
  </Box>
);

const ChatSpace = memo(
  ({
    space,
    onRemove,
    onClear,
    onModelChange,
    onSystemPromptChange, // 追加
    onCopyHistory,
    availableModels,
    spaceSize,
    onSendMessage,
  }: ChatSpaceProps) => {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
      null
    );
    const isMenuOpen = Boolean(menuAnchorEl);
    const [localInput, setLocalInput] = useState(""); // ローカル入力用のstate

    // メニューを開く
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchorEl(event.currentTarget);
    };

    // メニューを閉じる
    const handleMenuClose = () => {
      setMenuAnchorEl(null);
    };

    // モデル変更ハンドラー
    const handleModelChange = (event: SelectChangeEvent) => {
      onModelChange(space.id, event.target.value);
    };

    // システムプロンプト変更ハンドラー
    const handleSystemPromptChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      onSystemPromptChange(space.id, event.target.value);
    };

    // チャット履歴をコピーする
    const handleCopyHistory = () => {
      onCopyHistory(space.id);
      handleMenuClose();
    };

    // ローカルメッセージ送信ハンドラー
    const handleLocalSendMessage = () => {
      if (localInput.trim() && !space.loading) {
        onSendMessage(space.id, localInput.trim());
        setLocalInput("");
      }
    };

    // ローカル入力のKeyDownハンドラー
    const handleLocalInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleLocalSendMessage();
      }
    };

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          width: spaceSize.width,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e0e0e0",
          backgroundColor: "white",
          transition: "all 0.3s ease",
          opacity: space.loading ? 0.95 : 1,
        }}
      >
        {space.loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 10,
              borderRadius: 2,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={40} thickness={4} color="primary" />
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "text.secondary" }}
              >
                応答を生成中...
              </Typography>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1, // 変更: マージン調整
            alignItems: "center",
            width: "100%",
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 100,
              flexGrow: 1,
              flexShrink: 1,
              mr: 1,
            }}
          >
            <InputLabel id={`model-select-label-${space.id}`}>
              モデル
            </InputLabel>
            <Select
              labelId={`model-select-label-${space.id}`}
              value={space.selectedModel}
              label="モデル"
              onChange={handleModelChange}
              disabled={space.loading}
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
          <Box sx={{ display: "flex", flexShrink: 0 }}>
            <Tooltip title="オプション">
              <IconButton
                aria-label="オプション"
                onClick={handleMenuOpen}
                sx={{ color: "#666666", "&:hover": { color: "#333333" } }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={handleCopyHistory}
                disabled={space.messages.length === 0}
              >
                <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                履歴をコピー
              </MenuItem>
            </Menu>
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

        {/* システムプロンプト入力UI */}
        <TextField
          fullWidth
          label="システムプロンプト (オプション)"
          variant="outlined"
          size="small"
          value={space.systemPrompt || ""}
          onChange={handleSystemPromptChange}
          disabled={space.loading}
          multiline
          rows={2}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#555555",
              },
            },
          }}
        />

        <Box
          sx={{
            flexGrow: 1,
            height: spaceSize.height,
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
            <Fade in={space.loading} timeout={300}>
              <Box sx={{ my: 2 }}>
                <LoadingSkeleton />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "#555555",
                      animation: "pulse 1.5s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%": { opacity: 0.6 },
                        "50%": { opacity: 1 },
                        "100%": { opacity: 0.6 },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Fade>
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
        {/* 個別メッセージ入力UI */}
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="メッセージを入力..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={handleLocalInputKeyDown}
            disabled={space.loading}
            sx={{
              mr: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px", // 丸みを帯びた角
                backgroundColor: "#f9f9f9",
                "&.Mui-focused fieldset": {
                  borderColor: "#555555",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleLocalSendMessage}
                    disabled={!localInput.trim() || space.loading}
                    size="small"
                    sx={{
                      color:
                        localInput.trim() && !space.loading
                          ? "#333333"
                          : "#bdbdbd",
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
    );
  }
);

ChatSpace.displayName = "ChatSpace";

export default ChatSpace;
