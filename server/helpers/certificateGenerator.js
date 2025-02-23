const {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  DocumentMergeParams,
  OutputFormat,
  DocumentMergeJob,
  DocumentMergeResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError
} = require("@adobe/pdfservices-node-sdk");

const fs = require("fs");
const path = require("path");

// Correct file path resolution
const filePath = path.resolve(__dirname, "../public/certificate.docx");

const generateCertificate = async (data) => {

  console.log(data);
  

  let readStream;
  try {
    // Check if the file exists before proceeding
    if (!fs.existsSync(filePath)) {
      throw new Error(`Certificate file not found at: ${filePath}`);
    }

    // Create credentials instance
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET
    });

    // Initialize Adobe PDF Services
    const pdfServices = new PDFServices({ credentials });

    // Read the DOCX file as a stream
    readStream = fs.createReadStream(filePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.DOCX
    });

    // Prepare JSON data for document merge
    const jsonDataForMerge = { name : data.name, course : data.course, date : data.date };

    console.log(jsonDataForMerge);
    
    const params = new DocumentMergeParams({
      jsonDataForMerge,
      outputFormat: OutputFormat.PDF
    });

    // Create and submit the merge job
    const job = new DocumentMergeJob({ inputAsset, params });
    const pollingURL = await pdfServices.submit({ job });

    // Get job result
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: DocumentMergeResult
    });

    // Get content from the resulting asset
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // const outputFilePath = "./generatePDFOutput.pdf";
    // console.log(`Saving asset at ${outputFilePath}`);

    // const writeStream = fs.createWriteStream(outputFilePath);
    // streamAsset.readStream.pipe(writeStream);

    // Convert the resulting PDF stream into a buffer
    const chunks = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);
    return pdfBuffer;
  } catch (err) {
    console.error("Error generating certificate:", err);
    throw err;
  } finally {
    readStream?.destroy(); // Ensure the stream is closed properly
  }
};

module.exports = { generateCertificate };
