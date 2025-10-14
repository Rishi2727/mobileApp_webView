// Firebase configuration for web
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
// You should replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;
let isMessagingSupported = false;

// Check if messaging is supported
export const initializeMessaging = async () => {
  try {
    isMessagingSupported = await isSupported();
    if (isMessagingSupported) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.warn('Firebase messaging is not supported in this environment:', error);
  }
};

export const getFirebaseMessaging = () => messaging;

export const requestPermission = async () => {
  if (!isMessagingSupported || !messaging) {
    console.warn('Firebase messaging is not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    } else {
      console.log('Unable to get permission to notify.');
      return false;
    }
  } catch (error) {
    console.error('An error occurred while requesting permission: ', error);
    return false;
  }
};

export const getFCMToken = async () => {
  if (!isMessagingSupported || !messaging) {
    console.warn('Firebase messaging is not supported');
    return null;
  }

  try {
    // Add the public VAPID key (you'll need to get this from Firebase Console)
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    const currentToken = await getToken(messaging, { 
      vapidKey: vapidKey 
    });
    
    if (currentToken) {
      console.log('Registration token available: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () => {
  if (!isMessagingSupported || !messaging) {
    return Promise.reject(new Error('Firebase messaging is not supported'));
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });
};

// Initialize messaging when the module loads
initializeMessaging();