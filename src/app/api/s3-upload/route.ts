import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

// Initialize AWS with better credential handling for server environment
const initializeAWS = (): boolean => {
  try {
    const region = process.env.AWS_REGION || "ap-south-1";
    const credentials = new AWS.Credentials({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    });
      
    AWS.config.update({
      region,
      credentials
    });

    // Validate credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials not found in environment variables");
      return false;
    }

    // Validate bucket name
    if (!process.env.AWS_BUCKET_NAME) {
      console.error("AWS_BUCKET_NAME not found in environment variables");
      return false;
    }
      
    return true;
  } catch (error) {
    console.error("Error initializing AWS:", error);
    return false;
  }
};

export async function POST(req: NextRequest) {
  // Initialize AWS
  if (!initializeAWS()) {
    return NextResponse.json(
      { success: false, error: "AWS configuration failed. Check environment variables." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    const fileObj = file as File;
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileObj.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }
    
    // Validate file type if specified
    const allowedTypes = formData.get("allowedTypes")?.toString().split(",") || [];
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileObj.type)) {
      return NextResponse.json(
        { success: false, error: "File type not allowed" },
        { status: 400 }
      );
    }

    const s3 = new AWS.S3();
    
    // Create unique file name
    const fileName = `${Date.now()}-${fileObj.name}`;
    
    // Convert Blob to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set up upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: fileName,
      Body: buffer,
      ContentType: fileObj.type || "application/octet-stream",
      ACL: "public-read",
    };

    // Upload file
    const data = await s3.upload(params).promise();

    return NextResponse.json({
      success: true,
      url: data.Location,
      key: fileName,
      contentType: fileObj.type,
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during upload",
      },
      { status: 500 }
    );
  }
}
