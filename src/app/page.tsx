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

// Material UIテーマ
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
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
      <Box sx={{ pb: 10, minHeight: "100vh" }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              lloom
            </Typography>
            <IconButton
              color="inherit"
              aria-label="新しいチャットスペース"
              onClick={addChatSpace}
              disabled={loading || availableModels.length === 0}
            >
              <AddIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                モデル情報を読み込み中...
              </Typography>
            </Box>
          ) : chatSpaces.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Typography variant="h6" color="text.secondary">
                「+」ボタンをクリックして新しいチャットスペースを追加
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {chatSpaces.map((space) => (
                <Box
                  key={space.id}
                  sx={{
                    width: { xs: "100%", sm: "45%", md: "30%", lg: "23%" },
                    display: "flex",
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
