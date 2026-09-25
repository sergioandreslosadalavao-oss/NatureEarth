package com.natureearth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.natureearth.dto.SpeciesDetailDTO;
import com.natureearth.entity.Species;
import com.natureearth.entity.Taxonomy;
import com.natureearth.entity.User;
import com.natureearth.entity.UserPlan;
import com.natureearth.repository.SpeciesRepository;
import com.natureearth.repository.TaxonomyRepository;
import com.natureearth.repository.UserRepository;
import com.natureearth.service.SpeciesService;
import com.natureearth.service.UserService;

/**
 * Verifies the subscription model end to end against the real database:
 * a CASUAL caller must never see premium fields, and an upgrade must take
 * effect on the next read.
 * <p>
 * Everything runs inside a rolled-back transaction, so no test data is persisted.
 */
@SpringBootTest
@Transactional
class SpeciesPlanAccessTest {

	@Autowired
	private SpeciesService speciesService;

	@Autowired
	private UserService userService;

	@Autowired
	private SpeciesRepository speciesRepository;

	@Autowired
	private TaxonomyRepository taxonomyRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private UUID speciesId;

	@BeforeEach
	void loadSampleSpecies() {
		List<Species> all = speciesRepository.findAll();
		assertThat(all).as("schema must be seeded with at least one species").isNotEmpty();
		speciesId = all.get(0).getId();
	}

	@Test
	@DisplayName("CASUAL detail exposes no conservation data")
	void casualPlanSeesOnlyBasicFields() {
		SpeciesDetailDTO detail = speciesService.detail(speciesId, UserPlan.CASUAL, null);

		assertThat(detail.plan()).isEqualTo("CASUAL");
		assertThat(detail.scientificName()).isNotBlank();
		assertThat(detail.habitat()).isNull();
		assertThat(detail.conservationStatus()).isNull();
		assertThat(detail.populationEstimate()).isNull();
		assertThat(detail.threats()).isNull();
		assertThat(detail.taxonomy()).isNull();
		assertThat(detail.papers()).isNull();
	}

	@Test
	@DisplayName("STUDENT detail adds conservation basics but not research fields")
	void studentPlanSeesConservationBasics() {
		SpeciesDetailDTO detail = speciesService.detail(speciesId, UserPlan.STUDENT, null);

		assertThat(detail.plan()).isEqualTo("STUDENT");
		assertThat(detail.habitat()).isNotBlank();
		assertThat(detail.diet()).isNotBlank();
		assertThat(detail.morphology()).isNotBlank();
		assertThat(detail.populationEstimate()).isNull();
		assertThat(detail.careWild()).isNull();
		assertThat(detail.taxonomy()).isNull();
	}

	@Test
	@DisplayName("RESEARCHER detail adds population, care and taxonomy")
	void researcherPlanSeesEverything() {
		SpeciesDetailDTO detail = speciesService.detail(speciesId, UserPlan.RESEARCHER, null);

		assertThat(detail.plan()).isEqualTo("RESEARCHER");
		assertThat(detail.populationEstimate()).isNotNull();
		assertThat(detail.threats()).isNotBlank();
		assertThat(detail.careWild()).isNotBlank();
		assertThat(detail.taxonomy()).isNotNull().hasSize(1);
		assertThat(detail.taxonomy().getFirst().kingdom()).isNotBlank();
	}

	@Test
	@DisplayName("Taxonomy entity maps the reserved 'class' and 'order_name' columns")
	void taxonomyEntityMapsReservedColumns() {
		Taxonomy taxonomy = taxonomyRepository.findBySpeciesId(speciesId).orElseThrow();

		assertThat(taxonomy.getClassName()).isNotBlank();
		assertThat(taxonomy.getOrderName()).isNotBlank();
		assertThat(taxonomy.getNcbiTaxonId()).isNotNull();
	}

	@Test
	@DisplayName("Anonymous callers are treated as CASUAL")
	void nullPlanDegradesToCasual() {
		SpeciesDetailDTO detail = speciesService.detail(speciesId, null, null);

		assertThat(detail.plan()).isEqualTo("CASUAL");
		assertThat(detail.habitat()).isNull();
	}

	@Test
	@DisplayName("Upgrading to STUDENT unlocks the student view immediately")
	void upgradeUnlocksHigherTier() {
		User user = new User("Test Student", "plan-access-test@example.com", passwordEncoder.encode("secret123"));
		userRepository.saveAndFlush(user);
		assertThat(user.getPlan()).isEqualTo(UserPlan.CASUAL);

		assertThat(speciesService.detail(speciesId, user.getPlan(), null).habitat()).isNull();

		var upgraded = userService.upgrade(user.getId(), UserPlan.STUDENT);
		assertThat(upgraded.plan()).isEqualTo(UserPlan.STUDENT);

		// Re-read from the database, exactly like the JWT filter does per request.
		UserPlan reloadedPlan = userRepository.findById(user.getId()).orElseThrow().getPlan();
		assertThat(reloadedPlan).isEqualTo(UserPlan.STUDENT);
		assertThat(speciesService.detail(speciesId, reloadedPlan, null).habitat()).isNotBlank();
	}

	@Test
	@DisplayName("Citations accompany the species detail")
	void detailIncludesSources() {
		SpeciesDetailDTO detail = speciesService.detail(speciesId, UserPlan.CASUAL, null);

		assertThat(detail.sources()).isNotNull().isNotEmpty();
		assertThat(detail.sources().getFirst().fieldName()).isNotBlank();
		assertThat(detail.sources().getFirst().sourceName()).isNotBlank();
	}
}
