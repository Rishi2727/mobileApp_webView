import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/AuthStore";
import { Spinner } from "@/components/ui/custom/spinner";
import { useNavigate } from "react-router";
import { metadata } from "@/config/metadata";
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";

const UniversityNotice = () => {
  const [loading, setLoading] = useState(true);
  const { kmouSecretGenerate, myProfile, getMyProfile } = useAuthStore();
  const [url, setUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const breadcrumbItems = metadata.notice.breadcrumbItems || [];

  useEffect(() => {
    // Ensure profile is loaded first
    const loadNotice = async () => {
      try {
        // If profile is not loaded, fetch it first
        if (!myProfile) {
          await getMyProfile();
        }

        const encryptedData = await kmouSecretGenerate();
        console.log(encryptedData)
        if (encryptedData) {
          const noticeUrl = `https://library.kmou.ac.kr/appLogin?encText=${encryptedData}&retUrl=/bbs/list/1`;
          setUrl(noticeUrl);
          if (import.meta.env.DEV) console.log("KMOU Secret URL:", noticeUrl);
        } else {
          console.error("Failed to generate KMOU secret");
          setLoading(false);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.warn("Error generating KMOU Secret:", error);
        setLoading(false);
      }
    };

    loadNotice();
  }, [kmouSecretGenerate, myProfile, getMyProfile]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Check if iframe can go back
      if (iframeRef.current) {
        try {
          // Try to access iframe history (may be blocked by same-origin policy)
          const iframeWindow = iframeRef.current.contentWindow;
          if (iframeWindow && iframeWindow.history.length > 1) {
            iframeWindow.history.back();
            e.preventDefault();
          }
        } catch (error) {
          // If we can't access iframe history due to cross-origin, just let normal navigation happen
          console.log("Cannot access iframe history due to cross-origin policy");
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div>
      <MyBreadcrumb
        items={breadcrumbItems}
        title="University Notices"
        showBackButton={true}
      />
      <div className="relative w-full h-[calc(100vh-64px)]">
        {url && (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            onLoad={() => {
              setLoading(false);
              // Inject CSS to hide unwanted elements after iframe loads
              try {
                const iframe = iframeRef.current;
                if (iframe && iframe.contentDocument) {
                  const style = iframe.contentDocument.createElement('style');
                  style.textContent = `
                  #divHeader, #divQuickMenu, #divSearch, #divTitle, #divLocation, #divFooter,
                  .division2, .division3 {
                    display: none !important;
                  }
                  img {
                    max-width: 100% !important;
                    height: auto !important;
                  }
                  .boardContent {
                    padding: 8px !important;
                    box-sizing: border-box !important;
                  }
                `;
                  iframe.contentDocument.head.appendChild(style);

                  // Override doPreserve function
                  if (iframe.contentWindow) {
                    (iframe.contentWindow as any).doPreserve = function () { };
                  }
                }
              } catch (error) {
                // Cross-origin restrictions may prevent this from working
                console.log("Cannot inject styles due to cross-origin policy");
              }
            }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            title="University Notice"
          />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Spinner size="lg" variant="secondary" />
            </div>
          </div>
        )}

        {!loading && !url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load university notice</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityNotice;
