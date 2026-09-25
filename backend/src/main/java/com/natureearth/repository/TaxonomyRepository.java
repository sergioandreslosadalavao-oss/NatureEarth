package com.natureearth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.natureearth.entity.Taxonomy;

public interface TaxonomyRepository extends JpaRepository<Taxonomy, UUID> {

	Optional<Taxonomy> findBySpeciesId(UUID speciesId);
}
