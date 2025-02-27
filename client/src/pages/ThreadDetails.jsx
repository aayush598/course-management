import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/auth-context";
import { useState, useEffect ,useContext} from "react";



function ThreadDetails() {
    const { threadId } = useParams();
    const [thread, setThread] = useState(null);
    const [error, setError] = useState(null);
    const [newReply, setNewReply] = useState("");
    const { auth } = useContext(AuthContext);
    
    useEffect(() => {
        axios.get(`http://localhost:5000/forum/threads/${threadId}`)
            .then(res => setThread(res.data))
            .catch(err => setError("Thread not found"));
    }, [threadId]);

    const handleCreateReply = async () => {
        if (!newReply.trim()) {
            alert("Reply cannot be empty");
            return;
        }
        
        if (!auth?.user?.userName) {
            alert("User must be logged in to reply.");
            return;
        }
    
        try {
            const res = await axios.post(`http://localhost:5000/forum/threads/${threadId}/replies`, { 
                content: newReply, 
                author: auth.user.userName  // ✅ Use correct key for username
            });
    
            setThread({ ...thread, replies: [...thread.replies, res.data] });
            setNewReply("");
        } catch (error) {
            console.error("Failed to post reply:", error.response?.data?.message || error.message);
            alert("Failed to post reply. Check console for details.");
        }
    };
    
    
    

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!thread) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-6">{thread.title}</h1>
            <p className="text-lg mb-4">{thread.content}</p>
            <p className="text-gray-600">by {thread.author}</p>
            <div className="mt-6">
                <h2 className="text-xl font-semibold">Replies</h2>
                <ul className="mt-2 border-t pt-2">
                    {thread.replies.map(reply => (
                        <li key={reply._id} className="bg-gray-200 p-2 rounded mb-1">{reply.content}</li>
                    ))}
                </ul>
                <input className="w-full p-2 border rounded mb-2" type="text" placeholder="Your Reply" value={newReply} onChange={(e) => setNewReply(e.target.value)} />
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleCreateReply}>Reply</button>
            </div>
        </div>
    );
}

export default ThreadDetails;
