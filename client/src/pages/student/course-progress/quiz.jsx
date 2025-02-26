import { useState, useEffect } from "react";
import axios from "axios";

function Quiz({ topic , isDarkMode }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic) {
      generateQuiz();
    }
  }, [topic]); // Automatically generate quiz when topic changes

  const generateQuiz = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/quiz/generate-quiz", { topic });
      console.log("Quiz generated for topic:", topic);
      setQuiz(response.data);
      setAnswers({});
      setScore(null);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (question, option) => {
    setAnswers({ ...answers, [question]: option });
  };

  const submitQuiz = async () => {
    try {
      const response = await axios.post("http://localhost:5000/quiz/submit-quiz", {
        topic,
        questions: quiz.questions,
        userResponses: answers,
      });
      setScore(`You scored ${response.data.score} out of ${quiz.questions.length}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Try again.");
    }
  };

  // const [isDarkMode, setIsDarkMode] = useState(isDarkMode);
  


  return (
    <div className={`flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-[#1c1d1f] text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`shadow-lg rounded-lg p-6 max-w-xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Quiz on: {topic || "Loading..."}
          </h1>
          
        </div>

        {loading && <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generating quiz...</p>}

        {quiz && (
          <div className="mt-6">
            {quiz.questions.map((q, index) => (
              <div key={index} className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{q.question}</h3>
                {q.options.map((option, i) => (
                  <label key={i} className={`block p-2 cursor-pointer rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                    <input
                      type="radio"
                      name={q.question}
                      value={option}
                      onChange={() => handleChange(q.question, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={submitQuiz}
              className={`mt-4 px-4 py-2 rounded-lg transition w-full ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              Submit Quiz
            </button>
          </div>
        )}

        {score && <h2 className={`mt-4 text-lg font-semibold text-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</h2>}
      </div>
    </div>
  );
}

export default Quiz;
