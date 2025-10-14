import { QRViewComponent } from "@/components/layout/QRViewComponent";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import ProfileDetail from "@/features/profile/profileDetail";
import { useAuthStore } from "@/store/AuthStore";
import { useEffect } from "react";

const Profile = () => {
  const { init, stopAndClear, myProfile, getQrCode, myQrCode } = useAuthStore();
  const breadcrumbItems = metadata.profile.breadcrumbItems || [];

  useEffect(() => {
    init();
    return () => {
      stopAndClear();
    };
  }, [init, stopAndClear]);

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
          <QRViewComponent
            qrData={myQrCode?.QrData || 'I like curious people'}
            generatedAt={myQrCode?.GeneratedAt}
            expireAt={myQrCode?.ExpireAt}
            onRefresh={getQrCode}
            qrTimeRange={null}
            handleLogout={null}
            page="PROFILE"
          />
        </div>
        {/* 🔹 Profile Section (added below timer) */}
        <div className="mt-10 flex relative items-center">
          <ProfileDetail
            text={myProfile?.userName[0]}
            textColor="#FFFFFF"
            bgColor="#27304B"
            circleBgColor="#E0E7FF"
            width={350}
            height={210}
          />
          <div className=" text-start absolute w-[60%] left-[70%] transform -translate-x-1/2 top-7">
            <div className="text-lg font-bold text-border-accent">
              {myProfile?.userName}
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-semibold">ID:</span> {myProfile?.userSchoolNo}
            </div>
            <div className="text-sm text-gray-400 flex">
              <span className="font-semibold">Department:</span>{" "}
              {myProfile?.userDeptName}
            </div>
            <div className="text-sm text-gray-400 flex">
              <span className="font-semibold">Entry Status:</span>{" "}
              <span
              >
                {myProfile?.inOutStatus ? "IN" : "OUT"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;