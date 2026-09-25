package com.natureearth.dto;

/**
 * Scientific reference. RESEARCHER plan only.
 */
public record PaperDTO(
		String id,
		String title,
		String authors,
		Integer year,
		String doi,
		String url) {
}
