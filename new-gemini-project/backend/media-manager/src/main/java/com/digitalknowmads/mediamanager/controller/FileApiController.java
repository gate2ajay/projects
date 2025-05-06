package com.digitalknowmads.mediamanager.controller;

import com.digitalknowmads.mediamanager.model.MediaFile;
import com.digitalknowmads.mediamanager.service.FileScanService;
// Import DTOs from the FileApiDtos class
import com.digitalknowmads.mediamanager.controller.FileApiDtos.ScanRequest;
import com.digitalknowmads.mediamanager.controller.FileApiDtos.RenameRequest;
import com.digitalknowmads.mediamanager.controller.FileApiDtos.PagedResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.PageImpl; // Import PageImpl
import org.springframework.data.domain.PageRequest; // Import PageRequest
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.util.Collections; // Import Collections
import java.util.List;
import java.util.Map;

/**
 * REST Controller to expose file management operations via API.
 */
@RestController
@RequestMapping("/api/files")
// Using global CORS config now, so this can be commented out or removed if preferred
// @CrossOrigin(origins = "http://localhost:4200")
public class FileApiController {

    private static final Logger log = LoggerFactory.getLogger(FileApiController.class);

    private final FileScanService fileScanService;

    @Autowired
    public FileApiController(FileScanService fileScanService) {
        this.fileScanService = fileScanService;
    }

    /**
     * Scans the specified directory and returns a paginated list of media files
     * and identified duplicates.
     * Uses the DTOs defined in FileApiDtos.
     *
     * @param scanRequest Request body containing the directory path (ScanRequest DTO).
     * @param page        The page number requested (0-based, default is 0).
     * @param size        The number of items per page (default is 100).
     * @return ResponseEntity containing a PagedResponse or an error.
     */
    @PostMapping("/scan")
    public ResponseEntity<?> scanDirectory(
            @RequestBody ScanRequest scanRequest, // Use ScanRequest DTO
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) { // Default size 100

        log.info("Received scan request for path: {}, page: {}, size: {}", scanRequest.path(), page, size);
        if (scanRequest.path() == null || scanRequest.path().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Directory path is required."));
        }
        if (page < 0 || size <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Page index must be non-negative and size must be positive."));
        }


        try {
            // 1. Scan the directory (service returns all files)
            List<MediaFile> allFiles = fileScanService.scanDirectory(scanRequest.path());

            // 2. Find duplicates across all scanned files
            Map<String, List<MediaFile>> duplicates = fileScanService.findDuplicates(allFiles);

            // 3. Create pagination information
            Pageable pageable = PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            // Ensure 'end' doesn't exceed the list size
            int end = Math.min((start + pageable.getPageSize()), allFiles.size());

            List<MediaFile> pageContent;
            if (start > allFiles.size()) {
                // If the requested start index is beyond the list size, return empty content
                pageContent = Collections.emptyList();
                log.warn("Requested page {} is out of bounds for {} files.", page, allFiles.size());
            } else {
                pageContent = allFiles.subList(start, end);
            }


            // 4. Create a Page object (useful for getting total pages etc.)
            Page<MediaFile> filePage = new PageImpl<>(pageContent, pageable, allFiles.size());

            // 5. Create the PagedResponse DTO using the record constructor
            PagedResponse<MediaFile> response = new PagedResponse<>(
                    filePage.getContent(),
                    filePage.getNumber(),
                    filePage.getTotalElements(),
                    filePage.getTotalPages(),
                    duplicates // Include full duplicates map in response
            );

            log.info("Scan successful for path: {}. Returning page {}/{} with {} items (Total items: {}). Found {} duplicate groups.",
                    scanRequest.path(), response.currentPage(), response.totalPages() -1, response.content().size(), response.totalItems(), duplicates.size());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Scan failed for path {}: {}", scanRequest.path(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("Scan failed for path {}: {}", scanRequest.path(), e.getMessage(), e);
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
     * Uses the RenameRequest DTO.
     */
    @PutMapping("/rename")
    public ResponseEntity<?> renameFile(@RequestBody RenameRequest renameRequest) { // Use RenameRequest DTO
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
