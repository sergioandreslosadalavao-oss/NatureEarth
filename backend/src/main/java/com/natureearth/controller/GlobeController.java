package com.natureearth.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.natureearth.dto.GlobeMarkerDTO;
import com.natureearth.service.SpeciesService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/globe")
@Tag(name = "Globe", description = "Occurrence points for the 3D globe")
public class GlobeController {

	private final SpeciesService speciesService;

	public GlobeController(SpeciesService speciesService) {
		this.speciesService = speciesService;
	}

	@Operation(summary = "List globe markers. Returns an empty list when no location is known.")
	@GetMapping("/markers")
	public List<GlobeMarkerDTO> markers() {
		return speciesService.globeMarkers();
	}
}
