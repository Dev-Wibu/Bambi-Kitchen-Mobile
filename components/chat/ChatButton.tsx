import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import ChatBox from "./ChatBox";

interface ChatButtonProps {
  className?: string;
}

/**
 * Floating chat button component (bottom-right)
 * Similar to WEB ChatButton but for React Native
 */
export function ChatButton({ className }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Only show chat button if user is authenticated
  const canUseChat = !!user;

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Close chat if user logs out
  useEffect(() => {
    if (!canUseChat && isOpen) {
      setIsOpen(false);
    }
  }, [canUseChat, isOpen]);

  const handleAssistantMessage = () => {
    if (!isOpen) {
      setUnreadCount((prev) => Math.min(prev + 1, 99));
    }
  };

  if (!canUseChat) {
    return null;
  }

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <Pressable
          onPress={() => setIsOpen(true)}
          className="absolute bottom-4 right-4 z-50 h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg active:scale-95"
          style={{
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}>
          <MaterialIcons name="chat" size={24} color="white" />
          {unreadCount > 0 && (
            <View className="absolute -right-1 -top-1">
              <Badge className="h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </Badge>
            </View>
          )}
        </Pressable>
      )}

      {/* Chat box modal */}
      {isOpen && (
        <ChatBox
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onAssistantMessage={handleAssistantMessage}
        />
      )}
    </>
  );
}
