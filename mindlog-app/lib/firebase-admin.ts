import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let app: App;

async function getServiceAccountKey(): Promise<Record<string, unknown>> {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCP_PROJECT_ID || 'iness-467105';
  const secretName = process.env.FIREBASE_ADMIN_SECRET_NAME || 'firebase-admin-key';
  
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });
    
    const payload = version.payload?.data?.toString();
    if (!payload) {
      throw new Error('Secret payload is empty');
    }
    
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to retrieve service account key from Secret Manager:', error);
    throw error;
  }
}

export async function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      const serviceAccount = await getServiceAccountKey();
      
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  } else {
    app = getApps()[0];
  }
  
  return app;
}

export async function getAdminAuth() {
  await initializeFirebaseAdmin();
  return getAuth(app);
}

export async function getAdminFirestore() {
  await initializeFirebaseAdmin();
  return getFirestore(app);
}

export async function getAdminStorage() {
  await initializeFirebaseAdmin();
  return getStorage(app);
}

// Helper function to get secrets from Secret Manager
export async function getSecret(secretName: string): Promise<string> {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCP_PROJECT_ID || 'iness-467105';
  
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });
    
    const payload = version.payload?.data?.toString();
    if (!payload) {
      throw new Error(`Secret ${secretName} payload is empty`);
    }
    
    return payload;
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error);
    throw error;
  }
}