package com.project.cinema.repository;

import com.project.cinema.models.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    // Find friendship between two users regardless of who sent the request
    // Checks BOTH directions (A→B or B→A)
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requester.id = :userId1 AND f.addressee.id = :userId2) OR " +
            "(f.requester.id = :userId2 AND f.addressee.id = :userId1)")
    Optional<Friendship>  findFriendshipBetween(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2);

    // Get all ACCEPTED friendships for a user (both directions)
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requester.id = :userId OR f.addressee.id = :userId) " +
            "AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendships(@Param("userId") Long userId);

    // Get pending requests received by a user
    List<Friendship> findByAddresseeIdAndStatus(
            Long addresseeId, Friendship.FriendshipStatus status);

    // Find specific directional friendship — used for accept/reject
    Optional<Friendship> findByRequesterIdAndAddresseeId(
            Long requesterId, Long addresseeId);
}
