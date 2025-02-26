import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const sampleQuiz = [
  {
    id: '1',
    question: 'What is the main purpose of Python classes?',
    options: [
      'To create objects',
      'To define data types',
      'To organize code and data',
      'All of the above'
    ],
    correctAnswer: 3
  }
];

export const Quiz = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="space-y-6">
      {sampleQuiz.map((q) => (
        <div key={q.id} className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">{q.question}</h3>
          
          <div className="space-y-3">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: index }))}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedAnswers[q.id] === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {option}
                {showResults && selectedAnswers[q.id] === index && (
                  <span className="float-right">
                    {index === q.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {!showResults && (
            <button
              onClick={() => setShowResults(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Submit Answer
            </button>
          )}
        </div>
      ))}
    </div>
  );
};