package com.natureearth.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.natureearth.dto.GlobeMarkerDTO;
import com.natureearth.dto.PagedResponse;
import com.natureearth.dto.PaperDTO;
import com.natureearth.dto.SourceDTO;
import com.natureearth.dto.SpeciesDetailDTO;
import com.natureearth.dto.SpeciesSummaryDTO;
import com.natureearth.dto.TaxonomyDTO;
import com.natureearth.entity.Species;
import com.natureearth.entity.User;
import com.natureearth.entity.UserActivity;
import com.natureearth.entity.UserPlan;
import com.natureearth.exception.BadRequestException;
import com.natureearth.exception.ResourceNotFoundException;
import com.natureearth.repository.PaperRepository;
import com.natureearth.repository.SpeciesLocationRepository;
import com.natureearth.repository.SpeciesRepository;
import com.natureearth.repository.SpeciesSourceRepository;
import com.natureearth.repository.TaxonomyRepository;
import com.natureearth.repository.UserActivityRepository;
import com.natureearth.repository.UserRepository;

/**
 * Reads species through the plan-scoped SQL views and shapes the result
 * according to the caller's plan.
 */
@Service
public class SpeciesService {

	/** The taxonomy categories accepted by the exact-match category filter. */
	private static final Set<String> VALID_CATEGORIES = Set.of(
			"Mammalia", "Aves", "Reptilia", "Amphibia", "Actinopterygii");

	private static final String ACTION_VIEW_SPECIES = "view_species";
	private static final int MAX_PAGE_SIZE = 100;

	private final SpeciesRepository speciesRepository;
	private final PaperRepository paperRepository;
	private final SpeciesSourceRepository sourceRepository;
	private final SpeciesLocationRepository locationRepository;
	private final TaxonomyRepository taxonomyRepository;
	private final UserActivityRepository activityRepository;
	private final UserRepository userRepository;

	public SpeciesService(SpeciesRepository speciesRepository,
			PaperRepository paperRepository,
			SpeciesSourceRepository sourceRepository,
			SpeciesLocationRepository locationRepository,
			TaxonomyRepository taxonomyRepository,
			UserActivityRepository activityRepository,
			UserRepository userRepository) {
		this.speciesRepository = speciesRepository;
		this.paperRepository = paperRepository;
		this.sourceRepository = sourceRepository;
		this.locationRepository = locationRepository;
		this.taxonomyRepository = taxonomyRepository;
		this.activityRepository = activityRepository;
		this.userRepository = userRepository;
	}

	// ── Listing (public, CASUAL view) ─────────────────────────────────────────

	@Transactional(readOnly = true)
	public PagedResponse<SpeciesSummaryDTO> list(String search, String category, int page, int size) {
		int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
		int safePage = Math.max(page, 0);
		String normalizedSearch = normalize(search);
		String normalizedCategory = normalizeCategory(category);
		String pattern = normalizedSearch == null ? null : "%" + normalizedSearch + "%";
		long offset = (long) safePage * safeSize;

		List<SpeciesSummaryDTO> content = speciesRepository
				.findCasualPage(normalizedSearch, pattern, normalizedCategory, safeSize, offset)
				.stream()
				.map(SpeciesService::toSummary)
				.toList();

		long total = speciesRepository.countCasual(normalizedSearch, pattern, normalizedCategory);
		return PagedResponse.of(content, safePage, safeSize, total);
	}

	// ── Detail (plan-gated) ───────────────────────────────────────────────────

	/**
	 * Builds the detail payload visible to {@code plan}. An anonymous or CASUAL
	 * caller only ever reaches {@code v_species_casual}.
	 *
	 * @param authenticatedUserId when present, the lookup is recorded in
	 *                            {@code user_activity}
	 */
	@Transactional
	public SpeciesDetailDTO detail(UUID speciesId, UserPlan plan, UUID authenticatedUserId) {
		UserPlan effectivePlan = plan == null ? UserPlan.CASUAL : plan;
		SpeciesDetailDTO detail = switch (effectivePlan) {
			case CASUAL -> casualDetail(speciesId);
			case STUDENT -> studentDetail(speciesId);
			case RESEARCHER -> researcherDetail(speciesId);
		};

		if (authenticatedUserId != null) {
			recordView(authenticatedUserId, speciesId);
		}
		return detail;
	}

	private SpeciesDetailDTO casualDetail(UUID speciesId) {
		return speciesRepository.findCasualById(speciesId).stream()
				.findFirst()
				.map(row -> SpeciesDetailDTO.basic(
						toSummary(row), UserPlan.CASUAL.name(), loadSources(speciesId)))
				.orElseThrow(() -> speciesNotFound(speciesId));
	}

	private SpeciesDetailDTO studentDetail(UUID speciesId) {
		List<Object[]> rows = speciesRepository.findStudentById(speciesId);
		if (rows.isEmpty()) {
			throw speciesNotFound(speciesId);
		}
		Object[] row = rows.get(0);
		return new SpeciesDetailDTO(
				asString(row[0]),
				asString(row[1]),
				asString(row[2]),
				asString(row[3]),
				asString(row[4]),
				asString(row[5]),
				asInteger(row[6]),
				UserPlan.STUDENT.name(),
				asString(row[7]),
				asString(row[8]),
				asString(row[9]),
				asString(row[10]),
				null, null, null, null,
				null, null, loadSources(speciesId));
	}

	private SpeciesDetailDTO researcherDetail(UUID speciesId) {
		List<Object[]> rows = speciesRepository.findResearcherById(speciesId);
		if (rows.isEmpty()) {
			throw speciesNotFound(speciesId);
		}
		Object[] row = rows.get(0);

		TaxonomyDTO taxonomy = taxonomyFromView(row, 15)
				.orElseGet(() -> taxonomyRepository.findBySpeciesId(speciesId)
						.map(t -> new TaxonomyDTO(
								t.getKingdom(), t.getPhylum(), t.getClassName(), t.getOrderName(),
								t.getFamily(), t.getGenus(), t.getNcbiTaxonId()))
						.orElse(null));

		return new SpeciesDetailDTO(
				asString(row[0]),
				asString(row[1]),
				asString(row[2]),
				asString(row[3]),
				asString(row[4]),
				asString(row[5]),
				asInteger(row[6]),
				UserPlan.RESEARCHER.name(),
				asString(row[7]),
				asString(row[8]),
				asString(row[9]),
				asString(row[10]),
				asLong(row[11]),
				asString(row[12]),
				asString(row[13]),
				asString(row[14]),
				taxonomy == null ? null : List.of(taxonomy),
				loadPapers(speciesId),
				loadSources(speciesId));
	}

	// ── Globe ─────────────────────────────────────────────────────────────────

	@Transactional(readOnly = true)
	public List<GlobeMarkerDTO> globeMarkers() {
		return locationRepository.findGlobeMarkers().stream()
				.map(row -> new GlobeMarkerDTO(
						asString(row[0]),
						asString(row[4]),
						asString(row[5]),
						asString(row[6]),
						asDouble(row[2]),
						asDouble(row[3]),
						asString(row[1])))
				.toList();
	}

	// ── Internals ─────────────────────────────────────────────────────────────

	private void recordView(UUID userId, UUID speciesId) {
		User user = userRepository.findById(userId).orElse(null);
		Species species = speciesRepository.findById(speciesId).orElse(null);
		if (user != null && species != null) {
			activityRepository.save(new UserActivity(user, ACTION_VIEW_SPECIES, species));
		}
	}

	private List<PaperDTO> loadPapers(UUID speciesId) {
		return paperRepository.findBySpeciesIdOrderByYearDesc(speciesId).stream()
				.map(paper -> new PaperDTO(
						paper.getId().toString(),
						paper.getTitle(),
						paper.getAuthors(),
						paper.getYear(),
						paper.getDoi(),
						paper.getUrl()))
				.toList();
	}

	private List<SourceDTO> loadSources(UUID speciesId) {
		return sourceRepository.findCitationsBySpeciesId(speciesId).stream()
				.map(row -> new SourceDTO(asString(row[0]), asString(row[1]), asString(row[2])))
				.toList();
	}

	private static Optional<TaxonomyDTO> taxonomyFromView(Object[] row, int offset) {
		TaxonomyDTO taxonomy = new TaxonomyDTO(
				asString(row[offset]),
				asString(row[offset + 1]),
				asString(row[offset + 2]),
				asString(row[offset + 3]),
				asString(row[offset + 4]),
				asString(row[offset + 5]),
				asLong(row[offset + 6]));
		boolean empty = taxonomy.kingdom() == null
				&& taxonomy.className() == null
				&& taxonomy.ncbiTaxonId() == null;
		return empty ? Optional.empty() : Optional.of(taxonomy);
	}

	private static SpeciesSummaryDTO toSummary(Object[] row) {
		return new SpeciesSummaryDTO(
				asString(row[0]),
				asString(row[1]),
				asString(row[2]),
				asString(row[3]),
				asString(row[4]),
				asString(row[5]),
				asInteger(row[6]));
	}

	private static ResourceNotFoundException speciesNotFound(UUID speciesId) {
		return new ResourceNotFoundException("Species " + speciesId + " not found");
	}

	private String normalizeCategory(String category) {
		String normalized = normalize(category);
		if (normalized == null) {
			return null;
		}
		for (String valid : VALID_CATEGORIES) {
			if (valid.equalsIgnoreCase(normalized)) {
				return valid;
			}
		}
		throw new BadRequestException(
				"Unsupported category '" + normalized + "'. Allowed values: " + VALID_CATEGORIES);
	}

	private static String normalize(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed.toLowerCase(Locale.ROOT);
	}

	private static String asString(Object value) {
		return value == null ? null : value.toString();
	}

	private static Long asLong(Object value) {
		return value instanceof Number number ? number.longValue() : null;
	}

	private static Integer asInteger(Object value) {
		return value instanceof Number number ? number.intValue() : null;
	}

	private static Double asDouble(Object value) {
		return value instanceof Number number ? number.doubleValue() : null;
	}
}
