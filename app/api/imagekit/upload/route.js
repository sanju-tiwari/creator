"use server";

import { auth } from "@clerk/nextjs/server";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";


const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request){
try {
    const {userId} = await auth()
    if(!userId) return new Response("Unauthorized", {status: 401})
   
    const formdata = await request.formData();
    const file = formdata.get("file");
    const fileName = formdata.get("fileName");
    if(!file) return new Response("No file provided", {status:400})
   
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);   
    const timestamp = Date.now();
    const sanitizedFileName = fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload";
    const uniqueFileName = `${userId}/${timestamp}_${sanitizedFileName}`;
   
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder: "/blog_images",
    });
      return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      width: uploadResponse.width,
      height: uploadResponse.height,
      size: uploadResponse.size,
      name: uploadResponse.name,
    });

    } catch (error) {
    console.error("ImageKit upload error:", error);
     return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        details: error.message,
      },
      { status: 500 }
    );        
    }
}