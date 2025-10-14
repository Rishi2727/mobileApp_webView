import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { ChevronRight } from "lucide-react";
import Text from "@/components/ui/custom/text";
import { useNavigate } from "react-router";
import LanguageSelector from "@/features/language-selector/languageSelector";
import { useAuthStore } from "@/store/AuthStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { useLanguage } from "@/contexts/useLanguage";


const Setting = () => {
  const breadcrumbItems = metadata.setting.breadcrumbItems || [];
  const navigate = useNavigate();
  const { pushAll, push401, push403, push404,
    setPush401, setPush402, setPush403, setPush404,
    toggleAllPushSettings } = useSettingsStore();
  const [notificationPermissionDevice, setNotificationPermissionDevice] = useState<boolean>(pushAll);

  const { logout } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setNotificationPermissionDevice(pushAll);
  }, [pushAll]);

  return (
    <div className="min-h-[90vh] bg-primary-50">
      {/* Breadcrumb */}
      <MyBreadcrumb
        items={breadcrumbItems}
        title="Settings"
        showBackButton={true}
      />

      {/* Settings Card */}
      <div className="p-3 sm:p-6 max-w-3xl mx-auto space-y-2">
        {/* Notification Section */}
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <Text variant="h3">{t("settings.pushNotifications")}</Text>
              <Text variant="h6">
                {pushAll ? t("settings.MainNotificationsAllowed") : t("settings.MainNotificationsNotAllowed")}
              </Text>
            </div>
            <Switch
              checked={pushAll}
              onCheckedChange={() => toggleAllPushSettings(!pushAll)}
            />
          </div>

          {[
            { key: "seat", label: t("settings.seatPCTicketing"), checked: push401, onChange: () => { setPush401(!push401); setPush402(!push401) } },
            { key: "group", label: t("settings.groupTicketing"), checked: push403, onChange: () => setPush403(!push403) },
            { key: "carrel", label: t("settings.carrelTicketing"), checked: push404, onChange: () => setPush404(!push404) },
          ].map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center border-t border-primary-200 pt-2"
            >
              <div>
                <Text variant="h3" className="font-semibold">
                  {item.label}
                </Text>
                <Text variant="h6">
                  {item.checked ? t("settings.notificationsAllowed") : t("settings.notificationsNotAllowed")}
                </Text>
              </div>
              <Switch
                checked={item.checked}
                disabled={!pushAll || !notificationPermissionDevice}
                onCheckedChange={item.onChange}
              />
            </div>
          ))}
        </Card>

        {/* Language and Preferred Seat */}
        <div className="p-3 bg-background rounded-md">
          <div className="flex justify-between items-center border-b pb-2">
            <Text variant="h3">{t("common.language")}</Text>
            <Button
              variant="secondary"
              className="bg-primary-100 text-primary-400"
              onClick={() => setOpen(true)}
            >
              {language === "en" ? "English" : "한국어"}
            </Button>
          </div>

          <div className="flex justify-between items-center border-primary-100 pt-2">
            <Text variant="h3">Preferred Seat</Text>
            <Button
              variant="ghost"
              className="flex items-center bg-primary-200 text-primary-400"
              onClick={() => navigate("/settings-preferred-seat")}
            >
              {t("settings.view")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Developer Info */}
        <div className="p-4 text-sm bg-background rounded-md space-y-4">
          {[
            { label: t("common.developer"), value: t("common.WiseNeosco") },
            { label: t("common.contact"), value: "info@wiseneosco.com", isLink: true },
            { label: t("common.appVersion"), value: "20250910.2 (8)" },
          ].map((item, index, arr) => (
            <div
              key={item.label}
              className={`flex justify-between pb-2 ${index < arr.length - 1 ? "border-b" : ""
                }`}
            >
              <Text className="font-semibold">{item.label}</Text>
              {item.isLink ? (
                <Text className="text-blue-600">{item.value}</Text>
              ) : (
                <Text>{item.value}</Text>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center bg-background p-2">
          <Button className="bg-black text-background w-[50%] rounded-full hover:bg-gray-800" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* ✅ Language Dialog (using MyDialog) */}
      <LanguageSelector open={open} onOpenChange={setOpen} setLanguage={setLanguage} language={language} />
    </div>
  );
};

export default Setting;
