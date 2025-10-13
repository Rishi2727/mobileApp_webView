import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import Text from '@/components/ui/custom/text';
import { ResponsiveContainer } from '@/components/layout/ResponsiveWrapper';

interface StudentDetail {
  schoolNo: string;
  studentName: string;
}

const Reservation = () => {
  const breadcrumbItems = metadata.reservaton?.breadcrumbItems || [];

  const [students, setStudents] = useState<StudentDetail[]>([
    { schoolNo: '', studentName: '' },
    { schoolNo: '', studentName: '' },
    { schoolNo: '', studentName: '' },
    { schoolNo: '', studentName: '' },
    { schoolNo: '', studentName: '' }
  ]);

  const [selectedTime, setSelectedTime] = useState<number>(30);

  const timeOptions = [30, 60, 90, 120, 150, 180];

  const handleStudentChange = (index: number, field: 'schoolNo' | 'studentName', value: string) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleSubmit = () => {
    const filledStudents = students.filter(s => s.schoolNo || s.studentName);
    if (filledStudents.length < 3) {
      alert('Minimum 3 students details is required');
      return;
    }
    console.log('Submitting reservation:', { students: filledStudents, time: selectedTime });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
          <MyBreadcrumb
            items={breadcrumbItems}
            title="Group Study Reservation"
            showBackButton={true}
          />

      </div>

      {/* Content */}
            <ResponsiveContainer>
      <div className="p-3 ">
        <div className="shadow-md p-3">

            {/* Room and Time Info */}
            <div className="">
              <Text className="text-md font-semibold text-gray-900">Study Room 202</Text>
              <Text variant='h6'>October 13, 2025 8:30 PM</Text>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Student Details Section */}
            <div>
              <Text className="text-md font-semibold text-gray-900">Enter Student User Details</Text>
              <Text variant='h6' className=" mb-4">Minimum 3 students details is required</Text>
              {students.map((student, index) => (
                <div key={index} className="grid grid-cols-2 gap-3 mb-2">
                  <Input
                    type="text"
                    value={student.schoolNo}
                    onChange={(e) => handleStudentChange(index, 'schoolNo', e.target.value)}
                    placeholder="School No."
                    className="h-12"
                  />
                  <Input
                    type="text"
                    value={student.studentName}
                    onChange={(e) => handleStudentChange(index, 'studentName', e.target.value)}
                    placeholder="Student Name"
                    className="h-12"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 my-3"></div>

            {/* Usage Time Section */}
            <div className="">
              <Text className="text-lg font-semibold text-gray-900">Choose Usage Time</Text>
              <Text variant='h6' className="mb-4">For how much time you need the seat</Text>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {timeOptions.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={`h-10 text-base ${
                      selectedTime === time
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-0'
                    }`}
                  >
                    {time} Min
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-center'>
            <Button
              onClick={handleSubmit}
              className="w-full  sm:w-3/4 md:w-1/2 h-12 bg-slate-900 hover:bg-slate-800 text-white text-base  mt-4"
            >
              Submit
            </Button>
            </div>
        </div>
      </div>
      </ResponsiveContainer>
    </div>
  );
};

export default Reservation;