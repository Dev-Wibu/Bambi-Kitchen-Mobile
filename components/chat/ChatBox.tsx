import { useState, useEffect, useRef } from "react";
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatWithGemini, ChatError, ChatMessage } from "@/services/geminiChatService";
import Toast from "react-native-toast-message";

const CHAT_HISTORY_STORAGE_KEY = "bambi-chat-history";

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onAssistantMessage?: () => void;
}

const createDefaultMessages = (): ChatMessage[] => [
  {
    role: "assistant",
    content: "Xin chào! Tôi là trợ lý BambiKitchen AI. Bạn cần mình hỗ trợ điều gì hôm nay?",
    timestamp: new Date(),
  },
];

const generateMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Chat box component for chatting with Gemini AI
 * Features:
 * - Chat history saved in AsyncStorage
 * - Loading states
 * - Error handling with retry
 * - Keyboard avoiding
 */
export default function ChatBox({ isOpen, onClose, onAssistantMessage }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(createDefaultMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history from storage
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Save chat history to storage whenever messages change
  useEffect(() => {
    if (messages.length > 1) {
      // Only save if there are user messages
      saveChatHistory();
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveChatHistory = async () => {
    try {
      const serialized = messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
      await AsyncStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const handleSend = async (retryMessage?: string) => {
    const messageToSend = retryMessage || input.trim();
    if (!messageToSend || isLoading) return;

    // If retrying, remove the last error message
    if (retryMessage) {
      setMessages((prev) => {
        const filtered = [...prev];
        for (let i = filtered.length - 1; i >= 0; i--) {
          if (filtered[i].isError) {
            filtered.splice(i, 1);
            break;
          }
        }
        return filtered;
      });
      setLastError(null);
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!retryMessage) {
      setInput("");
      setLastUserMessage(messageToSend);
    }
    setLastError(null);
    setIsLoading(true);

    try {
      const response = await chatWithGemini(messageToSend);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onAssistantMessage?.();
    } catch (error) {
      const chatError = error instanceof ChatError ? error : new ChatError("Unknown error");

      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `⚠️ ${chatError.message}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setLastError({
        message: chatError.message,
        canRetry: chatError.shouldRetry,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const handleClearHistory = async () => {
    setMessages(createDefaultMessages());
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      Toast.show({
        type: "success",
        text1: "Chat history cleared",
      });
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="absolute inset-0 z-50"
    >
      {/* Overlay */}
      <Pressable
        className="absolute inset-0 bg-black/50"
        onPress={onClose}
      />

      {/* Chat container */}
      <View className="absolute bottom-0 left-0 right-0 mx-4 mb-4 flex h-[600px] max-h-[80%] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-orange-500 p-4 dark:border-gray-700">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="smart-toy" size={24} color="white" />
            <Text className="text-lg font-semibold text-white">BambiKitchen AI</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable onPress={handleClearHistory} className="p-1">
              <MaterialIcons name="delete-outline" size={20} color="white" />
            </Pressable>
            <Pressable onPress={onClose} className="p-1">
              <MaterialIcons name="close" size={24} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 p-4"
          contentContainerClassName="gap-3"
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const isError = message.isError || message.content.includes("⚠️");

            return (
              <View
                key={index}
                className={`flex-row gap-2 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                    <MaterialIcons name="smart-toy" size={16} color="white" />
                  </View>
                )}

                <View
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isUser
                      ? "bg-orange-500"
                      : isError
                        ? "border border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isUser
                        ? "text-white"
                        : isError
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.content}
                  </Text>
                  <Text
                    className={`mt-1 text-xs ${
                      isUser
                        ? "text-white/70"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                {isUser && (
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                    <MaterialIcons name="person" size={16} color="white" />
                  </View>
                )}
              </View>
            );
          })}

          {isLoading && (
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                <MaterialIcons name="smart-toy" size={16} color="white" />
              </View>
              <View className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
                <ActivityIndicator size="small" color="#FF6D00" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View className="border-t border-gray-200 p-4 dark:border-gray-700">
          {lastError && lastError.canRetry && (
            <View className="mb-2 flex-row items-center justify-between rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
              <View className="flex-1 flex-row items-center gap-2">
                <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                <Text className="flex-1 text-xs text-red-600 dark:text-red-400">
                  Lỗi kết nối. Thử lại?
                </Text>
              </View>
              <Button
                onPress={handleRetry}
                variant="outline"
                size="sm"
                className="h-7 px-2"
              >
                <MaterialIcons name="refresh" size={14} color="#EF4444" />
                <Text className="ml-1 text-xs">Thử lại</Text>
              </Button>
            </View>
          )}

          <View className="flex-row items-center gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              placeholder="Nhập tin nhắn của bạn..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                !input.trim() || isLoading
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "bg-orange-500"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons
                  name="send"
                  size={20}
                  color={!input.trim() ? "#9CA3AF" : "white"}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
