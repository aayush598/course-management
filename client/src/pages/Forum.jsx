import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context"; // ✅ Import AuthContext

function Forum() {
    const { auth } = useContext(AuthContext); // ✅ Get logged-in user info
    const [threads, setThreads] = useState([]);
    const [newThread, setNewThread] = useState({ title: "", content: "" });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5000/forum/threads").then(res => setThreads(res.data));
    }, []);

    const handleCreateThread = async () => {
        if (!newThread.title.trim() || !newThread.content.trim()) {
            alert("Title and content are required.");
            return;
        }

        if (!auth?.user?.userName) {
            alert("User must be logged in to create a thread.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/forum/threads", {
                title: newThread.title,
                content: newThread.content,
                author: auth.user.userName // ✅ Use logged-in user's userName
            });

            setThreads([...threads, res.data]);
            setNewThread({ title: "", content: "" });
        } catch (error) {
            console.error("Failed to create thread:", error.response?.data?.message || error.message);
            alert("Failed to create thread. Check console for details.");
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-6">Discussion Forum</h1>
            <div className="bg-white p-4 rounded shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-2">Create a New Thread</h2>
                <input className="w-full p-2 border rounded mb-2" type="text" placeholder="Title" value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} />
                <textarea className="w-full p-2 border rounded mb-2" placeholder="Content" value={newThread.content} onChange={(e) => setNewThread({...newThread, content: e.target.value})} />
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCreateThread}>Create Thread</button>
            </div>
            <ul className="space-y-4">
                {threads.map(thread => (
                    <li key={thread.threadId} className="bg-white p-4 rounded shadow-md cursor-pointer" onClick={() => navigate(`/forum/thread/${thread.threadId}`)}>
                        <h3 className="text-lg font-semibold">{thread.title}</h3>
                        <p className="text-gray-600">by {thread.author}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Forum;
