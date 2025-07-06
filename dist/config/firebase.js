"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = require("@/utils/logger");
class FirebaseService {
    constructor() {
        this.initialized = false;
    }
    static getInstance() {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }
    initialize() {
        if (this.initialized) {
            logger_1.logger.info('Firebase already initialized');
            return;
        }
        try {
            const serviceAccount = {
                type: process.env.FIREBASE_TYPE,
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI,
                token_uri: process.env.FIREBASE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
            };
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
            this.initialized = true;
            logger_1.logger.info('✅ Firebase initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Firebase initialization failed:', error);
            throw error;
        }
    }
    getStorage() {
        if (!this.initialized) {
            throw new Error('Firebase not initialized');
        }
        return firebase_admin_1.default.storage();
    }
    getAuth() {
        if (!this.initialized) {
            throw new Error('Firebase not initialized');
        }
        return firebase_admin_1.default.auth();
    }
    getFirestore() {
        if (!this.initialized) {
            throw new Error('Firebase not initialized');
        }
        return firebase_admin_1.default.firestore();
    }
}
exports.firebaseService = FirebaseService.getInstance();
//# sourceMappingURL=firebase.js.map