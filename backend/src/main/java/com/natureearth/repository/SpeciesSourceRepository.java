package com.natureearth.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.natureearth.entity.SpeciesSource;

public interface SpeciesSourceRepository extends JpaRepository<SpeciesSource, UUID> {

	List<SpeciesSource> findBySpeciesIdOrderByFieldNameAsc(UUID speciesId);

	/**
	 * Reads citations straight from {@code v_species_with_sources}. A LEFT JOIN
	 * means a species without citations yields a single row with null citation
	 * columns, so those are filtered out here.
	 */
	@Query(value = """
			SELECT field_name, source_name, reference
			FROM v_species_with_sources
			WHERE id = :speciesId
			  AND field_name IS NOT NULL
			ORDER BY field_name ASC
			""", nativeQuery = true)
	List<Object[]> findCitationsBySpeciesId(@Param("speciesId") UUID speciesId);
}
