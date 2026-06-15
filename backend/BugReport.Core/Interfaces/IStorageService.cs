namespace BugReport.Core.Interfaces;

public interface IStorageService
{
    /// <summary>Encrypts and uploads the file. Returns the unique fileKey stored in the bucket.</summary>
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);

    /// <summary>Downloads the encrypted file from storage and returns the decrypted stream with its content-type.</summary>
    Task<(Stream Data, string ContentType)> DownloadDecryptedAsync(string fileKey, CancellationToken ct = default);

    /// <summary>Deletes the file identified by its fileKey.</summary>
    Task DeleteAsync(string fileKey, CancellationToken ct = default);
}
