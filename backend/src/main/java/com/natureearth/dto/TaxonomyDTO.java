package com.natureearth.dto;

/**
 * Linnaean classification. RESEARCHER plan only.
 */
public record TaxonomyDTO(
		String kingdom,
		String phylum,
		String className,
		String orderName,
		String family,
		String genus,
		Long ncbiTaxonId) {
}
