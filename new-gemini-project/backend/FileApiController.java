package com.example.mediamanager.controller;

import com.example.mediamanager.model.MediaFile;
import com.example.mediamanager.service.FileScanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller to expose file management operations via API.
 */
@RestController
@RequestMapping("/api/files")
// IMPORTANT: Configure CORS appropriately for your Angular app's origin
// For development, allow localhost:4200 (default Angular port)
// For production, restrict to your frontend's actual domain.
@CrossOrigin(origins = "http://localhost:4200") // Adjust port if your Angular app runs elsewhere
public class FileApiController {

    private static final Logger log = LoggerFactory.getLogger(FileApiController.class);

    private final FileScanService fileScanService;

    @Autowired
    public FileApiController(FileScanService fileScanService) {
        this.fileScanService = fileScanService;
    }

    // --- DTOs for Request Bodies ---
    public record ScanRequest(String path) {}
    public record RenameRequest(String id, String newName) {} // id is Base64 encoded path

    /**
     * Scans the specified directory and returns the list of media files
     * and identified duplicates.
     *
     * @param scanRequest Request body containing the directory path.
     * @return ResponseEntity containing lists of files and duplicates, or an error.
     */
    @PostMapping("/scan")
    public ResponseEntity<?> scanDirectory(@RequestBody ScanRequest scanRequest) {
        log.info("Received scan request for path: {}", scanRequest.path());
        if (scanRequest.path() == null || scanRequest.path().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Directory path is required."));
        }

        try {
            List<MediaFile> allFiles = fileScanService.scanDirectory(scanRequest.path());
            Map<String, List<MediaFile>> duplicates = fileScanService.findDuplicates(allFiles);

            Map<String, Object> response = new HashMap<>();
            response.put("allFiles", allFiles);
            response.put("duplicates", duplicates); // Key: size::name, Value: List<MediaFile>

            log.info("Scan successful for path: {}. Found {} files, {} duplicate groups.",
                     scanRequest.path(), allFiles.size(), duplicates.size());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Scan failed for path {}: {}", scanRequest.path(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("Scan failed for path {}: {}", scanRequest.path(), e.getMessage(), e);
            // Distinguish between permission errors and other IO errors if possible
             if (e.getMessage() != null && e.getMessage().contains("Permission denied")) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Permission denied: " + e.getMessage()));
             }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Scan failed due to an I/O error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during scan for path {}: {}", scanRequest.path(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred during scan."));
        }
    }

    /**
     * Renames a file identified by its Base64 encoded path ID.
     *
     * @param renameRequest Request body containing the file ID and the new name.
     * @return ResponseEntity with the updated MediaFile or an error.
     */
    @PutMapping("/rename")
    public ResponseEntity<?> renameFile(@RequestBody RenameRequest renameRequest) {
        if (renameRequest.id() == null || renameRequest.id().isBlank() ||
            renameRequest.newName() == null || renameRequest.newName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File ID and new name are required."));
        }

        String currentPathStr = MediaFile.decodeId(renameRequest.id());
        if (currentPathStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file ID format."));
        }
        log.info("Received rename request for file ID: {} (Path: {}) to new name: {}",
                 renameRequest.id(), currentPathStr, renameRequest.newName());


        try {
            MediaFile updatedFile = fileScanService.renameFile(currentPathStr, renameRequest.newName());
            log.info("Rename successful for ID: {}", renameRequest.id());
            return ResponseEntity.ok(updatedFile);
        } catch (IllegalArgumentException e) {
             log.warn("Rename failed for ID {}: {}", renameRequest.id(), e.getMessage());
             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (FileNotFoundException e) {
            log.warn("Rename failed for ID {}: File not found.", renameRequest.id());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (FileAlreadyExistsException e) {
             log.warn("Rename failed for ID {}: {}", renameRequest.id(), e.getMessage());
             return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("Rename failed for ID {}: {}", renameRequest.id(), e.getMessage(), e);
             if (e.getMessage() != null && e.getMessage().contains("Permission denied")) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Permission denied: " + e.getMessage()));
             }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Rename failed due to an I/O error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during rename for ID {}: {}", renameRequest.id(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred during rename."));
        }
    }

    /**
     * Deletes a file identified by its Base64 encoded path ID.
     *
     * @param id The Base64 encoded path of the file to delete.
     * @return ResponseEntity indicating success or failure.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
         if (id == null || id.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File ID is required."));
        }

        String filePathStr = MediaFile.decodeId(id);
        if (filePathStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file ID format."));
        }
         log.info("Received delete request for file ID: {} (Path: {})", id, filePathStr);

        try {
            fileScanService.deleteFile(filePathStr);
            log.info("Delete successful for ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully: " + filePathStr)); // Or ResponseEntity.noContent()
        } catch (FileNotFoundException e) {
            // If service treats not found as non-error, this might not be thrown.
            // If service returns normally for not found, this is fine.
             log.warn("Delete failed for ID {}: File not found.", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("Delete failed for ID {}: {}", id, e.getMessage(), e);
             if (e.getMessage() != null && e.getMessage().contains("Permission denied")) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Permission denied: " + e.getMessage()));
             }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Delete failed due to an I/O error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during delete for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred during delete."));
        }
    }
}

