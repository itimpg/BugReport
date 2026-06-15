using BugReport.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BugReport.API.Controllers;

[ApiController]
[Route("images")]
[Authorize]
public class ImagesController(IStorageService storageService, ILogger<ImagesController> logger) : ControllerBase
{
    /// <summary>
    /// Authenticated proxy that downloads the encrypted file from Supabase Storage,
    /// decrypts it in memory, and streams the original image bytes to the caller.
    /// Direct Supabase URLs are never exposed to clients.
    /// </summary>
    [HttpGet("{fileKey}")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client)]
    public async Task<IActionResult> GetImage(string fileKey, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(fileKey) || fileKey.Contains('/') || fileKey.Contains('\\'))
            return BadRequest();

        try
        {
            var (stream, contentType) = await storageService.DownloadDecryptedAsync(fileKey, ct);
            return File(stream, contentType, enableRangeProcessing: true);
        }
        catch (KeyNotFoundException)
        {
            logger.LogWarning("Image not found: {FileKey}", fileKey);
            return NotFound();
        }
    }
}
