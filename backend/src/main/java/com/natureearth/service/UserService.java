package com.natureearth.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.natureearth.dto.UserResponse;
import com.natureearth.entity.Subscription;
import com.natureearth.entity.SubscriptionStatus;
import com.natureearth.entity.User;
import com.natureearth.entity.UserPlan;
import com.natureearth.exception.BadRequestException;
import com.natureearth.exception.ResourceNotFoundException;
import com.natureearth.repository.SubscriptionRepository;
import com.natureearth.repository.UserRepository;

import jakarta.persistence.EntityManager;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);
	private static final int SUBSCRIPTION_MONTHS = 12;

	private final UserRepository userRepository;
	private final SubscriptionRepository subscriptionRepository;
	private final EntityManager entityManager;

	public UserService(UserRepository userRepository,
			SubscriptionRepository subscriptionRepository,
			EntityManager entityManager) {
		this.userRepository = userRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.entityManager = entityManager;
	}

	@Transactional(readOnly = true)
	public UserResponse profile(UUID userId) {
		return toResponse(requireUser(userId));
	}

	/**
	 * Upgrades the caller's plan.
	 * <p>
	 * The {@code idx_active_subscription} partial unique index allows only one
	 * ACTIVE row per user, so any existing active subscription is cancelled first.
	 * <p>
	 * The {@code apply_subscription_plan} trigger then copies the new plan onto
	 * {@code users.plan}, but the trigger's write is invisible to the persistence
	 * context that already holds this {@code User}, hence the explicit
	 * {@code refresh}. The manual update afterwards is a safety net for databases
	 * where the trigger is missing.
	 */
	@Transactional
	public UserResponse upgrade(UUID userId, UserPlan targetPlan) {
		User user = requireUser(userId);

		if (targetPlan == UserPlan.CASUAL) {
			throw new BadRequestException("CASUAL is the free default plan and cannot be purchased");
		}
		if (user.getPlan() == targetPlan) {
			throw new BadRequestException("The user is already on the " + targetPlan + " plan");
		}

		subscriptionRepository.findFirstByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
				.ifPresent(current -> {
					current.setStatus(SubscriptionStatus.CANCELLED);
					subscriptionRepository.saveAndFlush(current);
				});

		LocalDateTime start = LocalDateTime.now();
		subscriptionRepository.saveAndFlush(
				new Subscription(user, targetPlan, start, start.plusMonths(SUBSCRIPTION_MONTHS)));

		User refreshed = userRepository.findById(userId).orElseThrow();
		entityManager.refresh(refreshed);

		if (refreshed.getPlan() != targetPlan) {
			log.warn("Trigger apply_subscription_plan did not set plan {} for user {}; updating explicitly",
					targetPlan, userId);
			refreshed.setPlan(targetPlan);
			userRepository.saveAndFlush(refreshed);
		}

		return toResponse(refreshed);
	}

	private User requireUser(UUID userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found"));
	}

	private static UserResponse toResponse(User user) {
		return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPlan());
	}
}
