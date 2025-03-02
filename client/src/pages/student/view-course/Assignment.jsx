import React, { useState, useEffect } from "react";
import axios from "axios";

const Assignment = ({ courseId, courseName }) => { // ✅ Accept courseName
    const [assignments, setAssignments] = useState([]); // ✅ Default empty array
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                console.log("Fetching assignments for course:", courseName);
                const response = await axios.get(`http://localhost:5000/assignments/${courseId}/${courseName}`);

                if (response.data.success) {
                    setAssignments(response.data.assignments);
                } else {
                    throw new Error("Failed to load assignments from server.");
                }
            } catch (error) {
                console.error("Error in fetchAssignments:", error.message);
                setError(`Error in fetching assignments: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && courseName) { // ✅ Ensure courseId and courseName exist
            fetchAssignments();
        }
    }, [courseId, courseName]);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (index) => {
        if (!file) {
            alert("Please upload a file");
            return;
        }

        const formData = new FormData();
        formData.append("assignmentFile", file);

        try {
            console.log(`Submitting assignment ${index} for course ID: ${courseId}`);
            const response = await axios.post(`http://localhost:5000/assignments/submit/${courseId}/${index}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setFeedback(response.data.evaluation);
        } catch (error) {
            console.error("Error in handleSubmit:", error.message);
            setError(`Error in submitting assignment: ${error.message}`);
        }
    };

    if (loading) return <p>Loading assignments...</p>;
    if (error) return <p className="text-red-500">⚠️ {error}</p>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Assignments</h2>

            {assignments.length === 0 ? (
                <p>No assignments available.</p>
            ) : (
                <ul>
                    {assignments.map((assignment, index) => (
                        <li key={index} className="mb-2">
                            <button
                                className="text-blue-600 hover:underline"
                                onClick={() => setSelectedAssignment({ ...assignment, index })}
                            >
                                {assignment.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {selectedAssignment && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-xl font-semibold">{selectedAssignment.title}</h3>
                    <p className="mt-2">{selectedAssignment.description}</p>
                    <p className="mt-2 text-gray-600">{selectedAssignment.content}</p>

                    <input type="file" className="mt-4" onChange={handleFileChange} />
                    <button
                        className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-lg"
                        onClick={() => handleSubmit(selectedAssignment.index)}
                    >
                        Submit
                    </button>

                    {feedback && (
                        <div className="mt-4 p-4 bg-green-100 rounded-lg">
                            <h4 className="font-semibold">Evaluation</h4>
                            <p><strong>Score:</strong> {feedback.score}/100</p>
                            <p><strong>Remarks:</strong> {feedback.remarks}</p>

                            {/* Grammar Section */}
                            <h4 className="font-semibold mt-3">Grammar & Language</h4>
                            <p><strong>Issues:</strong> {feedback.grammar?.issues || 0}</p>
                            <ul className="list-disc pl-5">
                                {feedback.grammar?.suggestions?.map((s, idx) => (
                                    <li key={idx}>{s}</li>
                                ))}
                            </ul>

                            {/* Plagiarism Section */}
                            <h4 className="font-semibold mt-3">Plagiarism Check</h4>
                            <p><strong>Detected:</strong> {feedback.plagiarism?.detected ? "Yes" : "No"}</p>
                            <p><strong>Similarity Percentage:</strong> {feedback.plagiarism?.similarity_percentage}%</p>

                            {/* Accuracy Section */}
                            <h4 className="font-semibold mt-3">Technical Accuracy</h4>
                            <p><strong>Correct Facts:</strong> {feedback.accuracy?.correct_facts || 0}</p>
                            <p><strong>Incorrect Facts:</strong> {feedback.accuracy?.incorrect_facts || 0}</p>
                            <ul className="list-disc pl-5">
                                {feedback.accuracy?.corrections?.map((c, idx) => (
                                    <li key={idx}>{c}</li>
                                ))}
                            </ul>

                            {/* Improvements Section */}
                            <h4 className="font-semibold mt-3">Areas of Improvement</h4>
                            <ul className="list-disc pl-5">
                                {feedback.improvements?.map((imp, idx) => (
                                    <li key={idx}>{imp}</li>
                                ))}
                            </ul>

                            {/* Missing Points Section */}
                            <h4 className="font-semibold mt-3">Missing Key Points</h4>
                            <ul className="list-disc pl-5">
                                {feedback.missing_points?.map((mp, idx) => (
                                    <li key={idx}>{mp}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Assignment;
