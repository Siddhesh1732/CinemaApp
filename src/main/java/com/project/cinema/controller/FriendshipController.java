package com.project.cinema.controller;

import com.project.cinema.dto.FriendshipResponse;
import com.project.cinema.dto.UserMovieListResponse;
import com.project.cinema.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friendships")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    // POST /api/friendships/request/{addresseeId}
    // Send a friend request
    @PostMapping("/request/{addresseeId}")
    public ResponseEntity<FriendshipResponse> sendRequest(
            @PathVariable Long addresseeId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(friendshipService.sendRequest(addresseeId));
    }

    // PUT /api/friendships/accept/{requesterId}
    // Accept a pending friend request
    @PutMapping("/accept/{requesterId}")
    public ResponseEntity<FriendshipResponse> acceptRequest(
            @PathVariable Long requesterId) {
        return ResponseEntity.ok(friendshipService.acceptRequest(requesterId));
    }

    // PUT /api/friendships/reject/{requesterId}
    // Reject and delete a pending friend request
    @PutMapping("/reject/{requesterId}")
    public ResponseEntity<Void> rejectRequest(
            @PathVariable Long requesterId) {
        friendshipService.rejectRequest(requesterId);
        return ResponseEntity.noContent().build(); // 204
    }

    // PUT /api/friendships/block/{userId}
    // Block a user
    @PutMapping("/block/{userId}")
    public ResponseEntity<FriendshipResponse> blockUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(friendshipService.blockUser(userId));
    }

    // DELETE /api/friendships/{userId}
    // Unfriend someone
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unfriend(@PathVariable Long userId) {
        friendshipService.unfriend(userId);
        return ResponseEntity.noContent().build(); // 204
    }

    // GET /api/friendships/me
    // Get my full friends list
    @GetMapping("/me")
    public ResponseEntity<List<FriendshipResponse>> getMyFriends() {
        return ResponseEntity.ok(friendshipService.getMyFriends());
    }

    // GET /api/friendships/pending
    // Get friend requests I have received
    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipResponse>> getPendingRequests() {
        return ResponseEntity.ok(friendshipService.getPendingRequests());
    }

    // GET /api/friendships/{userId}/lists/{listType}
    // View a friend's WATCHED / WATCHLIST / LIKED
    @GetMapping("/{userId}/lists/{listType}")
    public ResponseEntity<List<UserMovieListResponse>> getFriendList(
            @PathVariable Long userId,
            @PathVariable String listType) {
        return ResponseEntity.ok(friendshipService.getFriendList(userId, listType));
    }
}

