import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import ProfileDetail from "@/features/profile/profileDetail";
import { useEffect, useState } from "react";

const Profile = () => {
  const breadcrumbItems = [
    { id: 1, label: "Dashboard" },
    { id: 2, label: "Profile" },
  ];

  const [timeLeft, setTimeLeft] = useState(30); 

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const myProfile = {
    userName: "Harendra Chauhan",
    userSchoolNo: "STU12345",
    userDeptName: "Computer Science",
    inOutStatus: true,
  };

  return (
    <div className="bg-border-accent h-[90vh]">
      <MyBreadcrumb
        items={breadcrumbItems}
        title="My Profile"
        showBackButton={true}
      />

      <div className="flex flex-col items-center justify-center text-center mt-10">
        {/* Title */}
        <div className="pt-3 font-bold text-xl text-background">
          Mobile Card
        </div>
        <div className="text-primary-200">Scan the QR Code with the reader</div>

        {/* QR Circle */}
        <div className="relative mt-8">
          {/* Circular Progress */}
          <div className="w-52 h-52 rounded-full bg-white flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full border-8 border-t-[#4F8DFB] border-[#E0E7FF] animate-spin-slow"
              style={{
                animation: timeLeft > 0 ? "rotate 30s linear forwards" : "none",
              }}
            ></div>

            {/* QR Code */}
            <div className="w-32 h-32 bg-white shadow-md flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example"
                alt="QR Code"
                className="w-28 h-28"
              />
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-[#D1D5DB] mt-8 text-sm">Time Left</div>
        <div className="text-white font-bold text-2xl">{timeLeft} Seconds</div>

        {/* 🔹 Profile Section (added below timer) */}
        <div className="mt-10 flex relative items-center">
          <ProfileDetail
            text={myProfile.userName[0]}
            textColor="#FFFFFF"
            bgColor="#4F8DFB"
            circleBgColor="#E0E7FF"
            width={350}
            height={210}
          />
          <div className=" text-start absolute w-[60%] left-[70%] transform -translate-x-1/2 top-7">
            <div className="text-lg font-bold text-border-accent">
              {myProfile.userName}
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-semibold">ID:</span> {myProfile.userSchoolNo}
            </div>
            <div className="text-sm text-gray-400 flex">
              <span className="font-semibold">Department:</span>{" "}
              {myProfile.userDeptName}
            </div>
            <div className="text-sm text-gray-400 flex">
              <span className="font-semibold">Entry Status:</span>{" "}
              <span
              >
                {myProfile.inOutStatus ? "IN" : "OUT"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
