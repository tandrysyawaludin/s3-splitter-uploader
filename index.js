import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3";
import './App.css';

function App() {

  const uploadFile = async (e) => {
    const str2blob = txt => new Blob([txt]);
    const file = e.target.files[0]
    const chunkSize = 1024 * 1024 * 100;
    const chunks = Math.ceil(file.size / chunkSize, chunkSize);
    let chunk = 0;
    let data = [];
    while (chunk <= chunks) {
      const offset = chunk * chunkSize;
      const res = await file.slice(offset, offset + chunkSize).text();
      data = [...data, ...res.split("\n")];
      chunk++;
    }
    const maxRow = 50000;
    const name = "test_file"
    let startRow = 1;
    let index = 1;
    let resultStr = "";
    while (data.length > 0) {
      resultStr = data.splice(0, maxRow).join('\r\n');
      sendFile(`${name}_${index}_${startRow}-${maxRow * index}`, str2blob(resultStr));
      console.log(`${name}_${index}_${startRow}-${maxRow * index}`);
      startRow = (maxRow * index) + 1;
      index++;
    }
  }

  const sendFile = async (fileName, file) => {
    try {
      const parallelUploads3 = new Upload({
        client: new S3Client({
          region: "ap-southeast-1",
          credentials: {
            accessKeyId: 'AKIAX7VLOXVKHMVDO2OO',
            secretAccessKey: '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'
          } }),
        params: { Bucket: "bigdml-testing", Key: fileName, Body: file },
        queueSize: 4, // optional concurrency configuration
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        leavePartsOnError: false, // optional manually handle dropped parts
      });

      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });

      await parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="App">
      <input type="file" onChange={uploadFile} />
    </div>
  );
}

export default App;
