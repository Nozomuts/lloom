"use client";

import React, { useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useChatStore } from "../hooks/useChatStore";
import dynamic from "next/dynamic";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// パフォーマンスのためにコンポーネントを動的にインポート（遅延ロード）
const ChatSpace = dynamic(() => import("../components/ChatSpace"), {
  loading: () => <p>Loading...</p>,
});

const InputBar = dynamic(() => import("../components/InputBar"), {
  loading: () => <p>Loading...</p>,
});

// モノクロトーンのテーマ
const theme = createTheme({
  palette: {
    primary: {
      main: "#333333",
    },
    secondary: {
      main: "#666666",
    },
    background: {
      default: "#f8f8f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          backgroundColor: "#ffffff",
          color: "#333333",
        },
      },
    },
  },
});

const Home = () => {
  const {
    chatSpaces,
    availableModels,
    loading,
    addChatSpace,
    removeChatSpace,
    clearChatSpace,
    sendMessage,
    changeModel,
    loadAvailableModels,
  } = useChatStore();

  // 初期のモデル一覧を読み込み
  useEffect(() => {
    loadAvailableModels();
  }, [loadAvailableModels]);

  // 初期のチャットスペースを追加
  useEffect(() => {
    if (availableModels.length > 0 && chatSpaces.length === 0) {
      addChatSpace();
    }
  }, [availableModels.length, chatSpaces.length, addChatSpace]);

  const handleSendMessage = (content: string) => {
    // すべてのチャットスペースに同じプロンプトを送信
    sendMessage(content);
  };

  const isAnyLoading = chatSpaces.some((space) => space.loading) || loading;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pb: 10, minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, letterSpacing: "0.5px", fontWeight: 500 }}
            >
              lloom
            </Typography>
            <IconButton
              color="primary"
              aria-label="新しいチャットスペース"
              onClick={addChatSpace}
              disabled={loading || availableModels.length === 0}
              sx={{
                bgcolor: "rgba(0,0,0,0.04)",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.08)",
                },
                "&.Mui-disabled": {
                  opacity: 0.3,
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="xl"
          sx={{ mt: 4, mb: 12, px: { xs: 2, sm: 3, md: 4 } }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress size={30} sx={{ color: "#555555" }} />
              <Typography
                variant="body1"
                sx={{ ml: 2, color: "text.secondary" }}
              >
                モデル情報を読み込み中...
              </Typography>
            </Box>
          ) : chatSpaces.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                mt: 10,
                p: 4,
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ opacity: 0.7 }}
              >
                「+」ボタンをクリックして新しいチャットスペースを追加
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, sm: 3, md: 4 },
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              {chatSpaces.map((space) => (
                <Box
                  key={space.id}
                  sx={{
                    width: { xs: "100%", sm: "47%", md: "30%", lg: "22%" },
                    display: "flex",
                    mb: 2,
                  }}
                >
                  <ChatSpace
                    space={space}
                    onRemove={removeChatSpace}
                    onClear={clearChatSpace}
                    onModelChange={changeModel}
                    availableModels={availableModels}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Container>

        <InputBar
          onSubmit={handleSendMessage}
          disabled={isAnyLoading || chatSpaces.length === 0}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Home;
