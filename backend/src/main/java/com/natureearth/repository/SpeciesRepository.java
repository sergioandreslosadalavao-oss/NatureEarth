package com.natureearth.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.natureearth.entity.Species;

/**
 * Species access is plan-gated at the database level: every read goes through
 * one of the {@code v_species_*} views, so a CASUAL caller can never physically
 * reach STUDENT/RESEARCHER columns even if application code is bypassed.
 * <p>
 * {@code search} and {@code category} are passed as nullable parameters, hence
 * the explicit {@code CAST(... AS text)} to keep PostgreSQL from failing to infer
 * the parameter type on {@code IS NULL} comparisons.
 */
public interface SpeciesRepository extends JpaRepository<Species, UUID> {

	String SEARCH_PREDICATE = """
			  (CAST(:search AS text) IS NULL
			   OR common_name_es ILIKE CAST(:pattern AS text)
			   OR common_name_en ILIKE CAST(:pattern AS text)
			   OR scientific_name ILIKE CAST(:pattern AS text))
			""";

	String CATEGORY_PREDICATE = """
			  AND (CAST(:category AS text) IS NULL OR category = CAST(:category AS text))
			""";

	// ── CASUAL view ───────────────────────────────────────────────────────────

	@Query(value = """
			SELECT id, scientific_name, common_name_es, common_name_en, category, image_url, observations_count
			FROM v_species_casual
			WHERE """ + SEARCH_PREDICATE + CATEGORY_PREDICATE + """
			ORDER BY scientific_name ASC
			LIMIT :limit OFFSET :offset
			""", nativeQuery = true)
	List<Object[]> findCasualPage(@Param("search") String search,
			@Param("pattern") String pattern,
			@Param("category") String category,
			@Param("limit") int limit,
			@Param("offset") long offset);

	@Query(value = "SELECT COUNT(*) FROM v_species_casual WHERE " + SEARCH_PREDICATE + CATEGORY_PREDICATE,
			nativeQuery = true)
	long countCasual(@Param("search") String search,
			@Param("pattern") String pattern,
			@Param("category") String category);

	@Query(value = """
			SELECT id, scientific_name, common_name_es, common_name_en, category, image_url, observations_count
			FROM v_species_casual
			WHERE id = :id
			""", nativeQuery = true)
	List<Object[]> findCasualById(@Param("id") UUID id);

	// ── STUDENT view ──────────────────────────────────────────────────────────

	@Query(value = """
			SELECT id, scientific_name, common_name_es, common_name_en, category, image_url, observations_count,
			       conservation_status, habitat, diet, morphology
			FROM v_species_student
			WHERE id = :id
			""", nativeQuery = true)
	List<Object[]> findStudentById(@Param("id") UUID id);

	// ── RESEARCHER view ───────────────────────────────────────────────────────

	@Query(value = """
			SELECT id, scientific_name, common_name_es, common_name_en, category, image_url, observations_count,
			       conservation_status, habitat, diet, morphology,
			       population_estimate, threats, care_wild, care_captivity,
			       kingdom, phylum, "class", order_name, family, genus, ncbi_taxon_id
			FROM v_species_researcher
			WHERE id = :id
			""", nativeQuery = true)
	List<Object[]> findResearcherById(@Param("id") UUID id);
}
