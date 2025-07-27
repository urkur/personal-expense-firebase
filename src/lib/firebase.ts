import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    "projectId": "raseed-lite-u6e5l",
    "appId": "1:576324904463:web:9e9fbf229043100bab257a",
    "storageBucket": "raseed-lite-u6e5l.firebasestorage.app",
    "apiKey": "AIzaSyDMIDy2sofinIo_lqa7ji2PLwT2-_xp2K4",
    "authDomain": "raseed-lite-u6e5l.firebaseapp.com",
    "messagingSenderId": "576324904463"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
