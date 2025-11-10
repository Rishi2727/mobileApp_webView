import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/AuthStore';
import { useTranslation } from 'react-i18next';
import { QRViewComponent } from '@/components/layout/QRViewComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Text from '@/components/ui/custom/text';

declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }
}

export const QRShakeModal: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isModalOpenRef = useRef(false);
    const { myQrCode, getQrCode, isLoggedIn } = useAuthStore();
    const { t } = useTranslation();

    // Close modal with proper cleanup
    const closeModal = useCallback(() => { setIsModalOpen(false); }, []);

    // Keep ref in sync with state
    useEffect(() => {
        isModalOpenRef.current = isModalOpen;
    }, [isModalOpen]);

    // Shake detection handler
    const handleShakeDetected = useCallback(async () => {
        try {
            const isLogged = await isLoggedIn(); // Ensure user is logged in before proceeding
            if (!isLogged) { return; }

            window.ReactNativeWebView?.postMessage(JSON.stringify({ cmd: "haptic", message: "Trigger Haptic Feedback" }));

            if (isModalOpenRef.current === true) {
                closeModal();
            } else {
                const qrCode = await getQrCode();
                if (qrCode?.QrData) {
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            console.warn('Error handling shake:', error);
        }
    }, [closeModal, getQrCode, isLoggedIn]);

    const handleMessage = useCallback((event: MessageEvent) => {
        // Handle the message event here
        try {

            const datamsg = JSON.parse(event?.data || '{}');
            if (datamsg?.cmd === "shake") {
                handleShakeDetected();
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // console.warn('Error parsing message event data:', error);
        }
    }, [handleShakeDetected]);

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [handleMessage]);


    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary text-center">
                        {t('profile.mobileCard')}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center py-5">
                    <Text className="text-sm text-muted-foreground mb-5 text-center px-5">
                        {t('profile.scanQRInstructions')}
                    </Text>

                    {/* Circular Progress with QR */}
                    <QRViewComponent
                        qrData={myQrCode?.QrData || 'I like curious people'}
                        generatedAt={myQrCode?.GeneratedAt}
                        expireAt={myQrCode?.ExpireAt}
                        qrTimeRange={null}
                        onRefresh={closeModal}
                        t={t}
                        handleLogout={null}
                        page="PROFILE"
                        textColor='#A1D5DB'
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
