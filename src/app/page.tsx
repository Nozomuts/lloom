"use client";

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SettingsIcon from "@mui/icons-material/Settings";
import { useChatStore } from "../hooks/useChatStore";
import { useAppSettings } from "../hooks/useAppSettings";
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
    sendMessageToSpace, // sendMessageToSpace をインポート
    changeModel,
    loadAvailableModels,
    copySpaceHistory,
    exportAllHistory,
  } = useChatStore();

  const { settings, updateSpaceSize } = useAppSettings();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportedContent, setExportedContent] = useState("");
  const [exportFilename, setExportFilename] = useState(
    `chat_export_${new Date().toISOString().split("T")[0]}.md`
  );
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

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

  // 設定が変更されたとき、一時設定を更新
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  // メニューを開く
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // メニューを閉じる
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // スナックバーを閉じる
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // チャット履歴の特定のスペースのコピー
  const handleCopyHistory = async (id: string) => {
    await copySpaceHistory(id);
    setSnackbarMessage("チャット履歴をクリップボードにコピーしました");
    setSnackbarOpen(true);
  };

  // すべてのチャット履歴のエクスポート
  const handleExportAllHistory = async () => {
    const history = await exportAllHistory();
    if (history) {
      setExportedContent(history);
      setExportDialogOpen(true);
    } else {
      setSnackbarMessage("エクスポートするチャット履歴がありません");
      setSnackbarOpen(true);
    }
    handleMenuClose();
  };

  // 設定ダイアログを開く
  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
    handleMenuClose();
  };

  // 設定ダイアログを閉じる
  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
  };

  // 設定を保存する
  const handleSaveSettings = () => {
    updateSpaceSize(tempSettings.spaceSize);
    setSettingsDialogOpen(false);
    setSnackbarMessage("設定を保存しました");
    setSnackbarOpen(true);
  };

  // エクスポートダイアログの閉じる
  const handleExportDialogClose = () => {
    setExportDialogOpen(false);
  };

  // ファイルとしてダウンロード
  const handleDownloadExport = () => {
    const blob = new Blob([exportedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
    setSnackbarMessage("チャット履歴をファイルにエクスポートしました");
    setSnackbarOpen(true);
  };

  // エクスポートのコピー
  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportedContent);
      setSnackbarMessage(
        "すべてのチャット履歴をクリップボードにコピーしました"
      );
      setSnackbarOpen(true);
      setExportDialogOpen(false);
    } catch {
      setSnackbarMessage("クリップボードへのコピーに失敗しました");
      setSnackbarOpen(true);
    }
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
              aria-label="メニュー"
              onClick={handleMenuOpen}
              sx={{
                color: "#666666",
                mr: 1,
                "&:hover": { color: "#333333" },
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenSettings}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                サイズ設定
              </MenuItem>
              <MenuItem
                onClick={handleExportAllHistory}
                disabled={chatSpaces.every((s) => s.messages.length === 0)}
              >
                <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
                すべての履歴をエクスポート
              </MenuItem>
            </Menu>
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
                <ChatSpace
                  key={space.id}
                  space={space}
                  onRemove={removeChatSpace}
                  onClear={clearChatSpace}
                  onModelChange={changeModel}
                  onCopyHistory={handleCopyHistory}
                  availableModels={availableModels}
                  spaceSize={settings.spaceSize}
                  onSendMessage={sendMessageToSpace} // sendMessageToSpace を渡す
                />
              ))}
            </Box>
          )}
        </Container>

        <InputBar
          onSubmit={handleSendMessage}
          disabled={isAnyLoading || chatSpaces.length === 0}
          loading={isAnyLoading}
        />

        {/* サイズ設定ダイアログ */}
        <Dialog
          open={settingsDialogOpen}
          onClose={handleCloseSettings}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>チャットスペースのサイズ設定</DialogTitle>
          <DialogContent>
            <Box sx={{ my: 2 }}>
              <TextField
                fullWidth
                label="幅"
                value={tempSettings.spaceSize.width}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    spaceSize: {
                      ...tempSettings.spaceSize,
                      width: e.target.value,
                    },
                  })
                }
                margin="normal"
                helperText="例: 300px, 50%, 30vw など"
              />
              <TextField
                fullWidth
                label="高さ"
                value={tempSettings.spaceSize.height}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    spaceSize: {
                      ...tempSettings.spaceSize,
                      height: e.target.value,
                    },
                  })
                }
                margin="normal"
                helperText="例: 320px, 40vh など"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSettings}>キャンセル</Button>
            <Button onClick={handleSaveSettings} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>

        {/* チャット履歴エクスポートダイアログ */}
        <Dialog
          open={exportDialogOpen}
          onClose={handleExportDialogClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>チャット履歴のエクスポート</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              以下のチャット履歴をファイルとしてダウンロードするか、クリップボードにコピーすることができます。
            </DialogContentText>
            <TextField
              label="ファイル名"
              fullWidth
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
            />
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={exportedContent}
              onChange={(e) => setExportedContent(e.target.value)}
              minRows={10}
              maxRows={20}
              sx={{ mt: 2, fontFamily: "monospace" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportDialogClose} color="primary">
              キャンセル
            </Button>
            <Button onClick={handleCopyExport} color="primary">
              クリップボードにコピー
            </Button>
            <Button onClick={handleDownloadExport} color="primary">
              ダウンロード
            </Button>
          </DialogActions>
        </Dialog>

        {/* 通知スナックバー */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
