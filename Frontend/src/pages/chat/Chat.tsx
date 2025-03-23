
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount: number;
  userType: "consumer" | "farmer";
}

// Mock data
const mockContacts: ChatContact[] = [
  {
    id: "user1",
    name: "John Consumer",
    avatar: "https://i.pravatar.cc/150?u=john",
    lastMessage: "Thanks for the fresh produce!",
    unreadCount: 0,
    userType: "consumer"
  },
  {
    id: "user2",
    name: "Mary Farmer",
    avatar: "https://i.pravatar.cc/150?u=mary",
    lastMessage: "Your order has been shipped",
    unreadCount: 2,
    userType: "farmer"
  },
  {
    id: "user3",
    name: "Green Valley Farms",
    avatar: "https://i.pravatar.cc/150?u=green",
    lastMessage: "Do you need any recommendations?",
    unreadCount: 1,
    userType: "farmer"
  }
];

const mockMessages: { [key: string]: ChatMessage[] } = {
  "user1": [
    {
      id: "msg1",
      senderId: "user1",
      text: "Hi there! I just received my order of apples.",
      timestamp: new Date(Date.now() - 240000),
      read: true
    },
    {
      id: "msg2",
      senderId: "currentUser",
      text: "Great! How was the quality?",
      timestamp: new Date(Date.now() - 180000),
      read: true
    },
    {
      id: "msg3",
      senderId: "user1",
      text: "They're amazing! Very fresh and sweet.",
      timestamp: new Date(Date.now() - 120000),
      read: true
    },
    {
      id: "msg4",
      senderId: "currentUser",
      text: "I'm glad you enjoyed them! Let me know if you need anything else.",
      timestamp: new Date(Date.now() - 60000),
      read: true
    },
    {
      id: "msg5",
      senderId: "user1",
      text: "Thanks for the fresh produce!",
      timestamp: new Date(Date.now() - 30000),
      read: true
    }
  ],
  "user2": [
    {
      id: "msg1",
      senderId: "currentUser",
      text: "Hello, I'd like to ask about my recent order.",
      timestamp: new Date(Date.now() - 360000),
      read: true
    },
    {
      id: "msg2",
      senderId: "user2",
      text: "Hi there! What can I help you with?",
      timestamp: new Date(Date.now() - 300000),
      read: true
    },
    {
      id: "msg3",
      senderId: "currentUser",
      text: "When will my order be shipped?",
      timestamp: new Date(Date.now() - 240000),
      read: true
    },
    {
      id: "msg4",
      senderId: "user2",
      text: "Your order has been packed and will be shipped tomorrow.",
      timestamp: new Date(Date.now() - 180000),
      read: true
    },
    {
      id: "msg5",
      senderId: "user2",
      text: "Your order has been shipped",
      timestamp: new Date(Date.now() - 30000),
      read: false
    },
    {
      id: "msg6",
      senderId: "user2",
      text: "You should receive it within 2-3 business days.",
      timestamp: new Date(Date.now() - 15000),
      read: false
    }
  ]
};

const Chat = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>(mockContacts);
  const [activeChat, setActiveChat] = useState<string | null>(id || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Set active chat from param or first contact
    if (id) {
      setActiveChat(id);
    } else if (contacts.length > 0 && !activeChat) {
      setActiveChat(contacts[0].id);
    }
  }, [id, contacts, activeChat]);
  
  useEffect(() => {
    // Load messages for active chat
    if (activeChat) {
      setMessages(mockMessages[activeChat] || []);
      
      // Mark messages as read
      if (mockMessages[activeChat]) {
        mockMessages[activeChat] = mockMessages[activeChat].map(msg => ({
          ...msg,
          read: true
        }));
        
        // Update unread count
        setContacts(prev => 
          prev.map(contact => 
            contact.id === activeChat 
              ? { ...contact, unreadCount: 0 } 
              : contact
          )
        );
      }
    }
  }, [activeChat]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const newMsg: ChatMessage = {
      id: `msg${Date.now()}`,
      senderId: "currentUser",
      text: newMessage,
      timestamp: new Date(),
      read: true
    };
    
    // Add message to current chat
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    
    // Update in mock data
    if (mockMessages[activeChat]) {
      mockMessages[activeChat] = updatedMessages;
    } else {
      mockMessages[activeChat] = [newMsg];
    }
    
    // Update last message in contacts
    setContacts(prev => 
      prev.map(contact => 
        contact.id === activeChat 
          ? { ...contact, lastMessage: newMessage } 
          : contact
      )
    );
    
    setNewMessage("");
  };
  
  const getActiveContact = () => {
    return contacts.find(contact => contact.id === activeChat);
  };
  
  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Contacts List */}
        <div className="md:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto py-0">
              <div className="space-y-2">
                {contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      activeChat === contact.id 
                        ? "bg-farm-green-50 border-l-4 border-farm-green-500" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveChat(contact.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{contact.name}</p>
                          {contact.unreadCount > 0 && (
                            <span className="bg-farm-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {contact.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Chat Window */}
        <div className="md:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={getActiveContact()?.avatar} alt={getActiveContact()?.name} />
                      <AvatarFallback>{getActiveContact()?.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{getActiveContact()?.name}</CardTitle>
                      <p className="text-sm text-gray-500 capitalize">
                        {getActiveContact()?.userType}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-y-auto pt-4 pb-0">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.senderId === "currentUser" ? "justify-end" : "justify-start"}`}
                        >
                          <div 
                            className={`max-w-[80%] px-4 py-2 rounded-lg ${
                              message.senderId === "currentUser" 
                                ? "bg-farm-green-500 text-white" 
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 text-right ${
                              message.senderId === "currentUser" 
                                ? "text-farm-green-100" 
                                : "text-gray-500"
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation by sending a message</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                
                <div className="p-4 border-t mt-auto">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-grow"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Select a conversation to start chatting</p>
                  {contacts.length === 0 && (
                    <p className="text-sm text-gray-400">No conversations yet</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
