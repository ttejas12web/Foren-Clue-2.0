import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

class LocalFileStore {
  private dbName = "ForenClueOfflineFiles";
  private storeName = "files";
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async saveFile(key: string, file: Blob): Promise<string> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put(file, key);
        request.onsuccess = () => {
          resolve(`localdb://${key}`);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to save to local IndexedDB:", err);
      // Absolute fallback to direct base64 if IndexedDB fails entirely
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  async getFile(key: string): Promise<Blob | null> {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const cleanedKey = key.replace("localdb://", "");
        const request = store.get(cleanedKey);
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          console.error("IndexedDB getFile error:", request.error);
          resolve(null);
        };
      });
    } catch (err) {
      console.error("IndexedDB not accessible in getFile:", err);
      return null;
    }
  }
}

export const localFileStore = new LocalFileStore();

// Dynamic timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = "Operation timed out"): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

async function uploadToServerDisk(file: File, cloudPath: string, onStatusChange?: (msg: string) => void): Promise<string> {
  if (onStatusChange) onStatusChange('Routing upload safely to High-Performance Server storage...');
  const base64Data = await convertToBase64(file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      base64Data: base64Data,
      cloudPath: cloudPath
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server side upload pipeline rejected: ${text || response.statusText}`);
  }

  const data = await response.json();
  if (data && data.url) {
    return data.url;
  }
  throw new Error('Malformed server file-upload response');
}

/**
 * Resilient upload utility that tries Cloud Storage with progress updates and a timeout,
 * falls back to our Express server uploads disk, and ultimately falls back to IndexedDB.
 */
export async function uploadFileResilient(
  file: File | Blob, 
  cloudPath: string, 
  onStatusChange?: (msg: string) => void
): Promise<{ url: string; isFallback: boolean }> {
  
  // Convert Blob into a File if it's not already, ensuring it has a 'name' field
  let fileToUpload: File;
  if (file instanceof File) {
    fileToUpload = file;
  } else {
    const extension = file.type.split('/')[1] || 'bin';
    fileToUpload = new File([file], `evidence_${Date.now()}.${extension}`, { type: file.type });
  }

  if (storage) {
    try {
      if (onStatusChange) onStatusChange('Connecting to Firebase Cloud Storage...');
      const fileRef = ref(storage, cloudPath);
      
      const uploadPromise = new Promise<{ url: string; isFallback: boolean }>((resolve, reject) => {
        if (onStatusChange) onStatusChange('Starting Cloud Storage upload...');
        
        const metadata = {
          contentType: fileToUpload.type || 'application/octet-stream',
        };
        
        const uploadTask = uploadBytesResumable(fileRef, fileToUpload, metadata);
        
        let completed = false;

        const unsubscribe = uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const progressFormatted = isNaN(progress) ? 0 : Math.round(progress);
            if (onStatusChange) {
              onStatusChange(`Cloud Storage: ${progressFormatted}% complete`);
            }
          }, 
          (err) => {
            if (!completed) {
              completed = true;
              unsubscribe();
              reject(err);
            }
          }, 
          async () => {
            try {
              if (!completed) {
                completed = true;
                unsubscribe();
                if (onStatusChange) onStatusChange('Retrieving secure download URL...');
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ url: downloadUrl, isFallback: false });
              }
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      // Attempt Firebase Storage upload with a generous 45-second timeout
      const result = await withTimeout(uploadPromise, 45000, "Firebase Storage took too long to complete.");
      return result;
    } catch (err: any) {
      console.warn("Cloud storage upload rejected or timed out. Handing off to Express server disk layer:", err);
    }
  } else {
    console.warn("Firebase Storage is not initialized in firebase.ts. Resorting to Express server disk layer.");
  }

  // Fallback 1: High-performance shared Server Disk storage
  try {
    const serverUrl = await uploadToServerDisk(fileToUpload, cloudPath, onStatusChange);
    return { url: serverUrl, isFallback: false };
  } catch (serverErr) {
    console.warn("Express server disk write failed or rejected. Resorting to fallback local IndexedDB database:", serverErr);
  }

  // Fallback 2: For images, convert to highly-compressed Base64 data-URL so other users can view it too!
  if (fileToUpload.type.startsWith('image/')) {
    if (onStatusChange) onStatusChange('Encoding image to resilient offline-safe Base64...');
    try {
      const { compressImage } = await import('./image-utils');
      // Compress to a friendly resolution and quality so it fits comfortably within Firestore boundaries
      const compressedBlob = await compressImage(fileToUpload, 800, 0.6);
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });
      return { url: base64Url, isFallback: true };
    } catch (compressErr) {
      console.warn("Compression failed during Base64 fallback, using raw file:", compressErr);
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileToUpload);
      });
      return { url: base64Url, isFallback: true };
    }
  }

  // Fallback 3: Local IndexedDB (for non-image files like large PDFs, which are too big for Base64 injection)
  if (onStatusChange) onStatusChange('Switching to local browser sandbox database (IndexedDB)...');
  
  // Create a clean key for IndexedDB
  const uniqueId = `${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const localUrl = await localFileStore.saveFile(uniqueId, fileToUpload);
  
  return { url: localUrl, isFallback: true };
}

/**
 * Resolves any localdb:// URL or Base64 string to a usable web URL for images.
 */
export async function resolveFileUrl(url: string | null | undefined): Promise<string> {
  if (!url) return '';
  if (url.startsWith('localdb://')) {
    const blob = await localFileStore.getFile(url);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    // Return a beautiful fallback if not present in DB
    return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300';
  }
  return url;
}

export function ResilientImage({ src, alt, className, ...props }: { src: string; alt: string; className?: string; [key: string]: any }) {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const resolve = async () => {
      if (!src) return;
      if (src.startsWith('localdb://')) {
        const url = await resolveFileUrl(src);
        if (active) {
          setResolvedSrc(url);
          objectUrl = url;
        }
      } else {
        if (active) {
          setResolvedSrc(src);
        }
      }
    };

    resolve();

    return () => {
      active = false;
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!resolvedSrc) {
    return <div className={className ? className + " animate-pulse bg-black/5 dark:bg-white/5" : "animate-pulse bg-black/5 dark:bg-white/5 rounded-lg w-full h-full"} />;
  }

  return (
    <img src={resolvedSrc} alt={alt} className={className} referrerPolicy="no-referrer" {...props} />
  );
}

