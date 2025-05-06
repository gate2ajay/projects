package com.example.mediamanager.service;

import com.example.mediamanager.model.MediaFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service class for handling file scanning, metadata extraction,
 * duplicate detection, and file operations (rename, delete).
 * Used by the FileApiController.
 */
@Service
public class FileScanService {

    private static final Logger log = LoggerFactory.getLogger(FileScanService.class);

    // Define supported media file extensions
    private static final List<String> IMAGE_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg", "heic", "avif"
    );
    private static final List<String> VIDEO_EXTENSIONS = List.of(
            "mp4", "avi", "mov", "wmv", "mkv", "flv", "webm", "mpeg", "mpg", "3gp"
    );

    /**
     * Scans the specified directory recursively for media files.
     *
     * @param directoryPath The path to the directory to scan.
     * @return A list of MediaFile objects found.
     * @throws IOException If an I/O error occurs during scanning.
     * @throws IllegalArgumentException If the path is invalid, not a directory, or not readable.
     */
    public List<MediaFile> scanDirectory(String directoryPath) throws IOException, IllegalArgumentException {
        if (!StringUtils.hasText(directoryPath)) {
            throw new IllegalArgumentException("Directory path cannot be empty.");
        }

        Path startPath = Paths.get(directoryPath);
        // Perform checks before starting the walk
        if (!Files.exists(startPath)) {
             throw new IllegalArgumentException("Invalid path: Does not exist. " + directoryPath);
        }
        if (!Files.isDirectory(startPath)) {
            throw new IllegalArgumentException("Invalid path: Not a directory. " + directoryPath);
        }
        if (!Files.isReadable(startPath)) {
             throw new IllegalArgumentException("Permission denied: Cannot read directory. " + directoryPath);
        }

        log.info("Starting scan of directory: {}", startPath.toAbsolutePath());
        List<MediaFile> mediaFiles = new ArrayList<>();

        // Use Files.walk with try-with-resources
        try (var stream = Files.walk(startPath)) {
             stream
                .filter(Files::isRegularFile)
                .filter(this::isMediaFile)
                .forEach(filePath -> {
                    try {
                        // Check readability of the individual file
                        if (!Files.isReadable(filePath)) {
                            log.warn("Skipping unreadable file: {}", filePath);
                            return; // Skip this file
                        }
                        BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);
                        LocalDateTime lastModified = LocalDateTime.ofInstant(
                                attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault()
                        );
                        MediaFile mediaFile = new MediaFile(
                                filePath,
                                attrs.size(),
                                lastModified
                        );
                        mediaFiles.add(mediaFile);
                        // Use debug level for individual file logs to avoid flooding
                        log.debug("Found media file: {}", filePath);
                    } catch (IOException e) {
                        log.error("Could not read attributes for file: {}", filePath, e);
                        // Skip file on attribute read error
                    } catch (SecurityException se) {
                         log.warn("Permission denied accessing file attributes: {}", filePath, se);
                         // Skip file due to permissions
                    }
                });
        } catch (IOException e) {
            log.error("Error walking the file tree for path: {}", startPath, e);
            throw e; // Propagate IOExceptions
        } catch (SecurityException se) {
             log.error("Security exception while starting scan on directory: {}", startPath, se);
             // Convert SecurityException to IOException for consistent controller handling
             throw new IOException("Permission denied while scanning directory: " + startPath, se);
        }

        log.info("Scan complete. Found {} media files in {}", mediaFiles.size(), startPath.toAbsolutePath());
        return mediaFiles;
    }

    /**
     * Checks if a file path corresponds to a supported media file based on its extension.
     */
    private boolean isMediaFile(Path path) {
        String fileName = path.getFileName().toString().toLowerCase();
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0 && lastDot < fileName.length() - 1) {
            String extension = fileName.substring(lastDot + 1);
            return IMAGE_EXTENSIONS.contains(extension) || VIDEO_EXTENSIONS.contains(extension);
        }
        return false;
    }

    /**
     * Identifies duplicate files based on size and filename (case-insensitive).
     * Returns a map where the key identifies the duplicate group and the value is the list of duplicates.
     */
    public Map<String, List<MediaFile>> findDuplicates(List<MediaFile> allFiles) {
        if (allFiles == null || allFiles.isEmpty()) {
            return new HashMap<>(); // Return empty map if no files
        }

        // Group files by their duplicate key (size::lowercase_name)
        Map<String, List<MediaFile>> groupedBySizeAndName = allFiles.stream()
                .collect(Collectors.groupingBy(MediaFile::getDuplicateKey));

        // Filter out groups that don't have duplicates (size <= 1)
        return groupedBySizeAndName.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    /**
     * Renames a file.
     *
     * @param currentPathStr The current absolute path of the file.
     * @param newName        The desired new filename (without path).
     * @return The updated MediaFile object representing the renamed file.
     * @throws IOException If renaming fails (e.g., file not found, permissions, invalid name).
     * @throws IllegalArgumentException If newName is invalid.
     */
    public MediaFile renameFile(String currentPathStr, String newName) throws IOException, IllegalArgumentException {
        if (!StringUtils.hasText(newName) || newName.contains("/") || newName.contains("\\")) {
             throw new IllegalArgumentException("Invalid new filename provided.");
        }

        Path currentPath = Paths.get(currentPathStr);
        if (!Files.exists(currentPath)) {
            throw new FileNotFoundException("File to rename not found: " + currentPathStr);
        }
        if (!Files.isWritable(currentPath.getParent())) {
             throw new IOException("Permission denied: Cannot write to directory " + currentPath.getParent());
        }


        Path parentDir = currentPath.getParent();
        Path newPath = parentDir.resolve(newName); // Create the new path

        // Basic check: Ensure the new name has an extension if the old one did
        String oldExtension = MediaFile.getFileExtension(currentPath.getFileName().toString());
        String newExtension = MediaFile.getFileExtension(newName);
        if (StringUtils.hasText(oldExtension) && !StringUtils.hasText(newExtension)) {
            log.warn("New filename '{}' is missing an extension. Original extension was '{}'. Proceeding anyway.", newName, oldExtension);
            // Consider adding the old extension automatically or throwing an error based on requirements
        }

        if (Files.exists(newPath)) {
             throw new FileAlreadyExistsException("Cannot rename: A file with the name '" + newName + "' already exists in the directory.");
        }


        try {
            log.info("Attempting to rename {} to {}", currentPath, newPath);
            Path resultPath = Files.move(currentPath, newPath, StandardCopyOption.ATOMIC_MOVE); // Use atomic move if possible
            log.info("Successfully renamed file to {}", resultPath);

            // Return new MediaFile object for the renamed file
            BasicFileAttributes attrs = Files.readAttributes(resultPath, BasicFileAttributes.class);
            LocalDateTime lastModified = LocalDateTime.ofInstant(
                    attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault()
            );
            return new MediaFile(resultPath, attrs.size(), lastModified);

        } catch (IOException e) {
            log.error("Failed to rename file {} to {}: {}", currentPath, newPath, e.getMessage(), e);
            throw new IOException("Failed to rename file: " + e.getMessage(), e);
        } catch (SecurityException se) {
             log.error("Security exception during rename from {} to {}: {}", currentPath, newPath, se.getMessage(), se);
             throw new IOException("Permission denied during rename operation.", se);
        }
    }

    /**
     * Deletes a file.
     *
     * @param filePathStr The absolute path of the file to delete.
     * @throws IOException If deletion fails (e.g., file not found, permissions).
     */
    public void deleteFile(String filePathStr) throws IOException {
        Path filePath = Paths.get(filePathStr);

        if (!Files.exists(filePath)) {
            // If the file is already gone, consider it a success from the user's perspective
            log.warn("Attempted to delete a non-existent file: {}", filePathStr);
            // throw new FileNotFoundException("File to delete not found: " + filePathStr);
             return; // Or return void/boolean indicating success/failure
        }

        // Check write permissions on the *parent directory* which is required for deletion on most OS
         if (!Files.isWritable(filePath.getParent())) {
             throw new IOException("Permission denied: Cannot delete file from directory " + filePath.getParent());
         }
         // Also check if the file itself is writable (might prevent deletion on some systems/configurations)
         if (!Files.isWritable(filePath)) {
             log.warn("File {} is not writable, deletion might fail.", filePath);
             // Depending on the OS, this might not actually prevent deletion if directory permissions are sufficient.
         }


        try {
            log.info("Attempting to delete file: {}", filePath);
            Files.delete(filePath);
            log.info("Successfully deleted file: {}", filePath);
        } catch (NoSuchFileException e) {
             log.warn("File not found during delete operation (potentially deleted concurrently): {}", filePath);
             // Treat as success as the file is gone.
        } catch (IOException e) {
            log.error("Failed to delete file {}: {}", filePath, e.getMessage(), e);
            throw new IOException("Failed to delete file: " + e.getMessage(), e);
        } catch (SecurityException se) {
            log.error("Security exception during delete of {}: {}", filePath, se.getMessage(), se);
            throw new IOException("Permission denied during delete operation.", se);
        }
    }
}

