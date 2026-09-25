package com.natureearth.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Species detail whose visible fields depend on the caller's plan.
 * <p>
 * {@code plan} always states which visibility tier produced the payload.
 * Fields the plan cannot see stay null and are omitted from the JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SpeciesDetailDTO(
		String id,
		String scientificName,
		String commonNameEs,
		String commonNameEn,
		String category,
		String imageUrl,
		Integer observationsCount,
		String plan,

		String conservationStatus,
		String habitat,
		String diet,
		String morphology,

		Long populationEstimate,
		String threats,
		String careWild,
		String careCaptivity,

		List<TaxonomyDTO> taxonomy,
		List<PaperDTO> papers,
		List<SourceDTO> sources) {

	/**
	 * Base payload shared by every plan tier. Citations are included because
	 * traceability is not premium content.
	 */
	public static SpeciesDetailDTO basic(SpeciesSummaryDTO summary, String plan, List<SourceDTO> sources) {
		return new SpeciesDetailDTO(
				summary.id(),
				summary.scientificName(),
				summary.commonNameEs(),
				summary.commonNameEn(),
				summary.category(),
				summary.imageUrl(),
				summary.observationsCount(),
				plan,
				null, null, null, null,
				null, null, null, null,
				null, null, sources);
	}
}
