import AWS from "aws-sdk"

// Configure AWS SDK
AWS.config.update({
    region: "ap-south-1",
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
})

type UploadProgressCallback = (progress: number) => void

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

/**
 * Uploads a file to AWS S3
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise with upload result
 */
export async function uploadToS3(file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> {
    try {
        const s3 = new AWS.S3()

        // Create unique file name
        const fileName = `${Date.now()}-${file.name}`

        // Set up upload parameters
        const params = {
            Bucket: "uploadthingalternative",
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

