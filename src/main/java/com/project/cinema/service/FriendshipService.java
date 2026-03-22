package com.project.cinema.service;

import com.project.cinema.dto.FriendshipResponse;
import com.project.cinema.dto.UserMovieListResponse;
import com.project.cinema.models.Friendship;
import com.project.cinema.models.User;
import com.project.cinema.repository.FriendshipRepository;
import com.project.cinema.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final UserMovieListService userMovieListService;
    // Notice — we reuse UserMovieListService directly instead of duplicating logic

    // ── Helper: get currently logged in user ───────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ── Helper: build response — always show the OTHER person's details ────
    private FriendshipResponse toResponse(Friendship friendship, User currentUser) {
        // Figure out who the "other" person is
        User other = friendship.getRequester().getId().equals(currentUser.getId())
                ? friendship.getAddressee()
                : friendship.getRequester();

        return FriendshipResponse.builder()
                .friendshipId(friendship.getId())
                .status(friendship.getStatus().name())
                .createdAt(friendship.getCreatedAt())
                .userId(other.getId())
                .username(other.getUsername())
                .profilePictureUrl(other.getProfilePictureUrl())
                .build();
    }

    // ── Helper: check if two users are friends ─────────────────────────────
    private boolean areFriends(User currentUser, User targetUser) {
        return friendshipRepository
                .findFriendshipBetween(currentUser.getId(), targetUser.getId())
                .map(f -> f.getStatus() == Friendship.FriendshipStatus.ACCEPTED)
                .orElse(false);
    }

    // ── POST /api/friendships/request/{addresseeId} ────────────────────────
    public FriendshipResponse sendRequest(Long addresseeId) {
        User requester = getCurrentUser();

        if (requester.getId().equals(addresseeId)) {
            throw new RuntimeException("You cannot send a friend request to yourself");
        }

        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + addresseeId));

        // Check if a friendship already exists in either direction
        if (friendshipRepository.findFriendshipBetween(requester.getId(), addresseeId).isPresent()) {
            throw new RuntimeException("Friendship already exists with this user");
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(Friendship.FriendshipStatus.PENDING)
                .build();

        return toResponse(friendshipRepository.save(friendship), requester);
    }

    // ── PUT /api/friendships/accept/{requesterId} ──────────────────────────
    public FriendshipResponse acceptRequest(Long requesterId) {
        User currentUser = getCurrentUser();

        // Only the ADDRESSEE can accept — find request where logged-in user is addressee
        Friendship friendship = friendshipRepository
                .findByRequesterIdAndAddresseeId(requesterId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        return toResponse(friendshipRepository.save(friendship), currentUser);
    }

    // ── PUT /api/friendships/reject/{requesterId} ──────────────────────────
    public void rejectRequest(Long requesterId) {
        User currentUser = getCurrentUser();

        Friendship friendship = friendshipRepository
                .findByRequesterIdAndAddresseeId(requesterId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }

        // Simply delete the row — no need to keep rejected requests
        friendshipRepository.delete(friendship);
    }

    // ── PUT /api/friendships/block/{userId} ────────────────────────────────
    public FriendshipResponse blockUser(Long userId) {
        User currentUser = getCurrentUser();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if friendship exists — update it, or create a new blocked entry
        Friendship friendship = friendshipRepository
                .findFriendshipBetween(currentUser.getId(), userId)
                .orElse(Friendship.builder()
                        .requester(currentUser)
                        .addressee(targetUser)
                        .build());

        friendship.setStatus(Friendship.FriendshipStatus.BLOCKED);
        return toResponse(friendshipRepository.save(friendship), currentUser);
    }

    // ── DELETE /api/friendships/{userId} ───────────────────────────────────
    public void unfriend(Long userId) {
        User currentUser = getCurrentUser();

        Friendship friendship = friendshipRepository
                .findFriendshipBetween(currentUser.getId(), userId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        friendshipRepository.delete(friendship);
    }

    // ── GET /api/friendships/me ────────────────────────────────────────────
    public List<FriendshipResponse> getMyFriends() {
        User currentUser = getCurrentUser();

        return friendshipRepository
                .findAcceptedFriendships(currentUser.getId())
                .stream()
                .map(f -> toResponse(f, currentUser))
                .collect(Collectors.toList());
    }

    // ── GET /api/friendships/pending ───────────────────────────────────────
    // Only shows requests RECEIVED by current user (not ones they sent)
    public List<FriendshipResponse> getPendingRequests() {
        User currentUser = getCurrentUser();

        return friendshipRepository
                .findByAddresseeIdAndStatus(currentUser.getId(), Friendship.FriendshipStatus.PENDING)
                .stream()
                .map(f -> toResponse(f, currentUser))
                .collect(Collectors.toList());
    }

    // ── GET /api/friendships/{userId}/lists/{listType} ─────────────────────
    // View a friend's movie list — privacy check happens here
    public List<UserMovieListResponse> getFriendList(Long userId, String listType) {
        User currentUser = getCurrentUser();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Privacy check — must be friends to view their list
        if (!areFriends(currentUser, targetUser)) {
            throw new RuntimeException("You must be friends to view this user's lists");
        }

        // Reuse existing UserMovieListService method — no duplication
        return userMovieListService.getUserList(userId, listType);
    }
}
