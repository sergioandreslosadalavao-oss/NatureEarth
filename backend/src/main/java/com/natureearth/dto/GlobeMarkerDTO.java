package com.natureearth.dto;

/**
 * Point plotted on the 3D globe.
 */
public record GlobeMarkerDTO(
		String speciesId,
		String commonNameEs,
		String scientificName,
		String category,
		Double lat,
		Double lng,
		String placeName) {
}
