import React, { useContext, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  BookOpen,
  MessageSquare,
  Send,
  Share2,
  PenSquare,
  User,
} from "lucide-react";
import { SocketContext } from "@/context/socket-context/SocketContext";
import { getContactListService, getMessageService } from "@/services";

const InstructorChat = ({ instructorId }) => {
  const { socket } = useContext(SocketContext);
  console.log(" foenn chat ", instructorId);
  const [contact, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const messageEndRef = useRef(null);

  const courses = [
    { title: "Advanced Web Development", students: 1, revenue: 10 },
    { title: "React Fundamentals", students: 0, revenue: 0 },
  ];

  useEffect(() => {
    (async () => {
      const response = await getContactListService();
      console.log("response", response.data);
      setContacts(response.data);
    })();

    console.log("contact", contact);
  }, []);


  useEffect(() => {
    socket.emit("join", { senderId: instructorId });
    console.log("joined \n\n\n\n");
    
    socket.on("receive-message", (data) => {
      console.log(data);

      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const openChat = async (sender) => {
    setSelectedContact(sender);
    const messages = await getMessageService(sender._id);
    console.log(messages);
    setMessages(messages.data);

  };

  useEffect(() => {

    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const message = {
      _id : Math.ceil(Math.random()*1000000),
      senderId : instructorId,
      receiverId : selectedContact._id,
      message: newMessage,
      createdAt: new Date(),
    };

    socket.emit("send-message", message );
    console.log("message sent");
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const filteredMessages = messages.filter(
    (message) => message.recipientId === selectedContact
  );

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Chat</h2>
      </div>
      <div className="bg-white rounded-lg shadow h-[calc(100%-6rem)] flex">
        {/* Contacts List */}
        <div className="w-80 border-r">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="overflow-y-auto">
            {contact.map((contact) => (
              contact.sender._id === instructorId ? null :
              <button
                key={contact?.sender?._id}
                onClick={() => openChat(contact?.sender)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 border-b ${
                  selectedContact === contact?.sender?.id ? "bg-gray-50" : ""
                }`}
              >
                <div className="relative">
                  {contact?.sender?.avatar ? (
                    <img
                      src={contact?.sender?.avatar || null}
                      alt={contact?.sender?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center">
                      {contact?.sender?.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      contact?.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium truncate">
                      {contact?.sender.name}
                    </p>
                    {contact?.unreadCount > 0 && (
                      <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                        {contact?.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {contact?.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center space-x-3">
                {selectedContact?.avatar ? (
                  <img
                    src={selectedContact?.avatar}
                    alt="Contact"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center">
                    {selectedContact?.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{selectedContact?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact?.status === "online"
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                {messages?.map((message) => (
                  <div
                    key={message?._id}
                    className={`mb-4 flex ${
                      message?.receiverId === instructorId
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.receiverId === instructorId
                          ? "bg-gray-100"
                          : "bg-black text-white"
                      }`}
                    >
                      <p>{message?.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message?.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true, // Use false for 24-hour format
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef}></div>
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white p-2 rounded-lg hover:bg-gray-800"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <User size={48} className="mx-auto mb-4" />
                <p>Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorChat;
