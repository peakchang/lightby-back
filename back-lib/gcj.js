import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: 'path/to/your-service-account-key.json', // 경로 수정
});

const bucket = storage.bucket('your-bucket-name'); // 버킷 이름 수정

export default bucket;