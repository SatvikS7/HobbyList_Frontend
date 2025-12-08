package HobbyList.example.HobbyList.service;

import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

import org.springframework.stereotype.Service;

@Service
public class S3Service {
    private final S3Presigner presigner;

    public S3Service(S3Presigner presigner) {
        this.presigner = presigner;
    }

    public String generateUploadUrl(String bucketName, String key, String contentType) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5)) // expires in 10 min
                .putObjectRequest(objectRequest)
                .build();

        return presigner.presignPutObject(presignRequest).url().toString();
    }

    public String generateDownloadUrl(String bucketName, String imageURL) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(imageURL)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5)) // expires in 10 min
                .getObjectRequest(objectRequest)
                .build();

        return presigner.presignGetObject(presignRequest).url().toString();
    }
}
