type UploadProgressCallback = (progress: number) => void

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

export async function uploadToS3(file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> {
    try {
        // Create form data for API request
        const formData = new FormData();
        formData.append("file", file);
        
        // Track upload progress
        let progressInterval: NodeJS.Timeout | null = null;
        if (onProgress) {
            let progress = 0;
            // Simulate progress since fetch doesn't have progress events
            progressInterval = setInterval(() => {
                // Simulate upload progress increments (max 90% until complete)
                if (progress < 90) {
                    progress += Math.random() * 10;
                    onProgress(Math.min(90, Math.floor(progress)));
                }
            }, 500);
        }
        
        // Send to server-side API route
        const response = await fetch("/api/s3-upload", {
            method: "POST",
            body: formData,
        });
        
        // Clear progress interval
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        
        // Set to 100% when complete
        if (onProgress) {
            onProgress(100);
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
        }
        
        const data = await response.json();
        
        return {
            success: true,
            url: data.url,
        };
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred during upload",
        }
    }
}

