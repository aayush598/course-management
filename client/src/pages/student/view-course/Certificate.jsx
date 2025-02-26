import React from 'react';
import { Check } from 'lucide-react';

export const Certificate = ({ progress, onGetCertificate }) => {
  const isCompleted = progress === 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      {isCompleted ? (
        <>
          <Check className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
          <p className="mb-6">You have completed the course and earned your certificate!</p>
          <button
            onClick={onGetCertificate}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Download Certificate
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full mb-4 flex items-center justify-center">
            <span className="text-xl font-bold">{progress}%</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Keep Going!</h2>
          <p>Complete the course to earn your certificate</p>
        </>
      )}
    </div>
  );
};