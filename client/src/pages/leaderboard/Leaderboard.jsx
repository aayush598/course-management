import React, { useState, useEffect } from "react";
import LeaderboardRow from "./LeaderboardRows.jsx";

import { Trophy, Medal, Award } from "lucide-react";
import { getLeaderboardService } from "@/services";

const Leaderboard = () => {
  const [students, setStudents] = useState([]);

  const getLeaderBoard = async () => {
    const response = await getLeaderboardService();
    if (response.success) {
      setStudents(response.data);
    }

    console.log(response.data);
  };

  useEffect(() => {
    getLeaderBoard();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto">
      

      <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className=" px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 mr-4" />
            <h2 className="text-2xl font-bold">
              Student Leaderboard
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-8 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <LeaderboardRow
                  key={student.id}
                  student={student}
                  rank={index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
