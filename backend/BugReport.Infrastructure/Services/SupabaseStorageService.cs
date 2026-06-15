using System.Security.Cryptography;
using System.Text;
using BugReport.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Supabase;

namespace BugReport.Infrastructure.Services;

/// <summary>
/// Stores images encrypted with AES-256-GCM so raw bytes in the bucket are not
/// human-viewable.  Plaintext format before encryption:
///   [4 bytes: UTF-8 content-type length (big-endian)] [N bytes: content-type] [image bytes]
/// Encrypted blob format written to Supabase:
///   [12 bytes: nonce] [ciphertext] [16 bytes: GCM authentication tag]
/// </summary>
public class SupabaseStorageService : IStorageService
{
    private const int NonceSize = 12;
    private const int TagSize   = 16;

    private readonly Client  _supabase;
    private readonly string  _bucket;
    private readonly byte[]  _key;
    private readonly ILogger<SupabaseStorageService> _logger;

    public SupabaseStorageService(
        Client supabaseClient,
        IConfiguration config,
        ILogger<SupabaseStorageService> logger)
    {
        _supabase = supabaseClient;
        _bucket   = config["Supabase:StorageBucket"] ?? "bug-images";
        _logger   = logger;

        var keyBase64 = config["Encryption:Key"]
            ?? throw new InvalidOperationException("Encryption:Key is not configured.");

        _key = Convert.FromBase64String(keyBase64);
        if (_key.Length != 32)
            throw new InvalidOperationException("Encryption:Key must be exactly 32 bytes (256-bit) when base-64 decoded.");
    }

    // ── Upload ────────────────────────────────────────────────────────────────

    public async Task<string> UploadAsync(
        Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms, ct);
        var imageBytes = ms.ToArray();

        var plaintext = BuildPlaintext(contentType, imageBytes);
        var encrypted = Encrypt(plaintext);

        var uniqueKey = $"{Guid.NewGuid()}_{SanitizeFileName(fileName)}";

        var result = await _supabase.Storage
            .From(_bucket)
            .Upload(encrypted, uniqueKey, new Supabase.Storage.FileOptions
            {
                ContentType = "application/octet-stream",
                Upsert      = false
            });

        if (result is null)
        {
            _logger.LogError("Supabase storage upload returned null for file {Key}", uniqueKey);
            throw new InvalidOperationException("Failed to upload encrypted file to storage.");
        }

        _logger.LogInformation("Uploaded encrypted file {Key} ({Bytes} bytes)", uniqueKey, encrypted.Length);
        return uniqueKey;
    }

    // ── Download & Decrypt ────────────────────────────────────────────────────

    public async Task<(Stream Data, string ContentType)> DownloadDecryptedAsync(
        string fileKey, CancellationToken ct = default)
    {
        byte[] encrypted;
        try
        {
            encrypted = await _supabase.Storage.From(_bucket).Download(fileKey, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download file {Key} from Supabase storage", fileKey);
            throw new KeyNotFoundException($"File '{fileKey}' not found in storage.");
        }

        var plaintext = Decrypt(encrypted);
        var (contentType, imageBytes) = ParsePlaintext(plaintext);

        return (new MemoryStream(imageBytes), contentType);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public async Task DeleteAsync(string fileKey, CancellationToken ct = default)
    {
        await _supabase.Storage.From(_bucket).Remove([fileKey]);
        _logger.LogInformation("Deleted file {Key}", fileKey);
    }

    // ── AES-256-GCM helpers ───────────────────────────────────────────────────

    private byte[] Encrypt(byte[] plaintext)
    {
        var nonce      = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        var ciphertext = new byte[plaintext.Length];
        var tag        = new byte[TagSize];

        using var aes = new AesGcm(_key, TagSize);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        // Layout: [nonce][ciphertext][tag]
        var blob = new byte[NonceSize + ciphertext.Length + TagSize];
        Buffer.BlockCopy(nonce,       0, blob, 0,                               NonceSize);
        Buffer.BlockCopy(ciphertext,  0, blob, NonceSize,                       ciphertext.Length);
        Buffer.BlockCopy(tag,         0, blob, NonceSize + ciphertext.Length,   TagSize);
        return blob;
    }

    private byte[] Decrypt(byte[] blob)
    {
        if (blob.Length < NonceSize + TagSize)
            throw new CryptographicException("Encrypted blob is too short to be valid.");

        var nonce      = blob[..NonceSize];
        var tag        = blob[^TagSize..];
        var ciphertext = blob[NonceSize..^TagSize];
        var plaintext  = new byte[ciphertext.Length];

        using var aes = new AesGcm(_key, TagSize);
        aes.Decrypt(nonce, ciphertext, tag, plaintext);
        return plaintext;
    }

    // ── Plaintext format helpers ──────────────────────────────────────────────

    private static byte[] BuildPlaintext(string contentType, byte[] imageBytes)
    {
        var ctBytes       = Encoding.UTF8.GetBytes(contentType);
        var ctLengthBytes = BitConverter.GetBytes(ctBytes.Length); // 4 bytes, platform-endian

        var plaintext = new byte[4 + ctBytes.Length + imageBytes.Length];
        Buffer.BlockCopy(ctLengthBytes, 0, plaintext, 0,                       4);
        Buffer.BlockCopy(ctBytes,       0, plaintext, 4,                       ctBytes.Length);
        Buffer.BlockCopy(imageBytes,    0, plaintext, 4 + ctBytes.Length,      imageBytes.Length);
        return plaintext;
    }

    private static (string ContentType, byte[] ImageBytes) ParsePlaintext(byte[] plaintext)
    {
        var ctLength    = BitConverter.ToInt32(plaintext, 0);
        var contentType = Encoding.UTF8.GetString(plaintext, 4, ctLength);
        var imageBytes  = plaintext[(4 + ctLength)..];
        return (contentType, imageBytes);
    }

    private static string SanitizeFileName(string fileName)
        => Path.GetFileName(fileName).Replace(" ", "_");
}
