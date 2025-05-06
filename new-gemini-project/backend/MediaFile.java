package com.example.mediamanager.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Represents a media file found during the scan.
 * Suitable for JSON serialization for the API.
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = {"path"}) // Equality based on the full path
public class MediaFile {

    private String name;
    private String path; // Full absolute path
    private String parentPath;
    private long size;
    private String sizeReadable;
    private String fileType;
    private String extension;
    private LocalDateTime lastModified;
    private String id; // Base64 encoded path for safe use in API requests/URLs

    // Constructor
    public MediaFile(Path filePath, long fileSize, LocalDateTime lastModifiedTime) {
        this.path = filePath.toAbsolutePath().toString();
        this.name = filePath.getFileName().toString();
        this.parentPath = filePath.getParent() != null ? filePath.getParent().toString() : "";
        this.size = fileSize;
        this.sizeReadable = formatSize(fileSize);
        this.lastModified = lastModifiedTime;
        this.extension = getFileExtension(this.name);
        this.fileType = determineFileType(this.extension);
        // Encode the path to create a safe ID for web forms/API calls
        this.id = Base64.getUrlEncoder().withoutPadding().encodeToString(this.path.getBytes()); // Use URL safe encoder
    }

    // --- Helper Methods ---

    private static String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot + 1).toLowerCase();
        }
        return "";
    }

    private static String determineFileType(String extension) {
        return switch (extension) {
            case "jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg", "heic", "avif" -> "Image";
            case "mp4", "avi", "mov", "wmv", "mkv", "flv", "webm", "mpeg", "mpg", "3gp" -> "Video";
            default -> "Other";
        };
    }

    private static String formatSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        digitGroups = Math.min(digitGroups, units.length - 1);
        return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
    }

    // Static method to decode the Base64 ID back to a path string
    public static String decodeId(String id) {
         try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(id);
            return new String(decodedBytes);
        } catch (IllegalArgumentException e) {
            System.err.println("Error decoding Base64 ID: " + id + " - " + e.getMessage());
            return null;
        }
    }

    // Key for duplicate detection (Size + Name)
    public String getDuplicateKey() {
        // Use lowercase name for case-insensitive matching
        return this.size + "::" + this.name.toLowerCase();
    }
}

