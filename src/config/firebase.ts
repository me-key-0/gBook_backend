// config/firebase.ts
import admin from "firebase-admin";
import { logger } from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";

class FirebaseService {
  private static instance: FirebaseService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      logger.info("Firebase already initialized");
      return;
    }

    try {
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });

      this.initialized = true;
      logger.info("✅ Firebase initialized successfully");
    } catch (error) {
      logger.error("❌ Firebase initialization failed:", error);
      throw error;
    }
  }

  public getStorage() {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }
    return admin.storage();
  }

  public getBucket() {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }
    return admin.storage().bucket();
  }

  public getAuth() {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }
    return admin.auth();
  }

  public getFirestore() {
    if (!this.initialized) {
      throw new Error("Firebase not initialized");
    }
    return admin.firestore();
  }

  /**
   * Upload a file to Firebase Storage and return its public URL
   */
  public async uploadFileToStorage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const bucket = this.getBucket();
    const uniqueName = `userImages/${uuidv4()}_${fileName}`;
    const file = bucket.file(uniqueName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
    });

    await new Promise<void>((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
      stream.end(fileBuffer);
    });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return url;
  }
}

export const firebaseService = FirebaseService.getInstance();
