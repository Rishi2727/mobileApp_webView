import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image } from "@/components/ui/custom/image";
import MyDialog from "@/components/ui/custom/MyDialog";
import { commonIcons } from "@/assets";
import { useLanguage } from "@/contexts/useLanguage";
import { useState } from "react";
import { Label } from "@/components/ui/label";

type LanguageSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setLanguage: (lang: string) => void;
  language: string;
};

const LanguageSelector = ({ open, onOpenChange, setLanguage, language }: LanguageSelectorProps) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState(language);

  const languageDialogBody = (
    <div className="space-y-3">
      <RadioGroup
        value={selectedOption}
        onValueChange={setSelectedOption}
        className="space-y-3"
      >
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Image src={commonIcons.usaFlag} alt="English" width={16} height={16} />
            <Label className="text-sm font-medium">English</Label>
          </div>
          <RadioGroupItem value="en" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={commonIcons.southKoreaFlag} alt="Korean" width={16} height={16} />
            <Label className="text-sm font-medium">한국어</Label>
          </div>
          <RadioGroupItem value="ko" />
        </div>
      </RadioGroup>
    </div>
  );

  const handleCancel = () => {
    // Reset to original language selection in UI
    setSelectedOption(language);
    onOpenChange(false);
  };

  const handleOk = () => {
    // Apply the selected language to actual state
    setLanguage(selectedOption);
    onOpenChange(false);
  };

  // ✅ Dialog Footer
  const languageDialogFooter = (
    <div className="flex justify-end pt-4 space-x-2">
      <Button
        variant="secondary"
        className="bg-gray-200 text-black hover:bg-gray-300"
        onClick={handleCancel}
      >
        {t("common.cancel")}
      </Button>
      <Button
        className="bg-primary text-white hover:bg-primary/80"
        onClick={handleOk}
      >
        {t("common.ok")}
      </Button>
    </div>
  );

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("common.language")}
      body={languageDialogBody}
      footer={languageDialogFooter}
    />
  );
};

export default LanguageSelector;
