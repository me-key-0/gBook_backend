import admin from 'firebase-admin';
declare class FirebaseService {
    private static instance;
    private initialized;
    private constructor();
    static getInstance(): FirebaseService;
    initialize(): void;
    getStorage(): import("firebase-admin/lib/storage/storage").Storage;
    getAuth(): import("firebase-admin/lib/auth/auth").Auth;
    getFirestore(): admin.firestore.Firestore;
}
export declare const firebaseService: FirebaseService;
export {};
//# sourceMappingURL=firebase.d.ts.map