package com.digitalknowmads.mediamanager.controller;

import com.digitalknowmads.mediamanager.model.MediaFile;
import java.util.List;
import java.util.Map;

/**
 * DTOs used in FileApiController.
 */
public class FileApiDtos {

    // Request body for scanning (remains the same)
    public record ScanRequest(String path) {}

    // Request body for renaming (remains the same)
    public record RenameRequest(String id, String newName) {}

    /**
     * Represents a paginated response containing a list of items and pagination details.
     * @param <T> The type of the items in the list.
     */
    public record PagedResponse<T>(
            List<T> content, // The list of items for the current page
            int currentPage, // The current page number (0-based)
            long totalItems, // The total number of items across all pages
            int totalPages, // The total number of pages
            Map<String, List<MediaFile>> duplicates // Include duplicates (sent with every page for simplicity here)
    ) {}
}
