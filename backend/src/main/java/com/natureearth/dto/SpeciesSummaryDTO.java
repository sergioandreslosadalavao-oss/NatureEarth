package com.natureearth.dto;

/**
 * Public, plan-independent species projection used by list and casual views.
 */
public record SpeciesSummaryDTO(
		String id,
		String scientificName,
		String commonNameEs,
		String commonNameEn,
		String category,
		String imageUrl,
		Integer observationsCount) {
}
