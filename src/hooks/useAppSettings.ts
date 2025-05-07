import { useState, useEffect, useCallback } from "react";
import { AppSettings, SpaceSize } from "../types";

// デフォルトの設定値
const DEFAULT_SETTINGS: AppSettings = {
  spaceSize: {
    width: "300px",
    height: "320px",
  },
};

// localStorageのキー
const STORAGE_KEY = "lloom_app_settings";

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [initialized, setInitialized] = useState<boolean>(false);

  // localStorageから設定を読み込む
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("設定の読み込みに失敗:", error);
      } finally {
        setInitialized(true);
      }
    };

    loadSettings();
  }, []);

  // 設定が変更されたらlocalStorageに保存
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("設定の保存に失敗:", error);
      }
    }
  }, [settings, initialized]);

  const updateSpaceSize = useCallback((newSize: SpaceSize) => {
    setSettings((prev) => ({
      ...prev,
      spaceSize: newSize,
    }));
  }, []);

  return {
    settings,
    updateSpaceSize,
  };
};
