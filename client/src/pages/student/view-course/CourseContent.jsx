import React from 'react';
import { ChevronDown, PlayCircle, CheckCircle } from 'lucide-react';

export const CourseContent = ({ curriculum , currentLecture , progress }) => {

  console.log(curriculum);
  console.log(progress);
  

  return (
    <div className="space-y-4">
      
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            {curriculum?.map((lecture) => (
              <div
                key={lecture?._id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {progress?.find(completedLeture => lecture._id === completedLeture.lectureId ) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <PlayCircle className="w-5 h-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{lecture?.title}</h4>
                  {/* <p className="text-sm text-gray-500">{lecture?.duration}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>
     
  
  );
};