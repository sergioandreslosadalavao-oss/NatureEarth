package com.natureearth.dto;

/**
 * Citation backing one species field. Not plan-gated: traceability is part of
 * the product promise rather than premium content.
 */
public record SourceDTO(
		String fieldName,
		String sourceName,
		String reference) {
}
