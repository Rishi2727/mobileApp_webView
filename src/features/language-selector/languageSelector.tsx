import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image } from "@/components/ui/custom/image";
import MyDialog from "@/components/ui/custom/MyDialog";
import { commonIcons } from "@/assets";

type LanguageSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setLanguage: (lang: string) => void;
  language : string;
};

const LanguageSelector = ({ open, onOpenChange , setLanguage, language}: LanguageSelectorProps) => {

  const languageDialogBody = (
    <div className="space-y-3">
      <RadioGroup
        value={language}
        onValueChange={setLanguage}
        className="space-y-3"
      >
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Image src={commonIcons.usaFlag} alt="English" width={16} height={16} />
            <label className="text-sm font-medium">English</label>
          </div>
          <RadioGroupItem value="english" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={commonIcons.southKoreaFlag} alt="Korean" width={16} height={16} />
            <label className="text-sm font-medium">한국어</label>
          </div>
          <RadioGroupItem value="korean" />
        </div>
      </RadioGroup>
    </div>
  );

  // ✅ Dialog Footer
  const languageDialogFooter = (
    <div className="flex justify-end pt-4 space-x-2">
      <Button
        variant="secondary"
        className="bg-gray-200 text-black hover:bg-gray-300"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        className="bg-primary text-white hover:bg-primary/80"
        onClick={() => onOpenChange(false)}
      >
        OK
      </Button>
    </div>
  );

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Language"
      body={languageDialogBody}
      footer={languageDialogFooter}
    />
  );
};

export default LanguageSelector;
