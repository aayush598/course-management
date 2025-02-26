import React, { useState } from "react";
import { Send } from "lucide-react";

export const Chat = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Course Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-3">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
            alt="Instructor"
            className="w-8 h-8 rounded-full"
          />
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
            <p className="text-sm">
              Hello! How can I help you with the course?
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
            <p className="text-sm">Hello!</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
            alt="Instructor"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
