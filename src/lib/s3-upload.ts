import AWS from "aws-sdk"

// Initialize AWS with better credential handling for container environments
const initializeAWS = (): boolean => {
    try {
        const region = process.env.AWS_REGION || "ap-south-1"
        const credentials = new AWS.Credentials({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
        })
        
        AWS.config.update({
            region,
            credentials
        })

        // Validate credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error("AWS credentials not found in environment variables")
            return false
        }

        // Validate bucket name
        if (!process.env.AWS_BUCKET_NAME) {
            console.error("AWS_BUCKET_NAME not found in environment variables")
            return false
        }
        
        return true
    } catch (error) {
        console.error("Error initializing AWS:", error)
        return false
    }
}

type UploadProgressCallback = (progress: number) => void

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

export async function uploadToS3(file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> {
    // Initialize AWS and validate configuration
    if (!initializeAWS()) {
        return {
            success: false,
            error: "AWS configuration failed. Check environment variables."
        }
    }
    
    try {
        const s3 = new AWS.S3()

        // Create unique file name
        const fileName = `${Date.now()}-${file.name}`

        // Set up upload parameters
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Key: fileName,
            Body: file,
            ContentType: file.type,
            ACL: "public-read",
        }

        // Upload file with progress tracking
        const upload = s3.upload(params)

        if (onProgress) {
            upload.on("httpUploadProgress", (progress) => {
                const percentage = Math.round((progress.loaded / progress.total) * 100)
                onProgress(percentage)
            })
        }

        // Wait for upload to complete
        const data = await upload.promise()

        return {
            success: true,
            url: data.Location,
        }
    } catch (error) {
        console.error("Error uploading file to S3:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred during upload",
        }
    }
}

