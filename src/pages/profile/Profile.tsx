import { QRViewComponent } from "@/components/layout/QRViewComponent";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import Text from "@/components/ui/custom/text";
import { metadata } from "@/config/metadata";
import ProfileDetail from "@/features/profile/profileDetail";
import { useAuthStore } from "@/store/AuthStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { init, stopAndClear, myProfile, getQrCode, myQrCode } = useAuthStore();
  const breadcrumbItems = metadata.profile.breadcrumbItems || [];
  const { t } = useTranslation();
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
          {t('profile.mobileCard')}
        </div>
        <div className="text-primary-200">{t('profile.scanQRInstructions')}</div>

        {/* QR Circle */}
        <div className="relative mt-8">
          {/* Circular Progress */}
          <QRViewComponent
            qrData={myQrCode?.QrData || "I like curious people"}
            generatedAt={myQrCode?.GeneratedAt}
            expireAt={myQrCode?.ExpireAt}
            onRefresh={getQrCode}
            qrTimeRange={null}
            handleLogout={null}
            page="PROFILE"
            t={t}
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
            <Text className="text-lg font-bold text-border-accent">
              {myProfile?.userName}
            </Text>
            <div className="text-sm text-gray-400">
              <span className="font-semibold">{t('profile.id')}:</span>{" "}
              {myProfile?.userSchoolNo}
            </div>
            <div className="text-sm text-gray-400 flex">
              <span className="font-semibold">{t('profile.department')}::</span>{" "}
              {myProfile?.userDeptName}
            </div>
            <div className="text-sm text-gray-400 flex">
              <span className="font-semibold">{t('profile.entryStatus')}:</span>{" "}
              <span>{myProfile?.inOutStatus ? "IN" : "OUT"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
