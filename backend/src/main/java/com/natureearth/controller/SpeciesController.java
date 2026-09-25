package com.natureearth.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.natureearth.dto.PagedResponse;
import com.natureearth.dto.SpeciesDetailDTO;
import com.natureearth.dto.SpeciesSummaryDTO;
import com.natureearth.entity.UserPlan;
import com.natureearth.security.AuthenticatedUser;
import com.natureearth.service.SpeciesService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;

@RestController
@RequestMapping("/api/species")
public class SpeciesController {

	private final SpeciesService speciesService;

	public SpeciesController(SpeciesService speciesService) {
		this.speciesService = speciesService;
	}

	/** Public listing, always served from the CASUAL view. */
	@GetMapping
	public PagedResponse<SpeciesSummaryDTO> list(
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String category,
			@RequestParam(defaultValue = "0") @PositiveOrZero int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return speciesService.list(search, category, page, size);
	}

	/**
	 * Detail visibility follows the caller's plan. An anonymous caller (or a
	 * CASUAL one) only receives the basic fields, because the service reads the
	 * matching restricted view.
	 */
	@GetMapping("/{id}")
	public SpeciesDetailDTO detail(@PathVariable UUID id,
			@AuthenticationPrincipal AuthenticatedUser principal) {

		UserPlan plan = principal == null ? UserPlan.CASUAL : principal.getPlan();
		UUID userId = principal == null ? null : principal.getId();
		return speciesService.detail(id, plan, userId);
	}
}
