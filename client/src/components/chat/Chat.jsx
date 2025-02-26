import { SocketContext } from "@/context/socket-context/SocketContext";
import { getMessageService } from "@/services";
import { Send } from "lucide-react";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const Chat = ({ senderId, receiverId ,instructorName ,username }) => {
  const { socket } = useContext(SocketContext);
  const [newMessage, setNewMessage] = useState();
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  console.log(username);
  
  useEffect(() => {
    console.log(senderId);
    console.log(receiverId);

    socket.emit("join", { senderId });
    socket.on("receive-message", (data) => {
      console.log(data);

      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => {
      socket.off("receive-message");
    };
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  },[messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      _id: Math.ceil(Math.random() * 1000000),
      senderId,
      receiverId,
      message: newMessage,
      createdAt: new Date(),
    };

    socket.emit("send-message", message);
    console.log("message sent");
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const chat = [
    {
      sender: "Student",
      message: "Hello, I have a question about the assignment.",
      timestamp: "10:00 AM",
    },
    {
      sender: "Instructor",
      message: "Sure, what do you need help with?",
      timestamp: "10:01 AM",
    },
    {
      sender: "Student",
      message: "I am confused about the requirements for the second task.",
      timestamp: "10:02 AM",
    },
    {
      sender: "Instructor",
      message: "The second task requires you to implement a sorting algorithm.",
      timestamp: "10:03 AM",
    },
    {
      sender: "Student",
      message: "Got it, thank you!",
      timestamp: "10:04 AM",
    },
    {
      sender: "Instructor",
      message: "Do you need any further assistance?",
      timestamp: "10:05 AM",
    },
    {
      sender: "Student",
      message: "No, that will be all. Thanks!",
      timestamp: "10:06 AM",
    },
  ];

  useEffect(() => {
    (async () => {
      const messages = await getMessageService(receiverId);
      console.log("message" ,messages);
      setMessages(messages?.data);
    

    })();
  }, []);

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Course Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) =>
          message.senderId === senderId ? (
            <div key={message._id} className="flex gap-3 justify-end">
              <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[80%]">
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-blue-100 mt-1 text-right">
                  {new Date(message?.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex justify-center items-center text-white">
                {username[0]?.toUpperCase()}
              </div>
            </div>
          ) : (
            <div key={message._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex justify-center items-center text-white">
                {instructorName[0]?.toUpperCase()}
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm dark:text-gray-200">
                  {message?.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(message?.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={messageEndRef} ></div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={sendMessage}
            className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
