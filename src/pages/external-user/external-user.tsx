import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MyForm, {
  type FormFieldItem,
} from "@/components/ui/custom/my-form/MyForm";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, Loader2, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { QRViewComponent } from "@/components/layout/QRViewComponent";
import useExternalUserStore from "@/store/ExternalUserStore";
import { useTranslation } from "react-i18next";

import type { OneDayPass, OtpInfo } from "@/types/models";
import moment from "moment";

const oneDayPassSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  phoneno: z.string().min(5, {
    message: "Number must be at least 5 digits.",
  }),
});

const otpInfo = z.object({
  otp: z.string().min(6, {
    message: "The OTP should be of 6-digits",
  }),
});

// Define step type as const
const ExternalUserStep = {
  ENTER_DETAILS: "ENTER_DETAILS",
  ENTER_OTP: "ENTER_OTP",
  SHOW_QR: "SHOW_QR",
} as const;

type ExternalUserStepType =
  (typeof ExternalUserStep)[keyof typeof ExternalUserStep];

// OTP Timer Component with proper types
interface OtpExpireProps {
  expireAt: string | null;
  t: (key: string) => string;
}


// OTP Timer Component
const OtpExpire: React.FC<OtpExpireProps> = ({ expireAt, t }) => {
  const [expTxt, setExpTxt] = useState("");

  useEffect(() => {
    if (!expireAt) return;

    const timer = setInterval(() => {
      const now = moment();
      const expTime = moment(expireAt.replace(' ', 'T'));
      const diff = expTime.diff(now);

      if (diff <= 0) {
        setExpTxt(t ? t("externalUser.otpExpired") : "OTP Expired");
        clearInterval(timer);
      } else {
        const duration = moment.duration(diff);
        const minutes = Math.floor(duration.asMinutes());
        const seconds = duration.seconds();
        setExpTxt(
          t
            ? `${t("externalUser.otpExpiresIn")} ${minutes}m ${seconds}s`
            : `Expires in ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expireAt, t]);

  return (
    <div className="text-sm text-center mt-2 text-muted-foreground">
      {expTxt}
    </div>
  );
};


export default function ExternalUser() {
  const navigate = useNavigate();
  const [consentAllowed, setConsentAllowed] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [currentStep, setCurrentStep] = useState<ExternalUserStepType>(
    ExternalUserStep.ENTER_DETAILS
  );
  const { t } = useTranslation();

  //store Data
  const {
    userName,
    encOtpTxnData,
    encUserToken,
    encQrData,
    qrTimeRange,
    qrGeneratedAt,
    qrExpireAt,
    otpExpireAt,
    isSubmittingDetails,
    isSubmittingOTP,
    isGeneratingQR,
    isAuthenticated,
    isTokenExpired,
    isOtpExpired,
    isQrCodeGenerated,
    submitDetails,
    submitOTP,
    generateQRByToken,
    clearAllData,
  } = useExternalUserStore();

  // Check authentication status on mount
  useEffect(() => {
    if (isAuthenticated() || isQrCodeGenerated()) {
      setCurrentStep(ExternalUserStep.SHOW_QR);
      if (encUserToken && !isTokenExpired() && !isQrCodeGenerated()) {
        generateQRByToken();
      }
    } else {
      setCurrentStep(ExternalUserStep.ENTER_DETAILS);
    }
  }, [
    encUserToken,
    generateQRByToken,
    isAuthenticated,
    isQrCodeGenerated,
    isTokenExpired,
  ]);

  // Handle form submit for details
  const handleSubmit = async (values: OneDayPass) => {
    console.log("Form submitted with values:", values);
    try {
      await submitDetails({
        name: values.username,
        phoneNumber: values.phoneno,
      });

      if (isQrCodeGenerated()) {
        setCurrentStep(ExternalUserStep.SHOW_QR);
      } else {
        setCurrentStep(ExternalUserStep.ENTER_OTP);
      }
    } catch (error) {
      console.error("Error submitting details:", error);
    }
  };

  // Handle OTP submit
  const handleOtpSubmit = async (values: OtpInfo) => {
    if (!encOtpTxnData || isOtpExpired()) {
      clearAllData();
      setCurrentStep(ExternalUserStep.ENTER_DETAILS);
      alert("OTP expired. Please try again.");
      return;
    }

    try {
      await submitOTP({ otp: String(values.otp), encOtpTxnData });
      setCurrentStep(ExternalUserStep.SHOW_QR);
    } catch (error) {
      console.error("Error submitting OTP:", error);
    }
  };

  // Handle generate new QR
  const handleGenerateNewQR = async () => {
    if (!isAuthenticated()) {
      clearAllData();
      setCurrentStep(ExternalUserStep.ENTER_DETAILS);
      return;
    }

    try {
      await generateQRByToken();
    } catch (error) {
      console.error("Error generating QR:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearAllData();
    setCurrentStep(ExternalUserStep.ENTER_DETAILS);
    setConsentAllowed(false);
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate(-1);
  };

  const formItemOtpData: FormFieldItem<OtpInfo>[] = [
    {
      label: "OTP Code",
      name: "otp",
      render: ({ field }) => (
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Enter 6-digit OTP"
            type="text"
            maxLength={6}
            className="pl-10 h-12 text-center text-lg tracking-widest"
            {...field}
          />
        </div>
      ),
    },
  ];

  const formItemData: FormFieldItem<OneDayPass>[] = [
    {
      label: "Full Name",
      name: "username",
      render: ({ field }) => (
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Enter your full name"
            className="pl-10 h-12"
            {...field}
          />
        </div>
      ),
    },
    {
      label: "Phone Number",
      name: "phoneno",
      render: ({ field }) => (
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Enter your phone number"
            type="tel"
            className="pl-10 h-12"
            {...field}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="border-0 shadow-md">
            <CardHeader className="space-y-6">
              {/* Welcome Text */}
              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">
                  {currentStep === ExternalUserStep.SHOW_QR && userName
                    ? userName
                    : "One Day Pass Request"}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {currentStep === ExternalUserStep.ENTER_DETAILS &&
                    "Enter your details to get started"}
                  {currentStep === ExternalUserStep.ENTER_OTP &&
                    "Enter the OTP for verification"}
                  {currentStep === ExternalUserStep.SHOW_QR &&
                    "Your QR Code for Library Access"}
                </CardDescription>
              </div>
            </CardHeader>

            {/* STEP 1: Enter Details */}
            {currentStep === ExternalUserStep.ENTER_DETAILS && (
              //  *Personal Info Consent  section

              <CardContent className="space-y-6">
                <MyForm
                  formSchema={oneDayPassSchema}
                  defaultValues={{
                    username: "",
                    phoneno: "",
                  }}
                  onSubmit={handleSubmit}
                  formItemData={formItemData}
                  buttonActions={
                    <div className="grid grid-row-1 sm:grid-row-2 gap-2">
                      {/* ✅ Consent and Table Section Added Below */}
                      <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="consent"
                              checked={consentAllowed}
                              onCheckedChange={(checked) =>
                                setConsentAllowed(checked === true)
                              }
                            />
                            <label
                              htmlFor="consent"
                              className="text-sm text-muted-foreground"
                            >
                              *Personal Info Consent (required)
                            </label>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="text-sm"
                            onClick={() => setShowTable(!showTable)}
                          >
                            {showTable ? "Hide Details" : "View Details"}
                          </Button>
                        </div>

                        {/* ✅ Smooth Transition using AnimatePresence */}
                        <AnimatePresence>
                          {showTable && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <p className="text-[11px] text-center ">
                                We collect and use personal information as
                                follows for the operation of QR services
                                entering the library of the Korea Maritime
                                University.
                              </p>

                              <div className="border rounded-lg mt-4">
                                <div className="grid grid-cols-3 text-center border-b text-xs font-medium bg-muted">
                                  <div className="border-r p-1">
                                    Purpose of Collection
                                  </div>
                                  <div className="border-r p-2">
                                    Collection Items
                                  </div>
                                  <div className="p-2">Expiration Date</div>
                                </div>
                                <div className="grid grid-cols-3 text-center text-xs">
                                  <div className="border-r p-1">
                                    Provision of QR Service
                                  </div>
                                  <div className="border-r">
                                    <div className="border-b p-1">
                                     Name
                                    </div>
                                    <div className="p-1">
                                      Phone Number
                                    </div>
                                  </div>
                                  <div className="p-1">One day</div>
                                </div>
                              </div>

                              <div className="mt-2 text-center md:text-[12px] text-[10px] bg-yellow-100 py-2 px-2 w-3/4 mx-auto rounded mb-2">
                                You have the right to disagree with the
                                collection and use of personal information.
                                However, if you disagree, daily pass
                                applications may be restricted.
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* ✅ End of consent section */}

                      <Button
                        type="submit"
                        disabled={!consentAllowed || isSubmittingDetails}
                        className={cn(
                          "w-full h-12 text-base font-semibold transition-colors duration-300",
                          consentAllowed && !isSubmittingDetails
                            ? "bg-primary text-secondary hover:bg-primary/80 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        {isSubmittingDetails ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Details"
                        )}
                      </Button>
                      <Button
                        className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                        onClick={handleBackToLogin}
                      >
                        Back to Student Login
                      </Button>
                    </div>
                  }
                />
              </CardContent>
            )}
            {/* // OTP Card section */}
            {currentStep === ExternalUserStep.ENTER_OTP && (
              <CardContent className="space-y-6">
                <p className="text-md">
                  (OTP information will be sent to the phone number text message
                  you entered.)
                </p>
                <MyForm
                  formSchema={otpInfo}
                  defaultValues={{
                    otp: "",
                  }}
                  onSubmit={handleOtpSubmit}
                  formItemData={formItemOtpData}
                  buttonActions={
                    <div className="space-y-2">
                      <OtpExpire expireAt={otpExpireAt} t={t} />

                      <Button
                        type="submit"
                        disabled={isSubmittingOTP}
                        className="w-full h-12 text-base font-semibold text-secondary bg-primary hover:bg-primary/80 cursor-pointer"
                      >
                        {isSubmittingOTP ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Submit OTP"
                        )}
                      </Button>
                      <Button
                        type="button"
                        className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                        onClick={handleBackToLogin}
                      >
                        Back to Student Login
                      </Button>
                    </div>
                  }
                />
              </CardContent>
            )}

            {/* QR Code section */}
            {currentStep === ExternalUserStep.SHOW_QR && (
              <CardContent>
                {/* Title */}
                <div className="flex flex-col items-center justify-center text-center ">
                  {/* QR Circle */}
                  <div className="relative ">
                    <QRViewComponent
                      qrData={encQrData || "No QR Generated"}
                      generatedAt={qrGeneratedAt}
                      expireAt={qrExpireAt}
                      onRefresh={handleGenerateNewQR}
                      qrTimeRange={qrTimeRange}
                      handleLogout={handleLogout}
                      page="EXTERNAL_USER"
                      t={t}
                    />
                  </div>
                </div>
                <div className="grid grid-row-1 sm:grid-row-2 gap-2 mt-8">
                  <Button
                    type="button"
                    disabled={isGeneratingQR}
                    className="w-full h-12 text-base font-semibold text-secondary bg-primary hover:bg-primary/80 cursor-pointer"
                    onClick={handleGenerateNewQR}
                  >
                    {isGeneratingQR ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate New QR Code"
                    )}
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Back to Student Login
                  </Button>
                </div>
              </CardContent>
            )}
            <div></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
