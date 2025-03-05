import React from "react";
import { Trophy, Medal, Award, ChevronUp, ChevronDown } from "lucide-react";

const LeaderboardRow = ({ student, rank }) => {
  // Determine rank styling
  const getRankStyles = () => {
    switch (rank) {
      case 1:
        return {
          rowClass:
            "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300",
          iconComponent: <Trophy className="h-6 w-6 text-amber-500" />,
          rankClass: "bg-amber-500 text-white",
          usernameClass: "text-amber-900 font-bold",
          scoreClass: "text-amber-700 font-bold",
        };
      case 2:
        return {
          rowClass: "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300",
          iconComponent: <Medal className="h-6 w-6 text-gray-500" />,
          rankClass: "bg-gray-500 text-white",
          usernameClass: "text-gray-900 font-bold",
          scoreClass: "text-gray-700 font-bold",
        };
      case 3:
        return {
          rowClass:
            "bg-gradient-to-r from-amber-50 to-orange-100 border-orange-300",
          iconComponent: <Award className="h-6 w-6 text-orange-500" />,
          rankClass: "bg-orange-500 text-white",
          usernameClass: "text-orange-900 font-bold",
          scoreClass: "text-orange-700 font-bold",
        };
      default:
        return {
          rowClass: "bg-white hover:bg-gray-50 border-gray-200",
          iconComponent: null,
          rankClass: "bg-gray-200 text-gray-700",
          usernameClass: "text-gray-900",
          scoreClass: "text-gray-700",
        };
    }
  };

  const styles = getRankStyles();

  return (
    <tr
      className={`${styles.rowClass} border-b transition-all duration-500 `}
    >
      <td className="py-6 px-8 whitespace-nowrap">
        <div className="flex items-center">
          <div
            className={`${styles.rankClass} flex items-center justify-center rounded-full h-10 w-10 mr-4 font-bold text-lg`}
          >
            {rank}
          </div>
          {styles.iconComponent}
        </div>
      </td>
      <td className={`py-6 px-8 ${styles.usernameClass} text-lg`}>
        <div className="flex items-center">{student.userName}</div>
      </td>
      <td
        className={`py-6 px-8 text-right ${styles.scoreClass} text-lg font-semibold`}
      >
        {student.percentage.toFixed(1)}%
      </td>
    </tr>
  );
};

export default LeaderboardRow;
