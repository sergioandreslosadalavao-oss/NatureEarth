package com.natureearth.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.natureearth.entity.SpeciesLocation;

public interface SpeciesLocationRepository extends JpaRepository<SpeciesLocation, UUID> {

	List<SpeciesLocation> findBySpeciesId(UUID speciesId);

	/**
	 * Globe markers. Coordinates are projected in SQL because the PostGIS
	 * {@code geography} column has no direct JPA mapping.
	 */
	@Query(value = """
			SELECT l.species_id,
			       l.place_name,
			       ST_Y(l.geom::geometry) AS lat,
			       ST_X(l.geom::geometry) AS lng,
			       s.common_name_es,
			       s.scientific_name,
			       s.category
			FROM species_locations l
			JOIN species s ON s.id = l.species_id
			ORDER BY s.scientific_name ASC
			""", nativeQuery = true)
	List<Object[]> findGlobeMarkers();
}
