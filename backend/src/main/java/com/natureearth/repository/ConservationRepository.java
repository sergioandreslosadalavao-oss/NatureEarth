package com.natureearth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.natureearth.entity.Conservation;

public interface ConservationRepository extends JpaRepository<Conservation, UUID> {

	Optional<Conservation> findBySpeciesId(UUID speciesId);
}
