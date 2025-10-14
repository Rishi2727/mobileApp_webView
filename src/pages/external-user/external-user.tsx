import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MyForm, { type FormFieldItem } from "@/components/ui/custom/my-form/MyForm"
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import type { OneDayPass, OtpInfo } from "@/types/models";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, Phone, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import z from "zod";
import { motion, AnimatePresence } from "framer-motion";



const oneDayPassSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  phoneno: z.string().min(5, {
    message: "Number must be at least 6 values.",
  })
})

const otpInfo = z.object({
  otp: z.string().min(6, {
    message: "The OTP should be of 6-digits"
  })
})



export default function ExternalUser() {


  const navigate = useNavigate()
  const [consentAllowed, setConsentAllowed] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showOtpCard, setShowOtpCard] = useState(false);


  //Submit functions
  const handleSubmit = (values: OneDayPass) => {
    console.log("Form submitted:", values);
    setShowOtpCard(true);
    // Do something with form values, e.g., send API request
  };

  const handleOtpSubmit = (values: OtpInfo) => {
    console.log("Form submitted:", values);
    // Do something with form values, e.g., send API request
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
            type="number"
            maxLength={6}
            className="pl-10 h-12  text-center text-lg"
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
            placeholder="Enter your username"
            className="pl-10 h-12"
            {...field}
          />
        </div>
      )
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
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
          />
        </div>
      ),
    }



  ]
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="border-0 shadow-md">
            <CardHeader className="space-y-6">
              {/* Welcome Text */}
              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">
                  One Day Pass Request
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Enter your details to get started
                </CardDescription>



              </div>
            </CardHeader>
            {!showOtpCard ? (

              <CardContent className="space-y-6">
                <MyForm
                  formSchema={oneDayPassSchema}
                  defaultValues={{
                    username: "",
                    phoneno: "" as unknown as number,
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
                              <p className="text-[11px] text-center mt-2">
                                We collect and use personal information as follows for
                                the operation of QR services entering the library of
                                the Korea Maritime University.
                              </p>

                              <div className="border rounded-lg mt-4">
                                <div className="grid grid-cols-3 text-center border-b text-xs font-medium bg-muted">
                                  <div className="border-r p-2">
                                    Purpose of Collection
                                  </div>
                                  <div className="border-r p-2">
                                    Collection Items
                                  </div>
                                  <div className="p-2">Expiration Date</div>
                                </div>
                                <div className="grid grid-cols-3 text-center text-xs">
                                  <div className="border-r p-2">
                                    Provision of QR Service
                                  </div>
                                  <div className="border-r">
                                    <div className="border-b p-2">
                                      Requester Name
                                    </div>
                                    <div className="p-2">
                                      Requester Phone Number
                                    </div>
                                  </div>
                                  <div className="p-2">Validity Period</div>
                                </div>
                              </div>

                              <div className="mt-2 text-center md:text-[12px] text-[10px] bg-yellow-100 py-2 px-2 w-3/4 mx-auto rounded mb-2">
                                You have the right to disagree with the collection and
                                use of personal information. However, if you disagree,
                                daily pass applications may be restricted.
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* ✅ End of consent section */}

                      <Button
                        type="submit"
                        disabled={!consentAllowed}
                        className={cn(
                          "w-full h-12 text-base font-semibold transition-colors duration-300",
                          consentAllowed
                            ? "bg-primary text-secondary hover:bg-primary/80 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        Submit Details
                      </Button>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                        onClick={() => setShowOtpCard(false)}
                      >
                        Back to Student Login
                      </Button>
                    </div>
                  }
                />
              </CardContent>
            ) :

              // OTP Card section
              (
                <CardContent className="space-y-6">
                  <MyForm
                    formSchema={otpInfo}
                    defaultValues={{
                      otp: "" as unknown as number
                    }}
                    onSubmit={handleOtpSubmit}
                    formItemData={formItemOtpData}
                    buttonActions={
                      <div className="grid grid-row-1 sm:grid-row-2 gap-2">

                        <Button type="submit" className="w-full h-12 text-base font-semibold text-secondary bg-primary hover:bg-primary/80 cursor-pointer" > Submit OTP </Button>
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-secondary text-primary hover:bg-primary/10 cursor-pointer"
                          onClick={() => navigate(-1)}
                        >
                          Back to Student Login
                        </Button>
                      </div>
                    }
                  />
                </CardContent>
              )}

          </Card>
        </div>
      </div>
    </div>
  );
}
