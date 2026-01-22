import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // 1. Extract Text Fields
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const dob = formData.get('dob');
    const address = formData.get('address');
    const ssn = formData.get('ssn');
    const nationality = formData.get('nationality');
    const idType = formData.get('idType');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 2. Prepare Upload Directory
    // Files will be saved to: /public/uploads/kyc
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc');
    
    // Create folder if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore error if folder exists
    }

    // 3. Helper Function to Save File
    const saveFile = async (file, prefix) => {
      if (!file) return null;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a unique filename (e.g., id-front-12345.jpg)
      const filename = `${prefix}-${Date.now()}-${file.name.replaceAll(" ", "_")}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      
      // Return the public URL (this is what goes in the DB)
      return `/uploads/kyc/${filename}`;
    };

    // 4. Save Images to Disk
    const idFrontPath = await saveFile(formData.get('idFront'), 'front');
    const idBackPath = await saveFile(formData.get('idBack'), 'back');
    const selfiePath = await saveFile(formData.get('selfie'), 'selfie');

    console.log("--- KYC FILES SAVED ---");
    console.log("Front:", idFrontPath);
    console.log("Back:", idBackPath);

    // 5. Update Database with Links Only
    await prisma.user.update({
      where: { email: email },
      data: {
        firstName,
        lastName,
        dateOfBirth: dob,
        streetAddress: address,
        idNumber: ssn,
        idType: idType,
        country: nationality,
        
        // Save the PATHS, not the image data
        kycFront: idFrontPath,
        kycBack: idBackPath,
        kycSelfie: selfiePath,
        
        kycStatus: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, message: 'KYC Submitted' });

  } catch (error) {
    console.error("KYC Server Error:", error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}