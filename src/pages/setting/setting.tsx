import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";
import { ChevronRight } from "lucide-react";
import Text from "@/components/ui/custom/text";
import LanguageSelector from "@/features/language-selector/language-selector";
import { useNavigate } from "react-router";


const Setting = () => {
  const breadcrumbItems = metadata.setting.breadcrumbItems || [];
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    push: true,
    seat: true,
    group: true,
    carrel: true,
  });

  const [language, setLanguage] = useState("english");
  const [open, setOpen] = useState(false);


  return (
    <div className="min-h-[90vh] bg-gray-50">
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
              <Text variant="h3">Push Notifications</Text>
              <Text variant="h6" className="w-[80%]">
                Notifications enabled for selected categories. You will receive
                University Messages
              </Text>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(val) =>
                setNotifications({ ...notifications, push: val })
              }
            />
          </div>

          {[
            { key: "seat", label: "Seat/PC Booking" },
            { key: "group", label: "Group Booking" },
            { key: "carrel", label: "Carrel Booking" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center border-t border-gray-200 pt-2"
            >
              <div>
                <Text variant="h3" className="font-semibold">
                  {item.label}
                </Text>
                <Text variant="h6">
                  You&apos;ll receive notifications for this category
                </Text>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(val) =>
                  setNotifications({ ...notifications, [item.key]: val })
                }
              />
            </div>
          ))}
        </Card>

        {/* Language and Preferred Seat */}
        <div className="p-3 bg-background rounded-md">
          <div className="flex justify-between items-center border-b pb-2">
            <Text variant="h3">Language</Text>
            <Button
              variant="secondary"
              className="bg-primary-100 text-gray-700"
              onClick={() => setOpen(true)}
            >
              {language === "english" ? "English" : "한국어"}
            </Button>
          </div>

          <div className="flex justify-between items-center border-gray-200 pt-2">
            <Text variant="h3">Preferred Seat</Text>
            <Button
              variant="ghost"
              className="flex items-center bg-primary-200 text-gray-700"
              onClick={() => navigate("/settings-preferred-seat")}
            >
              View <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Developer Info */}
        <div className="p-4 text-sm bg-white rounded-md space-y-4">
          {[
            { label: "Developer", value: "Wise Neosco" },
            { label: "Contact", value: "info@wiseneosco.com", isLink: true },
            { label: "App version", value: "20250910.2 (8)" },
          ].map((item, index, arr) => (
            <div
              key={item.label}
              className={`flex justify-between pb-2 ${
                index < arr.length - 1 ? "border-b" : ""
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
          <Button className="bg-black text-white w-[50%] rounded-full hover:bg-gray-800">
            Logout
          </Button>
        </div>
      </div>

      {/* ✅ Language Dialog (using MyDialog) */}
      <LanguageSelector open={open} onOpenChange={setOpen} setLanguage={setLanguage} language = {language}/>
    </div>
  );
};

export default Setting;
